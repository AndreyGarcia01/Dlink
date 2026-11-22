import { Router, Response } from "express";
import prisma from "../lib/prisma";
import {
  ensureAuthenticated,
  AuthRequest,
} from "../middlewares/authMiddleware";

const router = Router();
router.use(ensureAuthenticated);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [notificacoes, naoLidas] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return res.json({ naoLidas, notificacoes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar notificações." });
  }
});

router.patch("/read-all", async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    return res.json({ message: "Notificações marcadas como lidas." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar notificações." });
  }
});

router.patch("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { id: String(req.params.id), userId: req.user!.id },
      data: { read: true },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Notificação não encontrada." });
    }
    return res.json({ message: "Notificação marcada como lida." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar notificação." });
  }
});

export default router;
