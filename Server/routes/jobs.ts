import { Router, Response } from "express";
import prisma from "../lib/prisma";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();

// LISTAR VAGAS
router.get(
  "/",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      const jobs = await prisma.job.findMany({
        where: { status: "active" },
        include: {
          company: { select: { name: true, sector: true } },
          accessibilities: true,
          // Se for candidato, busca as candidaturas dele para essas vagas
          applications:
            req.user?.role === "candidate"
              ? {
                  where: { candidateId: req.user.id },
                }
              : false,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json(jobs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar vagas." });
    }
  },
);

// ==========================================
// CRIAR VAGA (Apenas Empresa logada - RF11)
// ==========================================
router.post(
  "/",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      // Verifica se quem está criando é realmente uma empresa
      if (req.user?.role !== "company") {
        return res
          .status(403)
          .json({ error: "Apenas empresas podem publicar vagas." });
      }

      const {
        title,
        description,
        requirements,
        location,
        workRegion,
        category,
      } = req.body;

      if (!title || !description || !requirements || !location || !workRegion) {
        return res
          .status(400)
          .json({ error: "Preencha todos os campos obrigatórios." });
      }

      const job = await prisma.job.create({
        data: {
          companyId: req.user.id,
          title,
          description,
          requirements,
          location,
          workRegion,
          category: category || "Geral",
          status: "active",
        },
      });

      return res
        .status(201)
        .json({ message: "Vaga publicada com sucesso!", job });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar vaga." });
    }
  },
);

// ==========================================
// CANDIDATAR-SE A UMA VAGA (RF17)
// ==========================================
router.post(
  "/:id/apply",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      // Forçando o TS a entender que o ID é uma string
      const jobId = String(req.params.id);

      // Como o ensureAuthenticated já rodou, sabemos que o user existe. O "!" garante isso pro TS.
      const candidateId = req.user!.id;

      if (req.user?.role !== "candidate") {
        return res
          .status(403)
          .json({ error: "Apenas candidatos podem se candidatar." });
      }

      // Verifica se já se candidatou (RN04)
      const existingApplication = await prisma.application.findUnique({
        where: {
          candidateId_jobId: { candidateId: candidateId, jobId },
        },
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ error: "Você já se candidatou a esta vaga." });
      }

      // Cria a candidatura
      const application = await prisma.application.create({
        data: {
          candidateId: candidateId,
          jobId: jobId,
          status: "pending", // Status inicial
        },
      });

      return res
        .status(201)
        .json({ message: "Candidatura realizada com sucesso!", application });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao realizar candidatura." });
    }
  },
);
// ==========================================
// LISTAR VAGAS DA EMPRESA LOGADA
// ==========================================
router.get(
  "/company/me",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "company") {
        return res
          .status(403)
          .json({ error: "Acesso restrito para empresas." });
      }

      const jobs = await prisma.job.findMany({
        where: { companyId: req.user.id },
        include: {
          _count: {
            select: { applications: true }, // Conta quantos se candidataram
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json(jobs);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar vagas da empresa." });
    }
  },
);

// ==========================================
// BUSCAR CANDIDATOS DE UMA VAGA
// ==========================================
router.get(
  "/:id/candidates",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "company") {
        return res.status(403).json({ error: "Acesso restrito." });
      }
      const jobId = String(req.params.id);

      // Busca as candidaturas, trazendo os dados do candidato e do perfil dele
      const applications = await prisma.application.findMany({
        where: { jobId: jobId },
        include: {
          candidate: {
            include: { candidateProfile: true }, // Traz bio, habilidades, etc.
          },
        },
      });

      return res.json(applications);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar candidatos." });
    }
  },
);

export default router;
