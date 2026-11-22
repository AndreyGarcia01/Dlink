import { rateLimit } from "express-rate-limit";

const QUINZE_MINUTOS = 15 * 60 * 1000;

function limitador(limite: number, mensagem: string) {
  return rateLimit({
    windowMs: QUINZE_MINUTOS,
    limit: limite,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: mensagem },
  });
}

export const limiteGeral = limitador(
  300,
  "Muitas requisições. Aguarde alguns minutos e tente de novo.",
);

export const limiteAutenticacao = limitador(
  20,
  "Muitas tentativas de login ou cadastro. Aguarde 15 minutos e tente de novo.",
);
