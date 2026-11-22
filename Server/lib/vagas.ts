export const RECURSOS_ACESSIBILIDADE = [
  "Intérprete de Libras",
  "Comunicação por texto ou chat",
  "Treinamento acessível",
  "Sinalização visual",
  "Equipe com noções de Libras",
  "Vídeos com legenda",
] as const;

export const STATUS_RECURSO = ["available", "in_progress"] as const;

type RecursoVaga = { resource: string; status: string };

export interface DadosVaga {
  title: string;
  description: string;
  requirements: string;
  location: string;
  workRegion: string;
  category: string;
}

type Resultado =
  | { erro: string }
  | { dados: DadosVaga; recursos: RecursoVaga[] };

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

export function lerDadosDaVaga(body: unknown): Resultado {
  const b = (body ?? {}) as Record<string, unknown>;
  const dados: DadosVaga = {
    title: texto(b.title),
    description: texto(b.description),
    requirements: texto(b.requirements),
    location: texto(b.location),
    workRegion: texto(b.workRegion),
    category: texto(b.category) || "Geral",
  };

  if (
    !dados.title ||
    !dados.description ||
    !dados.requirements ||
    !dados.location ||
    !dados.workRegion
  ) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const lista = b.accessibilities ?? [];
  if (!Array.isArray(lista)) {
    return { erro: "Recursos de acessibilidade inválidos." };
  }

  const recursos: RecursoVaga[] = [];
  for (const item of lista) {
    const resource = texto((item as RecursoVaga)?.resource);
    const status = texto((item as RecursoVaga)?.status) || "available";
    const recursoValido = (
      RECURSOS_ACESSIBILIDADE as readonly string[]
    ).includes(resource);
    const statusValido = (STATUS_RECURSO as readonly string[]).includes(status);
    if (!recursoValido || !statusValido) {
      return { erro: "Recursos de acessibilidade inválidos." };
    }

    if (!recursos.some((r) => r.resource === resource)) {
      recursos.push({ resource, status });
    }
  }

  return { dados, recursos };
}
