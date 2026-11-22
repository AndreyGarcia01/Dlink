import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AcessibilidadeTags from "../componentes/AcessibilidadeTags";

describe("AcessibilidadeTags", () => {
  it("avisa quando a empresa não informou recursos", () => {
    render(<AcessibilidadeTags recursos={[]} />);

    expect(screen.getByText(/a empresa não informou recursos/)).toBeInTheDocument();
  });

  it("separa recurso disponível de recurso em implantação", () => {
    render(
      <AcessibilidadeTags
        recursos={[
          { resource: "Intérprete de Libras", status: "available" },
          { resource: "Vídeos com legenda", status: "in_progress" },
        ]}
      />,
    );

    expect(screen.getByRole("list", { name: "Recursos de acessibilidade" })).toBeInTheDocument();
    expect(screen.getByText("✓ Intérprete de Libras")).toBeInTheDocument();
    expect(screen.getByText(/Vídeos com legenda \(em implantação\)/)).toBeInTheDocument();
  });
});
