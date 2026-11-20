import { describe, it, expect, beforeEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import { api } from "../services/api";

// Troca o "adaptador" do axios para não fazer requisição de verdade:
// ele só devolve o cabeçalho Authorization que foi enviado.
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
});
