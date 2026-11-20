import { vi } from "vitest";
import jwt from "jsonwebtoken";

// Prisma "de mentira": cada método é uma função mock que o teste programa
// com o retorno que quiser (mockResolvedValue / mockRejectedValue).
export const prismaMock = {
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  candidateProfile: { upsert: vi.fn() },
  job: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  application: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

// Gera um token válido igual ao que a rota de login devolve.
export function tokenPara(role: "candidate" | "company", id = `${role}-1`) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string);
}

export function authHeader(role: "candidate" | "company", id?: string) {
  return { Authorization: `Bearer ${tokenPara(role, id)}` };
}
