import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { registrarEvento } from "../lib/metricas";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();
router.use(ensureAuthenticated);

router.put("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "company") {
      return res
        .status(403)
        .json({ error: "Apenas empresas podem alterar status." });
    }

    const applicationId = String(req.params.id);
    const { status } = req.body ?? {};

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { companyId: true, title: true } } },
    });
    if (!application) {
      return res.status(404).json({ error: "Candidatura não encontrada." });
    }
    if (application.job.companyId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Você só pode avaliar candidaturas das suas vagas." });
    }

    const resultado =
      status === "approved" ? "foi aprovada" : "não foi aprovada";

    const [updatedApplication] = await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: { status },
      }),
      prisma.notification.create({
        data: {
          userId: application.candidateId,
          referenceId: application.jobId,
          message: `Sua candidatura para a vaga "${application.job.title}" ${resultado}.`,
        },
      }),
    ]);

    registrarEvento(`candidatura_${status}`);
    return res.json({
      message: "Status atualizado!",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar status." });
  }
});

router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "candidate") {
      return res
        .status(403)
        .json({ error: "Acesso restrito para candidatos." });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          include: { company: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(applications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar suas candidaturas." });
  }
});

export default router;
