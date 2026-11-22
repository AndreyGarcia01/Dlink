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

describe("GET /api/public/jobs (área pública)", () => {
  it("funciona sem login e lista só vagas ativas", async () => {
    prismaMock.job.findMany.mockResolvedValue([{ id: "j1", title: "Dev" }]);

    const res = await request(app).get("/api/public/jobs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "j1", title: "Dev" }]);
    expect(prismaMock.job.findMany.mock.calls[0][0].where).toEqual({
      status: "active",
    });
  });

  it("não expõe candidaturas nem dados privados (RN09)", async () => {
    prismaMock.job.findMany.mockResolvedValue([]);

    await request(app).get("/api/public/jobs");

    const select = prismaMock.job.findMany.mock.calls[0][0].select;
    expect(select.applications).toBeUndefined();
    expect(select.companyId).toBeUndefined();
    expect(select.company).toEqual({ select: { name: true, sector: true } });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findMany.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).get("/api/public/jobs");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/public/contents (direitos trabalhistas)", () => {
  it("lista os conteúdos sem login", async () => {
    prismaMock.contentArticle.findMany.mockResolvedValue([
      { id: "c1", title: "Lei de Cotas", body: "...", transcript: "..." },
    ]);

    const res = await request(app).get("/api/public/contents");

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Lei de Cotas");
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.contentArticle.findMany.mockRejectedValue(
      new Error("banco fora"),
    );

    const res = await request(app).get("/api/public/contents");

    expect(res.status).toBe(500);
  });
});
