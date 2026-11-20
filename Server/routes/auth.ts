import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido no arquivo .env");
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      hearingLossLevel,
      communicationPreference,
      cnpj,
      companyDescription,
      sector,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Nome, e-mail, senha e perfil são obrigatórios." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "A senha deve ter no mínimo 6 caracteres." });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        hearingLossLevel: role === "candidate" ? hearingLossLevel : null,
        communicationPreference:
          role === "candidate" ? communicationPreference : null,
        cnpj: role === "company" ? cnpj : null,
        companyDescription: role === "company" ? companyDescription : null,
        sector: role === "company" ? sector : null,
      },
    });

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: "Conta criada com sucesso!",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor ao criar conta." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return res.json({
      message: "Login realizado com sucesso!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor ao fazer login." });
  }
});

export default router;
