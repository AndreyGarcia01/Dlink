import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { prismaMock } from "./helpers";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("limite de requisições (rate limiting)", () => {
  it("bloqueia força bruta: a 21ª tentativa de login em 15 min recebe 429", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const tentar = () =>
      request(app)
        .post("/api/auth/login")
        .send({ email: "alvo@email.com", password: "chute" });

    for (let i = 0; i < 20; i++) {
      const res = await tentar();
      expect(res.status).toBe(401);
    }

    const bloqueada = await tentar();
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.body.error).toMatch(/Muitas tentativas/);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(20);
  });

  it("informa ao cliente quanto do limite ainda resta", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.headers["ratelimit-policy"]).toBeDefined();
  });

  it("limita toda a API em 300 requisições por IP a cada 15 min", async () => {
    for (let i = 0; i < 278; i++) {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
    }

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/Muitas requisições/);
  });
});
