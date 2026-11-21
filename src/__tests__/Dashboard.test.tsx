import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../componentes/Dashboard";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

const vagas = [
  {
    id: "j1",
    title: "Desenvolvedor Front-end",
    description: "React e acessibilidade",
    location: "Joinville",
    workRegion: "Remoto",
    category: "TI",
    company: { name: "Tech SC" },
    applications: [],
  },
  {
    id: "j2",
    title: "Auxiliar Administrativo",
    description: "Rotinas de escritório",
    location: "Blumenau",
    workRegion: "Presencial",
    category: "Administração",
    company: { name: "Loja X" },
    applications: [{ id: "a1" }],
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.get).mockImplementation(async (url: string) => ({
    data: url === "/jobs" ? vagas : [],
  }));
});

function renderDashboard() {
  render(
    <Dashboard
      userName="Maria"
      userEmail="maria@email.com"
      onLogout={vi.fn()}
      onUpdateName={vi.fn()}
    />,
  );
  return userEvent.setup();
}

describe("Dashboard do candidato — busca e filtros (RF14/RF16)", () => {
  it("mostra todas as vagas e marca a que já tem candidatura", async () => {
    renderDashboard();

    expect(await screen.findByText("Desenvolvedor Front-end")).toBeInTheDocument();
    expect(screen.getByText("Auxiliar Administrativo")).toBeInTheDocument();
    expect(screen.getByText("2 vagas encontradas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Candidatado/ })).toBeDisabled();
  });

  it("filtra pela busca de texto", async () => {
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.type(screen.getByLabelText("Buscar vagas"), "react");

    expect(screen.getByText("1 vagas encontradas")).toBeInTheDocument();
    expect(screen.queryByText("Auxiliar Administrativo")).not.toBeInTheDocument();
  });

  it("abre os filtros e filtra por localidade", async () => {
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.click(screen.getByRole("button", { name: /Filtros/ }));
    const painel = document.getElementById("painel-filtros")!;
    await user.selectOptions(within(painel).getByLabelText("Localidade"), "Blumenau");

    expect(screen.getByText("Auxiliar Administrativo")).toBeInTheDocument();
    expect(screen.queryByText("Desenvolvedor Front-end")).not.toBeInTheDocument();
  });

  it("mostra estado vazio e limpa os filtros", async () => {
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.type(screen.getByLabelText("Buscar vagas"), "astronauta");
    expect(screen.getByText("Nenhuma vaga com esses filtros")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByText("2 vagas encontradas")).toBeInTheDocument();
  });
});
