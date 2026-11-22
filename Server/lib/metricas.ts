import { Request, Response, NextFunction } from "express";
import client from "prom-client";

export const registro = new client.Registry();

client.collectDefaultMetrics({ register: registro, prefix: "dlink_" });

const duracaoRequisicao = new client.Histogram({
  name: "dlink_http_request_duration_seconds",
  help: "Tempo de resposta das requisições HTTP (segundos)",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registro],
});

export const eventosNegocio = new client.Counter({
  name: "dlink_eventos_negocio_total",
  help: "Eventos de negócio (cadastros, vagas publicadas, candidaturas...)",
  labelNames: ["evento"],
  registers: [registro],
});

export function registrarEvento(evento: string) {
  eventosNegocio.inc({ evento });
}

export function medirRequisicoes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const terminar = duracaoRequisicao.startTimer();
  res.on("finish", () => {
    const rota = req.route?.path
      ? `${req.baseUrl}${req.route.path}`
      : "rota_nao_encontrada";
    terminar({
      method: req.method,
      route: rota,
      status: String(res.statusCode),
    });
  });
  next();
}

export async function exporMetricas(_req: Request, res: Response) {
  res.set("Content-Type", registro.contentType);
  res.end(await registro.metrics());
}
