import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import Login from "../componentes/Login";
import { api } from "../services/api";

vi.mock("../services/api", () => ({ api: { post: vi.fn(), get: vi.fn() } }));

const post = vi.mocked(api.post);

function erroDaApi(mensagem: string) {
  return new AxiosError("Erro", "ERR", undefined, undefined, {
    data: { error: mensagem },
    status: 401,
    statusText: "Unauthorized",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function renderLogin() {
  const onLogin = vi.fn();
  const onCreateAccount = vi.fn();
  render(<Login onLogin={onLogin} onCreateAccount={onCreateAccount} />);
  return { onLogin, onCreateAccount, user: userEvent.setup() };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Login", () => {
  it("valida e-mail e senha antes de chamar a API", async () => {
    const { user } = renderLogin();

    await user.type(screen.getByLabelText("E-mail"), "email-invalido");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByLabelText("E-mail").closest(".field")).toHaveClass(
      "invalid",
    );
    expect(screen.getByLabelText("Senha").closest(".field")).toHaveClass(
      "invalid",
    );
    expect(post).not.toHaveBeenCalled();
  });

  it("faz login, guarda o token e avisa o App", async () => {
    post.mockResolvedValue({
      data: { token: "abc", user: { name: "Maria", role: "company" } },
    });
    const { user, onLogin } = renderLogin();

    await user.type(screen.getByLabelText("E-mail"), " maria@email.com ");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(post).toHaveBeenCalledWith("/auth/login", {
      email: "maria@email.com",
      password: "123456",
    });
    expect(localStorage.getItem("@DLink:token")).toBe("abc");
    expect(onLogin).toHaveBeenCalledWith("maria@email.com", "company");
  });

  it("mostra a mensagem de erro que vem do backend", async () => {
    post.mockRejectedValue(erroDaApi("Credenciais inválidas."));
    const { user, onLogin } = renderLogin();

    await user.type(screen.getByLabelText("E-mail"), "maria@email.com");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciais inválidas.")).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("mostra erro genérico quando o servidor não responde", async () => {
    post.mockRejectedValue(new Error("Network Error"));
    const { user } = renderLogin();

    await user.type(screen.getByLabelText("E-mail"), "maria@email.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Erro ao conectar com o servidor."),
    ).toBeInTheDocument();
  });

  it("mostra e esconde a senha", async () => {
    const { user } = renderLogin();
    const senha = screen.getByLabelText("Senha");

    expect(senha).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(senha).toHaveAttribute("type", "password");
  });

  it("vai para a tela de criar conta", async () => {
    const { user, onCreateAccount } = renderLogin();

    await user.click(screen.getByRole("button", { name: "Criar conta gratuita" }));

    expect(onCreateAccount).toHaveBeenCalled();
  });

  it("aceita e-mails com vários pontos no domínio e recusa domínio sem ponto", async () => {
    post.mockResolvedValue({
      data: { token: "abc", user: { name: "Ana", role: "candidate" } },
    });
    const { user } = renderLogin();
    const campo = screen.getByLabelText("E-mail");

    await user.type(campo, "ana@empresa");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(campo.closest(".field")).toHaveClass("invalid");
    expect(post).not.toHaveBeenCalled();

    await user.clear(campo);
    await user.type(campo, "ana.souza@empresa.com.br");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(post).toHaveBeenCalledWith("/auth/login", {
      email: "ana.souza@empresa.com.br",
      password: "123456",
    });
  });
});
