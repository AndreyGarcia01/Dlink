import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { registrarEvento } from "../lib/metricas";
import { lerDadosDaVaga } from "../lib/vagas";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();

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

router.post(
  "/",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "company") {
        return res
          .status(403)
          .json({ error: "Apenas empresas podem publicar vagas." });
      }

      const lido = lerDadosDaVaga(req.body);
      if ("erro" in lido) {
        return res.status(400).json({ error: lido.erro });
      }

      const job = await prisma.job.create({
        data: {
          companyId: req.user.id,
          ...lido.dados,
          status: "active",

          accessibilities: { create: lido.recursos },
        },
        include: { accessibilities: true },
      });

      registrarEvento("vaga_publicada");
      return res
        .status(201)
        .json({ message: "Vaga publicada com sucesso!", job });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar vaga." });
    }
  },
);

router.put(
  "/:id",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "company") {
        return res
          .status(403)
          .json({ error: "Apenas empresas podem editar vagas." });
      }
      const jobId = String(req.params.id);

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        return res.status(404).json({ error: "Vaga não encontrada." });
      }
      if (job.companyId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Você não tem permissão para editar esta vaga." });
      }

      const lido = lerDadosDaVaga(req.body);
      if ("erro" in lido) {
        return res.status(400).json({ error: lido.erro });
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          ...lido.dados,
          accessibilities: { deleteMany: {}, create: lido.recursos },
        },
        include: { accessibilities: true },
      });

      registrarEvento("vaga_editada");
      return res.json({
        message: "Vaga atualizada com sucesso!",
        job: updatedJob,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao editar vaga." });
    }
  },
);

router.post(
  "/:id/apply",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      const jobId = String(req.params.id);
      const candidateId = req.user!.id;

      const { requiresInterpreter } = req.body ?? {};

      if (req.user?.role !== "candidate") {
        return res
          .status(403)
          .json({ error: "Apenas candidatos podem se candidatar." });
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, companyId: true, status: true },
      });
      if (!job) {
        return res.status(404).json({ error: "Vaga não encontrada." });
      }
      if (job.status !== "active") {
        return res
          .status(400)
          .json({
            error: "Esta vaga foi encerrada e não recebe mais candidaturas.",
          });
      }

      const existingApplication = await prisma.application.findUnique({
        where: { candidateId_jobId: { candidateId: candidateId, jobId } },
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ error: "Você já se candidatou a esta vaga." });
      }

      const candidato = await prisma.user.findUnique({
        where: { id: candidateId },
        select: { name: true },
      });
      const precisaInterprete = requiresInterpreter === true;
      const mensagem =
        `Nova candidatura de ${candidato?.name ?? "um candidato"} para a vaga "${job.title}"` +
        (precisaInterprete ? " — precisa de intérprete de Libras." : ".");

      const [application] = await prisma.$transaction([
        prisma.application.create({
          data: {
            candidateId: candidateId,
            jobId: jobId,
            requiresInterpreter: precisaInterprete,
            status: "pending",
          },
        }),
        prisma.notification.create({
          data: {
            userId: job.companyId,
            referenceId: job.id,
            message: mensagem,
          },
        }),
      ]);

      registrarEvento(
        precisaInterprete ? "candidatura_com_interprete" : "candidatura",
      );
      return res
        .status(201)
        .json({ message: "Candidatura realizada com sucesso!", application });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao realizar candidatura." });
    }
  },
);

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
          accessibilities: true,
          _count: {
            select: { applications: true },
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

router.get(
  "/:id/candidates",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "company") {
        return res.status(403).json({ error: "Acesso restrito." });
      }
      const jobId = String(req.params.id);

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        return res.status(404).json({ error: "Vaga não encontrada." });
      }
      if (job.companyId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Você só pode ver candidatos das suas vagas." });
      }

      const applications = await prisma.application.findMany({
        where: { jobId: jobId },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              hearingLossLevel: true,
              communicationPreference: true,
              candidateProfile: true,
            },
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

router.patch(
  "/:id/close",
  ensureAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      const jobId = String(req.params.id);
      const companyId = req.user?.id;

      if (req.user?.role !== "company") {
        return res
          .status(403)
          .json({ error: "Apenas empresas podem encerrar vagas." });
      }

      const job = await prisma.job.findUnique({ where: { id: jobId } });

      if (!job) {
        return res.status(404).json({ error: "Vaga não encontrada." });
      }
      if (job.companyId !== companyId) {
        return res
          .status(403)
          .json({ error: "Você não tem permissão para encerrar esta vaga." });
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: { status: "closed" },
      });

      registrarEvento("vaga_encerrada");
      return res.json({
        message: "Vaga encerrada com sucesso!",
        job: updatedJob,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao encerrar vaga." });
    }
  },
);

export default router;
