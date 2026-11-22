import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { prismaMock, authHeader } from "./helpers";

vi.mock("../lib/prisma", async () => ({
  default: (await import("./helpers")).prismaMock,
}));

import app from "../app";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /metrics (observabilidade)", () => {
  it("expõe as métricas no formato do Prometheus", async () => {
    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
    expect(res.text).toContain("dlink_process_cpu_user_seconds_total");
  });

  it("mede as requisições pela rota, sem o id na URL", async () => {
    prismaMock.job.findUnique.mockResolvedValue(null);
    await request(app).get("/api/health");
    await request(app)
      .patch("/api/jobs/abc-123/close")
      .set(authHeader("company"));

    const res = await request(app).get("/metrics");

    expect(res.text).toMatch(
      /dlink_http_request_duration_seconds_count\{method="GET",route="\/api\/health",status="200"\} \d+/,
    );
    expect(res.text).toContain('route="/api/jobs/:id/close",status="404"');
    expect(res.text).not.toContain("abc-123");
  });

  it("agrupa URLs desconhecidas numa série só", async () => {
    await request(app).get("/api/nao-existe");

    const res = await request(app).get("/metrics");

    expect(res.text).toContain('route="rota_nao_encontrada",status="404"');
  });

  it("conta eventos de negócio (ex.: vaga publicada)", async () => {
    prismaMock.job.create.mockResolvedValue({ id: "j1" });
    await request(app).post("/api/jobs").set(authHeader("company")).send({
      title: "Dev",
      description: "x",
      requirements: "x",
      location: "Joinville",
      workRegion: "Remoto",
    });

    const res = await request(app).get("/metrics");

    expect(res.text).toMatch(
      /dlink_eventos_negocio_total\{evento="vaga_publicada"\} [1-9]/,
    );
  });
});
