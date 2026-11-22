import { vi } from "vitest";
import jwt from "jsonwebtoken";

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
  notification: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  contentArticle: { findMany: vi.fn() },

  $transaction: async (operacoes: unknown[]) => Promise.all(operacoes),
};

export function tokenPara(role: "candidate" | "company", id = `${role}-1`) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string);
}

export function authHeader(role: "candidate" | "company", id?: string) {
  return { Authorization: `Bearer ${tokenPara(role, id)}` };
}
