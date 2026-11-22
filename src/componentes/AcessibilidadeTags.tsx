import type { RecursoAcessibilidade } from "../constantes/acessibilidade";

interface Props {
  recursos?: RecursoAcessibilidade[];
}

export default function AcessibilidadeTags({ recursos }: Props) {
  if (!recursos || recursos.length === 0) {
    return (
      <p className="acess-vazio">
        Acessibilidade: a empresa não informou recursos.
      </p>
    );
  }
  return (
    <ul className="acess-tags" aria-label="Recursos de acessibilidade">
      {recursos.map((r) => (
        <li
          key={r.resource}
          className={`acess-tag ${r.status === "in_progress" ? "em-implantacao" : ""}`}
        >
          {r.status === "in_progress" ? "⏳" : "✓"} {r.resource}
          {r.status === "in_progress" && " (em implantação)"}
        </li>
      ))}
    </ul>
  );
}
