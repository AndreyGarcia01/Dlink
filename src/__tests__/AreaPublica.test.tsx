import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AreaPublica from "../componentes/AreaPublica";
import { api } from "../services/api";

vi.mock("../services/api", () => ({ api: { get: vi.fn() } }));

const get = vi.mocked(api.get);

const vaga = {
  id: "j1",
  title: "Auxiliar de Produção",
  description: "Linha de montagem",
  requirements: "Ensino fundamental",
  location: "Joinville",
  workRegion: "Presencial",
  category: "Indústria e Produção",
  company: { name: "Fábrica SC", sector: "Indústria" },
  accessibilities: [
    { resource: "Intérprete de Libras", status: "available" },
    { resource: "Sinalização visual", status: "in_progress" },
  ],
};

const conteudo = {
  id: "c1",
  title: "Lei de Cotas",
  body: "Texto completo da lei",
  transcript: "Resumo simples",
  videoUrl: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  get.mockImplementation(async (url: string) => ({
    data: url === "/public/jobs" ? [vaga] : [conteudo],
  }));
});

function renderArea() {
  const onLogin = vi.fn();
  const onCreateAccount = vi.fn();
  render(<AreaPublica onLogin={onLogin} onCreateAccount={onCreateAccount} />);
  return { onLogin, onCreateAccount, user: userEvent.setup() };
}

describe("Área pública", () => {
  it("mostra as vagas sem login, com requisitos e acessibilidade", async () => {
    renderArea();

    expect(await screen.findByText("Auxiliar de Produção")).toBeInTheDocument();
    expect(screen.getByText("Fábrica SC")).toBeInTheDocument();
    expect(screen.getByText("Ensino fundamental")).toBeInTheDocument();
    expect(screen.getByText(/✓ Intérprete de Libras/)).toBeInTheDocument();
    expect(screen.getByText(/Sinalização visual \(em implantação\)/)).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/public/jobs");
  });

  it("leva para criar conta ao querer se candidatar", async () => {
    const { user, onCreateAccount } = renderArea();

    await user.click(await screen.findByRole("button", { name: "Quero me candidatar" }));

    expect(onCreateAccount).toHaveBeenCalled();
  });

  it("tem botões de entrar e criar conta", async () => {
    const { user, onLogin, onCreateAccount } = renderArea();

    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(onLogin).toHaveBeenCalled();
    expect(onCreateAccount).toHaveBeenCalled();
  });

  it("mostra os conteúdos sobre direitos na outra aba", async () => {
    const { user } = renderArea();

    await user.click(screen.getByRole("tab", { name: "Seus direitos" }));

    expect(await screen.findByText("Lei de Cotas")).toBeInTheDocument();
    expect(screen.getByText("Resumo simples")).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/public/contents");
  });

  it("avisa quando não há vagas", async () => {
    get.mockResolvedValue({ data: [] });
    renderArea();

    expect(await screen.findByText("Nenhuma vaga aberta no momento")).toBeInTheDocument();
  });

  it("avisa quando não consegue carregar", async () => {
    get.mockRejectedValue(new Error("Network Error"));
    renderArea();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar as vagas");
  });
});
