import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PainelEmpresa from "../componentes/PainelEmpresa";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
const put = vi.mocked(api.put);
const patch = vi.mocked(api.patch);

const vagaAtiva = {
  id: "j1",
  title: "Auxiliar Administrativo",
  status: "active",
  location: "Joinville",
  workRegion: "Presencial",
  _count: { applications: 1 },
};

const candidatura = {
  id: "a1",
  status: "pending",
  requiresInterpreter: true,
  candidate: {
    name: "Carlos Henrique",
    email: "carlos@email.com",
    communicationPreference: "Libras",
    candidateProfile: { bio: "Operador", skills: "Excel" },
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(window, "alert").mockImplementation(() => {});
  get.mockImplementation(async (url: string) => ({
    data: url === "/jobs/company/me" ? [vagaAtiva] : [candidatura],
  }));
});

function renderPainel() {
  const onLogout = vi.fn();
  render(<PainelEmpresa onLogout={onLogout} />);
  return { onLogout, user: userEvent.setup() };
}

describe("Painel da empresa", () => {
  it("lista as vagas da empresa com o número de candidatos", async () => {
    renderPainel();

    expect(await screen.findByText("Auxiliar Administrativo")).toBeInTheDocument();
    expect(screen.getByText(/1 candidato\(s\)/)).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
  });

  it("publica uma vaga com a área de atuação escolhida (RF11/RF14)", async () => {
    post.mockResolvedValue({ data: {} });
    const { user } = renderPainel();
    await screen.findByText("Auxiliar Administrativo");

    await user.click(screen.getByRole("button", { name: "Publicar Nova Vaga" }));
    await user.type(screen.getByLabelText("Título"), "Dev Front-end");
    await user.type(screen.getByLabelText("Descrição"), "Vaga remota");
    await user.type(screen.getByLabelText("Requisitos"), "React");
    await user.type(screen.getByLabelText("Localidade"), "Joinville");
    await user.selectOptions(screen.getByLabelText("Regime"), "Remoto");
    await user.selectOptions(screen.getByLabelText("Área de atuação"), "Tecnologia");
    await user.click(screen.getByRole("button", { name: "Publicar Vaga" }));

    expect(post).toHaveBeenCalledWith("/jobs", {
      title: "Dev Front-end",
      description: "Vaga remota",
      requirements: "React",
      location: "Joinville",
      workRegion: "Remoto",
      category: "Tecnologia",
    });
    // volta para a lista de vagas depois de publicar
    expect(await screen.findByRole("heading", { name: "Minhas Vagas" })).toBeInTheDocument();
  });

  it("avisa quando a API recusa a vaga", async () => {
    post.mockRejectedValue(new Error("Network Error"));
    const { user } = renderPainel();
    await screen.findByText("Auxiliar Administrativo");

    await user.click(screen.getByRole("button", { name: "Publicar Nova Vaga" }));
    await user.type(screen.getByLabelText("Título"), "Dev");
    await user.type(screen.getByLabelText("Descrição"), "x");
    await user.type(screen.getByLabelText("Requisitos"), "x");
    await user.type(screen.getByLabelText("Localidade"), "x");
    await user.click(screen.getByRole("button", { name: "Publicar Vaga" }));

    expect(window.alert).toHaveBeenCalledWith("Erro ao publicar vaga.");
  });

  it("mostra os candidatos com o pedido de intérprete e aprova (RF20/RN10)", async () => {
    put.mockResolvedValue({ data: {} });
    const { user } = renderPainel();
    await screen.findByText("Auxiliar Administrativo");

    await user.click(screen.getByRole("button", { name: "Ver Candidatos" }));

    expect(await screen.findByText("Carlos Henrique")).toBeInTheDocument();
    expect(screen.getByText(/Necessita de intérprete de Libras/)).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/jobs/j1/candidates");

    await user.click(screen.getByRole("button", { name: "Aprovar" }));
    expect(put).toHaveBeenCalledWith("/applications/a1/status", { status: "approved" });
  });

  it("encerra uma vaga depois da confirmação (RN08)", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    patch.mockResolvedValue({ data: {} });
    const { user } = renderPainel();
    await screen.findByText("Auxiliar Administrativo");

    await user.click(screen.getByRole("button", { name: "Encerrar" }));

    expect(patch).toHaveBeenCalledWith("/jobs/j1/close");
    expect(await screen.findByText("Encerrada")).toBeInTheDocument();
  });

  it("não encerra a vaga se a empresa cancelar", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = renderPainel();
    await screen.findByText("Auxiliar Administrativo");

    await user.click(screen.getByRole("button", { name: "Encerrar" }));

    expect(patch).not.toHaveBeenCalled();
  });

  it("sai da conta", async () => {
    const { user, onLogout } = renderPainel();
    await screen.findByText("Auxiliar Administrativo");

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(onLogout).toHaveBeenCalled();
  });
});
