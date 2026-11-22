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

describe("GET /api/jobs", () => {
  it("candidato recebe as vagas ativas com as candidaturas dele", async () => {
    prismaMock.job.findMany.mockResolvedValue([{ id: "j1" }]);

    const res = await request(app).get("/api/jobs").set(candidato);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "j1" }]);
    const args = prismaMock.job.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ status: "active" });
    expect(args.include.applications).toEqual({
      where: { candidateId: "candidate-1" },
    });
  });

  it("empresa recebe as vagas sem candidaturas", async () => {
    prismaMock.job.findMany.mockResolvedValue([]);

    await request(app).get("/api/jobs").set(empresa);

    const args = prismaMock.job.findMany.mock.calls[0][0];
    expect(args.include.applications).toBe(false);
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findMany.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).get("/api/jobs").set(candidato);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/jobs", () => {
  const vaga = {
    title: "Dev Front-end",
    description: "Vaga remota",
    requirements: "React",
    location: "Joinville",
    workRegion: "Remoto",
  };

  it("só empresa pode publicar vaga", async () => {
    const res = await request(app).post("/api/jobs").set(candidato).send(vaga);

    expect(res.status).toBe(403);
    expect(prismaMock.job.create).not.toHaveBeenCalled();
  });

  it("exige os campos obrigatórios", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set(empresa)
      .send({ title: "Só título" });

    expect(res.status).toBe(400);
  });

  it("cria a vaga com categoria padrão 'Geral'", async () => {
    prismaMock.job.create.mockImplementation(async ({ data }) => ({
      id: "j1",
      ...data,
    }));

    const res = await request(app).post("/api/jobs").set(empresa).send(vaga);

    expect(res.status).toBe(201);
    expect(res.body.job).toMatchObject({
      companyId: "company-1",
      category: "Geral",
      status: "active",
    });
  });

  it("cria a vaga com os recursos de acessibilidade (RF12)", async () => {
    prismaMock.job.create.mockImplementation(async ({ data }) => data);

    await request(app)
      .post("/api/jobs")
      .set(empresa)
      .send({
        ...vaga,
        accessibilities: [
          { resource: "Intérprete de Libras", status: "available" },
          { resource: "Sinalização visual", status: "in_progress" },
          { resource: "Intérprete de Libras", status: "available" },
        ],
      });

    const recursos =
      prismaMock.job.create.mock.calls[0][0].data.accessibilities.create;

    expect(recursos).toEqual([
      { resource: "Intérprete de Libras", status: "available" },
      { resource: "Sinalização visual", status: "in_progress" },
    ]);
  });

  it("recusa recurso de acessibilidade fora da lista", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set(empresa)
      .send({
        ...vaga,
        accessibilities: [{ resource: "<script>", status: "available" }],
      });

    expect(res.status).toBe(400);
    expect(prismaMock.job.create).not.toHaveBeenCalled();
  });

  it("recusa status de recurso inválido e lista que não é array", async () => {
    const r1 = await request(app)
      .post("/api/jobs")
      .set(empresa)
      .send({
        ...vaga,
        accessibilities: [
          { resource: "Intérprete de Libras", status: "talvez" },
        ],
      });
    const r2 = await request(app)
      .post("/api/jobs")
      .set(empresa)
      .send({ ...vaga, accessibilities: "Intérprete" });

    expect(r1.status).toBe(400);
    expect(r2.status).toBe(400);
  });

  it("usa a categoria enviada", async () => {
    prismaMock.job.create.mockImplementation(async ({ data }) => data);

    const res = await request(app)
      .post("/api/jobs")
      .set(empresa)
      .send({ ...vaga, category: "TI" });

    expect(res.body.job.category).toBe("TI");
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.create.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).post("/api/jobs").set(empresa).send(vaga);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/jobs/:id/apply", () => {
  const vagaAtiva = {
    id: "j1",
    title: "Dev",
    companyId: "company-1",
    status: "active",
  };

  function prepararCandidatura() {
    prismaMock.job.findUnique.mockResolvedValue(vagaAtiva);
    prismaMock.application.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ name: "Carlos" });
    prismaMock.application.create.mockImplementation(async ({ data }) => data);
    prismaMock.notification.create.mockImplementation(async ({ data }) => data);
  }

  it("só candidato pode se candidatar", async () => {
    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(empresa)
      .send({});

    expect(res.status).toBe(403);
  });

  it("devolve 404 se a vaga não existe", async () => {
    prismaMock.job.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(candidato)
      .send({});

    expect(res.status).toBe(404);
  });

  it("não aceita candidatura em vaga encerrada", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      ...vagaAtiva,
      status: "closed",
    });

    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(candidato)
      .send({});

    expect(res.status).toBe(400);
    expect(prismaMock.application.create).not.toHaveBeenCalled();
  });

  it("não deixa se candidatar duas vezes", async () => {
    prismaMock.job.findUnique.mockResolvedValue(vagaAtiva);
    prismaMock.application.findUnique.mockResolvedValue({ id: "a1" });

    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(candidato)
      .send({});

    expect(res.status).toBe(400);
    expect(prismaMock.application.create).not.toHaveBeenCalled();
  });

  it("cria a candidatura sem intérprete por padrão e avisa a empresa (RF18)", async () => {
    prepararCandidatura();

    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(candidato)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.application).toEqual({
      candidateId: "candidate-1",
      jobId: "j1",
      requiresInterpreter: false,
      status: "pending",
    });
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "company-1",
        referenceId: "j1",
        message: 'Nova candidatura de Carlos para a vaga "Dev".',
      },
    });
  });

  it("guarda o pedido de intérprete e destaca no aviso da empresa", async () => {
    prepararCandidatura();

    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(candidato)
      .send({ requiresInterpreter: true });

    expect(res.body.application.requiresInterpreter).toBe(true);
    const aviso = prismaMock.notification.create.mock.calls[0][0].data.message;
    expect(aviso).toContain("precisa de intérprete de Libras");
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app)
      .post("/api/jobs/j1/apply")
      .set(candidato)
      .send({});

    expect(res.status).toBe(500);
  });
});

describe("PUT /api/jobs/:id (editar vaga — RF13)", () => {
  const vaga = {
    title: "Dev Pleno",
    description: "Vaga remota",
    requirements: "React",
    location: "Joinville",
    workRegion: "Remoto",
    category: "Tecnologia",
    accessibilities: [
      { resource: "Intérprete de Libras", status: "available" },
    ],
  };

  it("só empresa pode editar", async () => {
    const res = await request(app)
      .put("/api/jobs/j1")
      .set(candidato)
      .send(vaga);

    expect(res.status).toBe(403);
  });

  it("devolve 404 se a vaga não existe", async () => {
    prismaMock.job.findUnique.mockResolvedValue(null);

    const res = await request(app).put("/api/jobs/j1").set(empresa).send(vaga);

    expect(res.status).toBe(404);
  });

  it("não deixa editar vaga de outra empresa", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: "j1",
      companyId: "outra",
    });

    const res = await request(app).put("/api/jobs/j1").set(empresa).send(vaga);

    expect(res.status).toBe(403);
    expect(prismaMock.job.update).not.toHaveBeenCalled();
  });

  it("valida os campos obrigatórios na edição também", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: "j1",
      companyId: "company-1",
    });

    const res = await request(app)
      .put("/api/jobs/j1")
      .set(empresa)
      .send({ ...vaga, title: "   " });

    expect(res.status).toBe(400);
    expect(prismaMock.job.update).not.toHaveBeenCalled();
  });

  it("atualiza os dados e troca os recursos de acessibilidade", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: "j1",
      companyId: "company-1",
    });
    prismaMock.job.update.mockImplementation(async ({ data }) => ({
      id: "j1",
      ...data,
    }));

    const res = await request(app).put("/api/jobs/j1").set(empresa).send(vaga);

    expect(res.status).toBe(200);
    const args = prismaMock.job.update.mock.calls[0][0];
    expect(args.data.title).toBe("Dev Pleno");
    expect(args.data.accessibilities).toEqual({
      deleteMany: {},
      create: [{ resource: "Intérprete de Libras", status: "available" }],
    });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).put("/api/jobs/j1").set(empresa).send(vaga);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/jobs/company/me", () => {
  it("é restrito a empresas", async () => {
    const res = await request(app).get("/api/jobs/company/me").set(candidato);

    expect(res.status).toBe(403);
  });

  it("lista só as vagas da empresa logada", async () => {
    prismaMock.job.findMany.mockResolvedValue([{ id: "j1" }]);

    const res = await request(app).get("/api/jobs/company/me").set(empresa);

    expect(res.status).toBe(200);
    expect(prismaMock.job.findMany.mock.calls[0][0].where).toEqual({
      companyId: "company-1",
    });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findMany.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).get("/api/jobs/company/me").set(empresa);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/jobs/:id/candidates", () => {
  const vagaDaEmpresa = { id: "j1", companyId: "company-1" };

  it("é restrito a empresas", async () => {
    const res = await request(app)
      .get("/api/jobs/j1/candidates")
      .set(candidato);

    expect(res.status).toBe(403);
  });

  it("devolve 404 se a vaga não existe", async () => {
    prismaMock.job.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/jobs/j1/candidates").set(empresa);

    expect(res.status).toBe(404);
    expect(prismaMock.application.findMany).not.toHaveBeenCalled();
  });

  it("não deixa uma empresa ver candidatos da vaga de outra (RN07)", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: "j1",
      companyId: "outra",
    });

    const res = await request(app).get("/api/jobs/j1/candidates").set(empresa);

    expect(res.status).toBe(403);
    expect(prismaMock.application.findMany).not.toHaveBeenCalled();
  });

  it("lista as candidaturas da própria vaga sem expor a senha", async () => {
    prismaMock.job.findUnique.mockResolvedValue(vagaDaEmpresa);
    prismaMock.application.findMany.mockResolvedValue([{ id: "a1" }]);

    const res = await request(app).get("/api/jobs/j1/candidates").set(empresa);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "a1" }]);
    const args = prismaMock.application.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ jobId: "j1" });

    expect(args.include.candidate.select.passwordHash).toBeUndefined();
    expect(args.include.candidate.select.name).toBe(true);
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findUnique.mockResolvedValue(vagaDaEmpresa);
    prismaMock.application.findMany.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).get("/api/jobs/j1/candidates").set(empresa);

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/jobs/:id/close", () => {
  it("só empresa pode encerrar vaga", async () => {
    const res = await request(app).patch("/api/jobs/j1/close").set(candidato);

    expect(res.status).toBe(403);
  });

  it("devolve 404 se a vaga não existe", async () => {
    prismaMock.job.findUnique.mockResolvedValue(null);

    const res = await request(app).patch("/api/jobs/j1/close").set(empresa);

    expect(res.status).toBe(404);
  });

  it("não deixa encerrar vaga de outra empresa", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: "j1",
      companyId: "outra",
    });

    const res = await request(app).patch("/api/jobs/j1/close").set(empresa);

    expect(res.status).toBe(403);
    expect(prismaMock.job.update).not.toHaveBeenCalled();
  });

  it("encerra a vaga da própria empresa", async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: "j1",
      companyId: "company-1",
    });
    prismaMock.job.update.mockResolvedValue({ id: "j1", status: "closed" });

    const res = await request(app).patch("/api/jobs/j1/close").set(empresa);

    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe("closed");
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.job.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).patch("/api/jobs/j1/close").set(empresa);

    expect(res.status).toBe(500);
  });
});
