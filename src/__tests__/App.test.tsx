import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { post: vi.fn(), get: vi.fn(), put: vi.fn() },
  SESSAO_EXPIRADA: "dlink:sessao-expirada",
}));

vi.mock("react-vlibras-plugin", () => ({ default: () => null }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.get).mockResolvedValue({ data: [] });
});

function logarComo(role: "candidate" | "company") {
  localStorage.setItem("@DLink:token", "abc");
  localStorage.setItem(
    "@DLink:user",
    JSON.stringify({ name: "Maria", email: "maria@email.com", role }),
  );
}

describe("App", () => {
  it("abre no login quando não tem ninguém logado", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("vai do login para a tela de criar conta e volta", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Criar conta gratuita" }),
    );
    expect(
      screen.getByRole("heading", { name: "Criar conta" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Fazer login" }));
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("candidato logado não vê a tela de login", () => {
    logarComo("candidate");
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Entrar" }),
    ).not.toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/jobs");
  });

  it("empresa logada não vê a tela de login", () => {
    logarComo("company");
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Entrar" }),
    ).not.toBeInTheDocument();
  });

  it("depois do login, empresa vai para o painel da empresa", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { token: "abc", user: { name: "Loja X", role: "company" } },
    });
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("E-mail"), "rh@lojax.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByRole("heading", { name: "Minhas Vagas" }),
    ).toBeInTheDocument();
  });

  it("depois do login mostra o nome do usuário, não o e-mail", async () => {
    vi.mocked(api.post).mockImplementation(async () => {
      return {
        data: {
          token: "abc",
          user: { name: "Maria Souza", role: "candidate" },
        },
      };
    });
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("E-mail"), "maria@email.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Bem-vindo, Maria Souza!"),
    ).toBeInTheDocument();
  });

  it("guarda o nome novo do perfil para não voltar o antigo ao recarregar", async () => {
    logarComo("candidate");
    vi.mocked(api.put).mockResolvedValue({ data: {} });
    vi.mocked(api.get).mockImplementation(async (url: string) => ({
      data: url === "/profile/me" ? { name: "Maria" } : [],
    }));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Meu Perfil" }));
    const nome = await screen.findByLabelText("Nome completo");
    await user.clear(nome);
    await user.type(nome, "Maria Oliveira");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await screen.findByRole("status");
    expect(JSON.parse(localStorage.getItem("@DLink:user")!).name).toBe(
      "Maria Oliveira",
    );
    expect(screen.getAllByText("Maria Oliveira").length).toBeGreaterThan(0);
  });

  it("volta para o login quando a sessão expira", async () => {
    logarComo("candidate");
    render(<App />);
    expect(
      screen.queryByRole("button", { name: "Entrar" }),
    ).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("dlink:sessao-expirada"));
    });

    expect(
      await screen.findByRole("button", { name: "Entrar" }),
    ).toBeInTheDocument();
  });
});
