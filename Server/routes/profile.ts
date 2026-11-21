import { Router, Response } from "express";
import prisma from "../lib/prisma";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();
router.use(ensureAuthenticated);

function semSenha<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...resto } = user;
  return resto;
}

function linkValido(url: unknown) {
  return typeof url === "string" && /^https?:\/\/\S+$/i.test(url);
}

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
    return res.json(semSenha(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar perfil." });
  }
});

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
      experience,
      education,
      videoUrl,
      cnpj,
      companyDescription,
      sector,
    } = req.body ?? {};

    if (videoUrl && !linkValido(videoUrl)) {
      return res.status(400).json({
        error: "O link do vídeo deve começar com http:// ou https://.",
      });
    }

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

    const enviouPerfil = [bio, skills, experience, education, videoUrl].some(
      (campo) => campo !== undefined,
    );
    if (req.user?.role === "candidate" && enviouPerfil) {
      const skillsString = Array.isArray(skills) ? skills.join(", ") : skills;
      const dadosPerfil = {
        bio,
        skills: skillsString,
        experience,
        education,

        videoUrl: videoUrl === "" ? null : videoUrl,
      };
      await prisma.candidateProfile.upsert({
        where: { userId: userId },
        update: dadosPerfil,
        create: { userId: userId, ...dadosPerfil },
      });
    }

    return res.json({
      message: "Perfil atualizado com sucesso!",
      user: semSenha(updatedUser),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
});

export default router;
