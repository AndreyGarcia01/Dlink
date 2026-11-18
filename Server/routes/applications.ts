import { Router, Response } from "express";
import prisma from "../lib/prisma";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();
router.use(ensureAuthenticated);

// ATUALIZAR STATUS DA CANDIDATURA (Aprovar ou Rejeitar)
router.put("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "company") {
      return res
        .status(403)
        .json({ error: "Apenas empresas podem alterar status." });
    }

    const applicationId = String(req.params.id);
    const { status } = req.body; // 'approved' ou 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return res.json({
      message: "Status atualizado!",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar status." });
  }
});

// BUSCAR CANDIDATURAS DO CANDIDATO LOGADO
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
