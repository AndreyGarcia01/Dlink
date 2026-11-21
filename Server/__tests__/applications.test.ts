import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { prismaMock, authHeader } from "./helpers";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

const empresa = authHeader("company");
const candidato = authHeader("candidate");

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("PUT /api/applications/:id/status", () => {
  it("só empresa pode alterar o status", async () => {
    const res = await request(app)
      .put("/api/applications/a1/status")
      .set(candidato)
      .send({ status: "approved" });

    expect(res.status).toBe(403);
  });

  it("aceita só 'approved' ou 'rejected'", async () => {
    const res = await request(app)
      .put("/api/applications/a1/status")
      .set(empresa)
      .send({ status: "qualquer" });

    expect(res.status).toBe(400);
    expect(prismaMock.application.update).not.toHaveBeenCalled();
  });

  it("devolve 404 se a candidatura não existe", async () => {
    prismaMock.application.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/applications/a1/status")
      .set(empresa)
      .send({ status: "approved" });

    expect(res.status).toBe(404);
    expect(prismaMock.application.update).not.toHaveBeenCalled();
  });

  it("não deixa uma empresa avaliar candidatura da vaga de outra (RN10)", async () => {
    prismaMock.application.findUnique.mockResolvedValue({
      id: "a1",
      job: { companyId: "outra" },
    });

    const res = await request(app)
      .put("/api/applications/a1/status")
      .set(empresa)
      .send({ status: "approved" });

    expect(res.status).toBe(403);
    expect(prismaMock.application.update).not.toHaveBeenCalled();
  });

  it("atualiza o status da candidatura da própria vaga", async () => {
    prismaMock.application.findUnique.mockResolvedValue({
      id: "a1",
      job: { companyId: "company-1" },
    });
    prismaMock.application.update.mockResolvedValue({
      id: "a1",
      status: "approved",
    });

    const res = await request(app)
      .put("/api/applications/a1/status")
      .set(empresa)
      .send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe("approved");
    expect(prismaMock.application.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: { status: "approved" },
    });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.application.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app)
      .put("/api/applications/a1/status")
      .set(empresa)
      .send({ status: "rejected" });

    expect(res.status).toBe(500);
  });
});

describe("GET /api/applications/me", () => {
  it("é restrito a candidatos", async () => {
    const res = await request(app).get("/api/applications/me").set(empresa);

    expect(res.status).toBe(403);
  });

  it("lista as candidaturas do candidato logado", async () => {
    prismaMock.application.findMany.mockResolvedValue([{ id: "a1" }]);

    const res = await request(app).get("/api/applications/me").set(candidato);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "a1" }]);
    expect(prismaMock.application.findMany.mock.calls[0][0].where).toEqual({
      candidateId: "candidate-1",
    });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.application.findMany.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).get("/api/applications/me").set(candidato);

    expect(res.status).toBe(500);
  });
});
