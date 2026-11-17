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

    // 1. Buscar a candidatura e a empresa dona da vaga
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { companyId: true } } },
    });

    if (!application) {
      return res.status(404).json({ error: "Candidatura não encontrada." });
    }

    // 2. SEGURANÇA: Verificar se a empresa logada é a dona da vaga
    if (application.job.companyId !== req.user.id) {
      return res.status(403).json({
        error: "Você não tem permissão para alterar esta candidatura.",
      });
    }

    // 3. REGRA DE NEGÓCIO: Impedir alteração se já foi avaliada
    if (application.status !== "pending") {
      return res.status(400).json({
        error: "Esta candidatura já foi avaliada e não pode ser alterada.",
      });
    }

    // 4. Se passou por tudo, atualiza no banco
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return res.json({
      message: "Status atualizado com sucesso!",
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
