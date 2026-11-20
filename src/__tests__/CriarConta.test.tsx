import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import CriarConta from "../componentes/CriarConta";
import { api } from "../services/api";

vi.mock("../services/api", () => ({ api: { post: vi.fn(), get: vi.fn() } }));

const post = vi.mocked(api.post);

function renderCriarConta() {
  const onCreated = vi.fn();
  const onBackToLogin = vi.fn();
  render(<CriarConta onCreated={onCreated} onBackToLogin={onBackToLogin} />);
  return { onCreated, onBackToLogin, user: userEvent.setup() };
}

async function preencherSenhas(
  user: ReturnType<typeof userEvent.setup>,
  senha: string,
  confirmacao = senha,
) {
  await user.type(screen.getByLabelText("Senha *"), senha);
  await user.type(screen.getByLabelText("Confirmar senha *"), confirmacao);
}

const botaoCriar = () =>
  screen.getByRole("button", { name: /Criar conta gratuita/ });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("CriarConta", () => {
  it("avisa quando as senhas não coincidem", async () => {
    const { user } = renderCriarConta();

    await user.type(screen.getByLabelText("Nome completo *"), "Maria");
    await user.type(screen.getByLabelText("E-mail *"), "maria@email.com");
    await preencherSenhas(user, "123456", "654321");
    await user.click(botaoCriar());

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("exige senha com no mínimo 6 caracteres", async () => {
    const { user } = renderCriarConta();

    await user.type(screen.getByLabelText("Nome completo *"), "Maria");
    await user.type(screen.getByLabelText("E-mail *"), "maria@email.com");
    await preencherSenhas(user, "123");
    await user.click(botaoCriar());

    expect(
      screen.getByText("A senha deve ter no mínimo 6 caracteres."),
    ).toBeInTheDocument();
  });

  it("cadastra candidato com os dados de acessibilidade", async () => {
    post.mockResolvedValue({ data: {} });
    const { user, onCreated } = renderCriarConta();

    await user.type(screen.getByLabelText("Nome completo *"), "Maria");
    await user.type(screen.getByLabelText("E-mail *"), "maria@email.com");
    await preencherSenhas(user, "123456");
    await user.selectOptions(
      screen.getByLabelText("Grau de perda auditiva"),
      "Severa",
    );
    await user.selectOptions(
      screen.getByLabelText("Preferência de comunicação"),
      "Leitura labial",
    );
    await user.click(botaoCriar());

    expect(post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        name: "Maria",
        role: "candidate",
        hearingLossLevel: "Severa",
        communicationPreference: "Leitura labial",
        cnpj: null,
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(
      "Maria",
      "maria@email.com",
      "candidate",
    );
  });

  it("cadastra empresa com CNPJ e setor", async () => {
    post.mockResolvedValue({ data: {} });
    const { user, onCreated } = renderCriarConta();

    await user.click(screen.getByRole("button", { name: /Empresa/ }));
    await user.type(screen.getByLabelText("Razão social *"), "Loja X");
    await user.type(screen.getByLabelText("E-mail *"), "rh@lojax.com");
    await preencherSenhas(user, "123456");
    await user.type(screen.getByLabelText("CNPJ"), "00.000.000/0001-00");
    await user.type(screen.getByLabelText("Setor de atuação"), "Varejo");
    await user.click(botaoCriar());

    expect(post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        role: "company",
        cnpj: "00.000.000/0001-00",
        sector: "Varejo",
        hearingLossLevel: null,
      }),
    );
    expect(onCreated).toHaveBeenCalledWith("Loja X", "rh@lojax.com", "company");
  });

  it("mostra o erro do backend (ex.: e-mail já cadastrado)", async () => {
    post.mockRejectedValue(
      new AxiosError("Erro", "ERR", undefined, undefined, {
        data: { error: "Este e-mail já está cadastrado." },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    );
    const { user, onCreated } = renderCriarConta();

    await user.type(screen.getByLabelText("Nome completo *"), "Maria");
    await user.type(screen.getByLabelText("E-mail *"), "maria@email.com");
    await preencherSenhas(user, "123456");
    await user.click(botaoCriar());

    expect(
      await screen.findByText("Este e-mail já está cadastrado."),
    ).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("mostra erro genérico quando o servidor não responde", async () => {
    post.mockRejectedValue(new Error("Network Error"));
    const { user } = renderCriarConta();

    await user.type(screen.getByLabelText("Nome completo *"), "Maria");
    await user.type(screen.getByLabelText("E-mail *"), "maria@email.com");
    await preencherSenhas(user, "123456");
    await user.click(botaoCriar());

    expect(
      await screen.findByText("Erro ao conectar com o servidor."),
    ).toBeInTheDocument();
  });

  it("volta para o login", async () => {
    const { user, onBackToLogin } = renderCriarConta();

    await user.click(screen.getByRole("link", { name: "Fazer login" }));

    expect(onBackToLogin).toHaveBeenCalled();
  });
});
