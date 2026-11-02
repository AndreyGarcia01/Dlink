import { Router, Response } from "express";
import prisma from "../lib/prisma";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();
router.use(ensureAuthenticated);

// BUSCAR PERFIL
router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado." });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true },
    });

    if (!user)
      return res.status(404).json({ error: "Usuário não encontrado." });
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar perfil." });
  }
});

// ATUALIZAR PERFIL (Agora aceita campos de empresa também)
router.put("/me", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado." });

    const {
      name,
      hearingLossLevel,
      communicationPreference,
      bio,
      skills,
      cnpj,
      companyDescription,
      sector,
    } = req.body;

    // Atualiza os dados básicos do usuário (sejam de candidato ou empresa)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        hearingLossLevel,
        communicationPreference,
        cnpj,
        companyDescription,
        sector,
      },
    });

    // Se for candidato e enviou bio/skills, atualiza o perfil dele
    if (bio || skills) {
      const skillsString = Array.isArray(skills) ? skills.join(", ") : skills;
      await prisma.candidateProfile.upsert({
        where: { userId: userId },
        update: { bio, skills: skillsString },
        create: { userId: userId, bio, skills: skillsString },
      });
    }

    return res.json({
      message: "Perfil atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
});

export default router;
