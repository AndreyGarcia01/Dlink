import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { prismaMock, authHeader } from "./helpers";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

const semId = {
  Authorization: `Bearer ${jwt.sign({ role: "candidate" }, process.env.JWT_SECRET as string)}`,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/profile/me", () => {
  it("devolve o perfil do usuário logado sem a senha", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "candidate-1",
      name: "Maria",
      passwordHash: "hash-secreto",
    });

    const res = await request(app)
      .get("/api/profile/me")
      .set(authHeader("candidate"));

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Maria");
    expect(res.body.passwordHash).toBeUndefined();
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "candidate-1" } }),
    );
  });

  it("devolve 404 se o usuário não existe mais", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/profile/me")
      .set(authHeader("candidate"));

    expect(res.status).toBe(404);
  });

  it("devolve 401 se o token não tem id", async () => {
    const res = await request(app).get("/api/profile/me").set(semId);

    expect(res.status).toBe(401);
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app)
      .get("/api/profile/me")
      .set(authHeader("candidate"));

    expect(res.status).toBe(500);
  });
});

describe("PUT /api/profile/me", () => {
  it("atualiza dados da empresa sem mexer no perfil de candidato", async () => {
    prismaMock.user.update.mockResolvedValue({
      id: "company-1",
      sector: "Varejo",
      passwordHash: "hash-secreto",
    });

    const res = await request(app)
      .put("/api/profile/me")
      .set(authHeader("company"))
      .send({ name: "Loja X", sector: "Varejo", bio: "não é candidato" });

    expect(res.status).toBe(200);
    expect(res.body.user.sector).toBe("Varejo");
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(prismaMock.candidateProfile.upsert).not.toHaveBeenCalled();
  });

  it("salva bio e junta a lista de habilidades em texto", async () => {
    prismaMock.user.update.mockResolvedValue({ id: "candidate-1" });
    prismaMock.candidateProfile.upsert.mockResolvedValue({});

    const res = await request(app)
      .put("/api/profile/me")
      .set(authHeader("candidate"))
      .send({ bio: "Dev", skills: ["React", "Node"] });

    expect(res.status).toBe(200);
    const args = prismaMock.candidateProfile.upsert.mock.calls[0][0];
    expect(args.update).toEqual({ bio: "Dev", skills: "React, Node" });
    expect(args.create.userId).toBe("candidate-1");
  });

  it("aceita habilidades já em texto", async () => {
    prismaMock.user.update.mockResolvedValue({ id: "candidate-1" });
    prismaMock.candidateProfile.upsert.mockResolvedValue({});

    await request(app)
      .put("/api/profile/me")
      .set(authHeader("candidate"))
      .send({ skills: "React" });

    const args = prismaMock.candidateProfile.upsert.mock.calls[0][0];
    expect(args.update.skills).toBe("React");
  });

  it("salva experiência, formação e link do vídeo em Libras", async () => {
    prismaMock.user.update.mockResolvedValue({ id: "candidate-1" });
    prismaMock.candidateProfile.upsert.mockResolvedValue({});

    const res = await request(app)
      .put("/api/profile/me")
      .set(authHeader("candidate"))
      .send({
        experience: "Estágio em TI",
        education: "Engenharia de Software",
        videoUrl: "https://youtu.be/abc",
      });

    expect(res.status).toBe(200);
    const args = prismaMock.candidateProfile.upsert.mock.calls[0][0];
    expect(args.update).toMatchObject({
      experience: "Estágio em TI",
      education: "Engenharia de Software",
      videoUrl: "https://youtu.be/abc",
    });
  });

  it("remove o vídeo quando o link vem vazio", async () => {
    prismaMock.user.update.mockResolvedValue({ id: "candidate-1" });
    prismaMock.candidateProfile.upsert.mockResolvedValue({});

    await request(app)
      .put("/api/profile/me")
      .set(authHeader("candidate"))
      .send({ videoUrl: "" });

    const args = prismaMock.candidateProfile.upsert.mock.calls[0][0];
    expect(args.update.videoUrl).toBeNull();
  });

  it("recusa link de vídeo que não é http(s)", async () => {
    const res = await request(app)
      .put("/api/profile/me")
      .set(authHeader("candidate"))
      .send({ videoUrl: "javascript:alert(1)" });

    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("devolve 401 se o token não tem id", async () => {
    const res = await request(app).put("/api/profile/me").set(semId).send({});

    expect(res.status).toBe(401);
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.user.update.mockRejectedValue(new Error("banco fora"));

    const res = await request(app)
      .put("/api/profile/me")
      .set(authHeader("candidate"))
      .send({ name: "Maria" });

    expect(res.status).toBe(500);
  });
});
