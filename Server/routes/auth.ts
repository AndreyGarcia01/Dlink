import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Sem chave de fallback: se o .env não carregar, a API nem sobe (mais seguro)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido no arquivo .env");
}

// ==========================================
// ROTA DE CADASTRO (POST /api/auth/register)
// ==========================================
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

    // Validações básicas
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

    // Verificar se e-mail já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar usuário no banco de dados
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

    // Separa a senha do resto dos dados (ela nunca volta para o front-end)
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

// ==========================================
// ROTA DE LOGIN (POST /api/auth/login)
// ==========================================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Comparar a senha digitada com a senha criptografada do banco
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Gerar Token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Separa a senha do resto dos dados (ela nunca volta para o front-end)
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
