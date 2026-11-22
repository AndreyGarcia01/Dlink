import express from "express";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import jobsRoutes from "./routes/jobs";
import applicationRoutes from "./routes/applications";
import { medirRequisicoes, exporMetricas } from "./lib/metricas";

const app = express();

// Não anuncia "X-Powered-By: Express" (não dá pista da tecnologia para atacantes)
app.disable("x-powered-by");

// Sem CORS: o site e a API ficam no mesmo endereço (na EC2 o Nginx repassa /api;
// no desenvolvimento o Vite faz o mesmo), então nenhum outro site precisa
// chamar esta API pelo navegador.
app.use(express.json());
app.use(medirRequisicoes);

// Métricas para o Prometheus/Grafana. Fica fora de /api de propósito: o Nginx só
// repassa /api para a internet, então /metrics só é acessível de dentro da EC2.
app.get("/metrics", exporMetricas);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", message: "Backend do D-Link está rodando!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);

export default app;
