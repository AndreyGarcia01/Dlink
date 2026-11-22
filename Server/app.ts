import express from "express";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import jobsRoutes from "./routes/jobs";
import applicationRoutes from "./routes/applications";
import notificationRoutes from "./routes/notifications";
import publicRoutes from "./routes/public";
import { medirRequisicoes, exporMetricas } from "./lib/metricas";
import { limiteGeral, limiteAutenticacao } from "./lib/limites";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", "loopback");

app.use(express.json());
app.use(medirRequisicoes);

app.get("/metrics", exporMetricas);

app.use("/api", limiteGeral);
app.use("/api/auth", limiteAutenticacao);
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", message: "Backend do D-Link está rodando!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/public", publicRoutes);

export default app;
