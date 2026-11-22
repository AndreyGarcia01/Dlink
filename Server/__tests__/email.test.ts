import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatoValido,
  dominioRecebeEmail,
  verificarEmail,
  type ResolvedorMx,
} from "../lib/email";

function resolvedor(resposta: () => Promise<{ exchange: string }[]>) {
  return { resolveMx: vi.fn(resposta) } satisfies ResolvedorMx;
}

function erroDns(code: string) {
  return Object.assign(new Error(code), { code });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("formatoValido", () => {
  it.each(["maria@gmail.com", "ana.souza@empresa.com.br", "a+vagas@x.io"])(
    "aceita %s",
    (email) => {
      expect(formatoValido(email)).toBe(true);
    },
  );

  it.each([
    "maria.gmail.com",
    "@gmail.com",
    "maria@",
    "maria@gmail",
    "maria@gmail.",
    "maria@.com",
    "ma ria@gmail.com",
    "maria@@gmail.com",
    `${"a".repeat(250)}@x.com`,
  ])("recusa %s", (email) => {
    expect(formatoValido(email)).toBe(false);
  });
});

describe("dominioRecebeEmail", () => {
  it("aceita domínio com servidor de e-mail (MX)", async () => {
    const dns = resolvedor(async () => [{ exchange: "mx.gmail.com" }]);

    expect(await dominioRecebeEmail("gmail.com", dns)).toBe(true);
    expect(dns.resolveMx).toHaveBeenCalledWith("gmail.com");
  });

  it("recusa domínio com MX nulo (que declara não aceitar e-mails)", async () => {
    const dns = resolvedor(async () => [{ exchange: "" }]);

    expect(await dominioRecebeEmail("exemplo.com", dns)).toBe(false);
  });

  it.each(["ENOTFOUND", "ENODATA"])(
    "recusa quando o DNS responde %s",
    async (code) => {
      const dns = resolvedor(() => Promise.reject(erroDns(code)));

      expect(await dominioRecebeEmail("asdkjasd.com", dns)).toBe(false);
    },
  );

  it("deixa passar quando o DNS está fora do ar, para não travar o cadastro", async () => {
    const dns = resolvedor(() => Promise.reject(erroDns("ETIMEOUT")));

    expect(await dominioRecebeEmail("gmail.com", dns)).toBe(true);
    expect(console.error).toHaveBeenCalled();
  });
});

describe("verificarEmail", () => {
  it("nem consulta o DNS se o formato estiver errado", async () => {
    const dns = resolvedor(async () => [{ exchange: "mx.gmail.com" }]);

    expect(await verificarEmail("maria.gmail.com", dns)).toBe("formato");
    expect(dns.resolveMx).not.toHaveBeenCalled();
  });

  it("consulta o domínio em minúsculas", async () => {
    const dns = resolvedor(async () => [{ exchange: "mx.gmail.com" }]);

    expect(await verificarEmail("Maria@GMAIL.com", dns)).toBe("ok");
    expect(dns.resolveMx).toHaveBeenCalledWith("gmail.com");
  });

  it("indica domínio inválido", async () => {
    const dns = resolvedor(() => Promise.reject(erroDns("ENOTFOUND")));

    expect(await verificarEmail("maria@asdkjasd.com", dns)).toBe("dominio");
  });
});
