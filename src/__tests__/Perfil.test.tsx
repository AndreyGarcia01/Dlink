import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import Perfil from "../componentes/Perfil";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);
const put = vi.mocked(api.put);

const perfilSalvo = {
  name: "Maria",
  hearingLossLevel: "Severa",
  communicationPreference: "Escrita",
  candidateProfile: {
    bio: "Desenvolvedora",
    skills: "React, Node",
    experience: "Estágio",
    education: "Engenharia",
    videoUrl: "https://youtu.be/abc",
  },
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Perfil do candidato", () => {
  it("carrega os dados salvos no banco", async () => {
    get.mockResolvedValue({ data: perfilSalvo });
    render(<Perfil />);

    expect(await screen.findByLabelText("Nome completo")).toHaveValue("Maria");
    expect(screen.getByLabelText("Grau de perda auditiva")).toHaveValue("Severa");
    expect(screen.getByLabelText("Experiência profissional")).toHaveValue("Estágio");
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Assistir ao meu vídeo em Libras" }),
    ).toHaveAttribute("href", "https://youtu.be/abc");
  });

  it("salva as alterações na API e avisa o Dashboard do nome novo", async () => {
    get.mockResolvedValue({ data: { name: "Maria", candidateProfile: null } });
    put.mockResolvedValue({ data: {} });
    const onUpdateName = vi.fn();
    const user = userEvent.setup();
    render(<Perfil onUpdateName={onUpdateName} />);

    const nome = await screen.findByLabelText("Nome completo");
    await user.clear(nome);
    await user.type(nome, "Maria Silva");
    await user.type(screen.getByLabelText("Nova habilidade"), "Libras{Enter}");
    await user.type(screen.getByLabelText("Formação acadêmica"), "Técnico");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(put).toHaveBeenCalledWith(
      "/profile/me",
      expect.objectContaining({
        name: "Maria Silva",
        skills: ["Libras"],
        education: "Técnico",
      }),
    );
    expect(onUpdateName).toHaveBeenCalledWith("Maria Silva");
    expect(await screen.findByRole("status")).toHaveTextContent("Perfil salvo");
  });

  it("adiciona e remove habilidades", async () => {
    get.mockResolvedValue({ data: { name: "Maria" } });
    const user = userEvent.setup();
    render(<Perfil />);

    await user.type(await screen.findByLabelText("Nova habilidade"), "Excel");
    await user.click(screen.getByRole("button", { name: "Adicionar habilidade" }));
    expect(screen.getByText("Excel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover Excel" }));
    expect(screen.queryByText("Excel")).not.toBeInTheDocument();
  });

  it("mostra o erro que vem do backend ao salvar", async () => {
    get.mockResolvedValue({ data: { name: "Maria" } });
    put.mockRejectedValue(
      new AxiosError("Erro", "ERR", undefined, undefined, {
        data: { error: "O link do vídeo deve começar com http:// ou https://." },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    );
    const user = userEvent.setup();
    render(<Perfil />);

    await user.click(
      await screen.findByRole("button", { name: "Salvar alterações" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "O link do vídeo deve começar",
    );
  });

  it("avisa quando não consegue carregar o perfil", async () => {
    get.mockRejectedValue(new Error("Network Error"));
    render(<Perfil />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar seu perfil.",
    );
  });

  it("só mostra o link do vídeo depois de salvo, nunca o texto digitado", async () => {
    get.mockResolvedValue({ data: { name: "Maria", candidateProfile: null } });
    const user = userEvent.setup();
    render(<Perfil />);

    await user.type(
      await screen.findByLabelText("Vídeo de apresentação em Libras"),
      "https://youtu.be/xyz",
    );

    expect(
      screen.queryByRole("link", { name: "Assistir ao meu vídeo em Libras" }),
    ).not.toBeInTheDocument();
  });

  it("não transforma em link um endereço perigoso vindo do banco", async () => {
    get.mockResolvedValue({
      data: { name: "Maria", candidateProfile: { videoUrl: "javascript:alert(1)" } },
    });
    render(<Perfil />);

    await screen.findByLabelText("Nome completo");
    expect(
      screen.queryByRole("link", { name: "Assistir ao meu vídeo em Libras" }),
    ).not.toBeInTheDocument();
  });
});
