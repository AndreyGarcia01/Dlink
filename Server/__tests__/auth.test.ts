import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prismaMock } from "./helpers";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/auth/register", () => {
  const candidato = {
    name: "Maria",
    email: "maria@email.com",
    password: "123456",
    role: "candidate",
    hearingLossLevel: "Profundo",
    communicationPreference: "Libras",
    cnpj: "00.000.000/0001-00",
  };

  it("exige nome, e-mail, senha e perfil", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@a.com" });

    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("exige senha com no mínimo 6 caracteres", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...candidato, password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 caracteres/);
  });

  it("não deixa cadastrar e-mail repetido", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "1" });

    const res = await request(app).post("/api/auth/register").send(candidato);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/já está cadastrado/);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("cria candidato com senha criptografada e sem dados de empresa", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: "u1",
      ...data,
    }));

    const res = await request(app).post("/api/auth/register").send(candidato);

    expect(res.status).toBe(201);
    const data = prismaMock.user.create.mock.calls[0][0].data;
    expect(data.passwordHash).not.toBe("123456");
    expect(await bcrypt.compare("123456", data.passwordHash)).toBe(true);
    expect(data.hearingLossLevel).toBe("Profundo");
    expect(data.cnpj).toBeNull();

    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("cria empresa sem dados de candidato", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: "u2",
      ...data,
    }));

    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...candidato, role: "company", sector: "Tecnologia" });

    expect(res.status).toBe(201);
    const data = prismaMock.user.create.mock.calls[0][0].data;
    expect(data.cnpj).toBe("00.000.000/0001-00");
    expect(data.sector).toBe("Tecnologia");
    expect(data.hearingLossLevel).toBeNull();
    expect(data.communicationPreference).toBeNull();
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app).post("/api/auth/register").send(candidato);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/auth/login", () => {
  const senhaHash = bcrypt.hashSync("123456", 4);
  const usuario = {
    id: "u1",
    name: "Maria",
    email: "maria@email.com",
    role: "candidate",
    passwordHash: senhaHash,
  };

  it("exige e-mail e senha", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
  });

  it("recusa e-mail que não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@x.com", password: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Credenciais inválidas.");
  });

  it("recusa senha errada", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuario);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: usuario.email, password: "senha-errada" });

    expect(res.status).toBe(401);
  });

  it("devolve token válido e usuário sem a senha", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuario);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: usuario.email, password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.user.passwordHash).toBeUndefined();
    const payload = jwt.verify(
      res.body.token,
      process.env.JWT_SECRET as string,
    ) as { id: string; role: string };
    expect(payload).toMatchObject({ id: "u1", role: "candidate" });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error("banco fora"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: usuario.email, password: "123456" });

    expect(res.status).toBe(500);
  });
});

describe("configuração", () => {
  it("não sobe sem JWT_SECRET", async () => {
    vi.resetModules();
    vi.stubEnv("JWT_SECRET", "");

    await expect(import("../routes/auth")).rejects.toThrow(/JWT_SECRET/);

    vi.unstubAllEnvs();
  });
});
