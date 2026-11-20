import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

describe("GET /api/health", () => {
  it("responde que a API está no ar", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});

describe("middleware de autenticação", () => {
  it("recusa requisição sem token", async () => {
    const res = await request(app).get("/api/profile/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token não fornecido.");
  });

  it("recusa token inválido", async () => {
    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", "Bearer token-falso");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token inválido ou expirado.");
  });

  it("recusa token assinado com outra chave", async () => {
    const token = jwt.sign({ id: "1", role: "candidate" }, "outra-chave");
    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});
