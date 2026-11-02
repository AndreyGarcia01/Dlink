import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import jobsRoutes from "./routes/jobs";
import applicationRoutes from "./routes/applications";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend do D-Link está rodando!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});
