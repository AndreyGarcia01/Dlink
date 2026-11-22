import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/jobs", async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "active" },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        location: true,
        workRegion: true,
        category: true,
        createdAt: true,
        company: { select: { name: true, sector: true } },
        accessibilities: { select: { resource: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar vagas." });
  }
});

router.get("/contents", async (_req: Request, res: Response) => {
  try {
    const contents = await prisma.contentArticle.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        videoUrl: true,
        transcript: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return res.json(contents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar conteúdos." });
  }
});

export default router;
