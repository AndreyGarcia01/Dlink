import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import userEvent from "@testing-library/user-event";
import Dashboard from "../componentes/Dashboard";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const vagas = [
  {
    id: "j1",
    title: "Desenvolvedor Front-end",
    description: "React e acessibilidade",
    location: "Joinville",
    workRegion: "Remoto",
    category: "TI",
    requirements: "React",
    company: { name: "Tech SC" },
    accessibilities: [{ resource: "Intérprete de Libras", status: "available" }],
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
    accessibilities: [{ resource: "Intérprete de Libras", status: "in_progress" }],
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

  it("filtra por acessibilidade: só conta recurso já disponível (RF14)", async () => {
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.click(screen.getByRole("button", { name: /Filtros/ }));
    const painel = document.getElementById("painel-filtros")!;
    await user.selectOptions(
      within(painel).getByLabelText("Acessibilidade"),
      "Intérprete de Libras",
    );

    // a vaga com intérprete "em implantação" não entra no filtro
    expect(screen.getByText("Desenvolvedor Front-end")).toBeInTheDocument();
    expect(screen.queryByText("Auxiliar Administrativo")).not.toBeInTheDocument();
  });

  it("mostra requisitos e recursos de acessibilidade no card (RF15)", async () => {
    renderDashboard();

    expect(await screen.findByText("React")).toBeInTheDocument();
    expect(screen.getByText(/Intérprete de Libras \(em implantação\)/)).toBeInTheDocument();
  });

  it("abre a aba Meus Direitos (RF22)", async () => {
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.click(screen.getByRole("button", { name: "Meus Direitos" }));

    expect(
      await screen.findByRole("heading", { name: "Seus direitos no trabalho" }),
    ).toBeInTheDocument();
  });

  it("candidata-se pedindo intérprete de Libras (UC03)", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.click(screen.getByRole("button", { name: "Candidatar-se" }));

    expect(api.post).toHaveBeenCalledWith("/jobs/j1/apply", { requiresInterpreter: true });
    expect(await screen.findAllByRole("button", { name: /Candidatado/ })).toHaveLength(2);
  });

  it("mostra o erro do backend ao se candidatar", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.mocked(api.post).mockRejectedValue(
      new AxiosError("Erro", "ERR", undefined, undefined, {
        data: { error: "Esta vaga foi encerrada e não recebe mais candidaturas." },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    );
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.click(screen.getByRole("button", { name: "Candidatar-se" }));

    expect(alerta).toHaveBeenCalledWith(
      "Esta vaga foi encerrada e não recebe mais candidaturas.",
    );
  });

  it("lista as candidaturas com o status atualizado pela empresa (RF19)", async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => ({
      data:
        url === "/jobs"
          ? vagas
          : url === "/applications/me"
            ? [
                { id: "a1", status: "approved", job: { title: "Dev", company: { name: "Tech SC" } } },
                { id: "a2", status: "pending", job: { title: "Suporte", company: { name: "Loja X" } } },
              ]
            : [],
    }));
    const user = renderDashboard();
    await screen.findByText("Desenvolvedor Front-end");

    await user.click(screen.getByRole("button", { name: "Candidaturas" }));

    expect(screen.getByText(/Aprovado/)).toBeInTheDocument();
    expect(screen.getByText(/Em análise/)).toBeInTheDocument();
  });
});
