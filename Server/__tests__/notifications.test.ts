import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { prismaMock, authHeader } from "./helpers";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

const empresa = authHeader("company");

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/notifications", () => {
  it("exige login", async () => {
    const res = await request(app).get("/api/notifications");

    expect(res.status).toBe(401);
  });

  it("lista só as notificações do usuário logado, com o total de não lidas", async () => {
    prismaMock.notification.findMany.mockResolvedValue([
      { id: "n1", message: "Oi" },
    ]);
    prismaMock.notification.count.mockResolvedValue(1);

    const res = await request(app).get("/api/notifications").set(empresa);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      naoLidas: 1,
      notificacoes: [{ id: "n1", message: "Oi" }],
    });
    expect(prismaMock.notification.findMany.mock.calls[0][0].where).toEqual({
      userId: "company-1",
    });
    expect(prismaMock.notification.count.mock.calls[0][0].where).toEqual({
      userId: "company-1",
      read: false,
    });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.notification.findMany.mockRejectedValue(new Error("banco fora"));
    prismaMock.notification.count.mockResolvedValue(0);

    const res = await request(app).get("/api/notifications").set(empresa);

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/notifications/:id/read", () => {
  it("marca como lida a notificação do próprio usuário", async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .patch("/api/notifications/n1/read")
      .set(empresa);

    expect(res.status).toBe(200);
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: { id: "n1", userId: "company-1" },
      data: { read: true },
    });
  });

  it("devolve 404 para notificação de outra pessoa (ou inexistente)", async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .patch("/api/notifications/n9/read")
      .set(empresa);

    expect(res.status).toBe(404);
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.notification.updateMany.mockRejectedValue(
      new Error("banco fora"),
    );

    const res = await request(app)
      .patch("/api/notifications/n1/read")
      .set(empresa);

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/notifications/read-all", () => {
  it("marca todas as do usuário como lidas", async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 3 });

    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set(empresa);

    expect(res.status).toBe(200);
    expect(prismaMock.notification.updateMany.mock.calls[0][0].where).toEqual({
      userId: "company-1",
      read: false,
    });
  });

  it("devolve 500 se o banco falhar", async () => {
    prismaMock.notification.updateMany.mockRejectedValue(
      new Error("banco fora"),
    );

    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set(empresa);

    expect(res.status).toBe(500);
  });
});
