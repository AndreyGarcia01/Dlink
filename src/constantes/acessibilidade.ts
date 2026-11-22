export const RECURSOS_ACESSIBILIDADE = [
  "Intérprete de Libras",
  "Comunicação por texto ou chat",
  "Treinamento acessível",
  "Sinalização visual",
  "Equipe com noções de Libras",
  "Vídeos com legenda",
];

export type StatusRecurso = "available" | "in_progress";

export interface RecursoAcessibilidade {
  resource: string;
  status: StatusRecurso | string;
}
