import { describe, it, expect, beforeEach, vi } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { api, SESSAO_EXPIRADA } from "../services/api";

beforeEach(() => {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({
    data: config.headers.Authorization ?? null,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
});

describe("api", () => {
  it("aponta para a API do backend", () => {
    expect(api.defaults.baseURL).toMatch(/\/api$/);
  });

  it("envia o token salvo no cabeçalho Authorization", async () => {
    localStorage.setItem("@DLink:token", "abc");

    const res = await api.get("/jobs");

    expect(res.data).toBe("Bearer abc");
  });

  it("não envia Authorization se não tem token", async () => {
    const res = await api.get("/jobs");

    expect(res.data).toBeNull();
  });

  describe("sessão expirada (401)", () => {
    function responderCom401() {
      api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
          data: { error: "Token inválido ou expirado." },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        });
      };
    }

    it("limpa o login guardado e avisa o App", async () => {
      localStorage.setItem("@DLink:token", "velho");
      localStorage.setItem("@DLink:user", "{}");
      const aviso = vi.fn();
      window.addEventListener(SESSAO_EXPIRADA, aviso);
      responderCom401();

      await expect(api.get("/profile/me")).rejects.toThrow();

      expect(localStorage.getItem("@DLink:token")).toBeNull();
      expect(localStorage.getItem("@DLink:user")).toBeNull();
      expect(aviso).toHaveBeenCalled();
      window.removeEventListener(SESSAO_EXPIRADA, aviso);
    });

    it("não dispara no login com senha errada (ninguém estava logado)", async () => {
      const aviso = vi.fn();
      window.addEventListener(SESSAO_EXPIRADA, aviso);
      responderCom401();

      await expect(api.post("/auth/login", {})).rejects.toThrow();

      expect(aviso).not.toHaveBeenCalled();
      window.removeEventListener(SESSAO_EXPIRADA, aviso);
    });
  });
});
