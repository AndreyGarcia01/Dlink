import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Notificacoes from "../componentes/Notificacoes";
import { api } from "../services/api";

vi.mock("../services/api", () => ({ api: { get: vi.fn(), patch: vi.fn() } }));

const get = vi.mocked(api.get);
const patch = vi.mocked(api.patch);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Notificações (RF18)", () => {
  it("mostra quantas não lidas existem e lista ao abrir", async () => {
    get.mockResolvedValue({
      data: {
        naoLidas: 1,
        notificacoes: [
          {
            id: "n1",
            message: 'Nova candidatura de Carlos para a vaga "Dev".',
            read: false,
            createdAt: "2026-11-22T12:00:00.000Z",
          },
        ],
      },
    });
    const user = userEvent.setup();
    render(<Notificacoes />);

    const botao = await screen.findByRole("button", { name: /Notificações \(1\)/ });
    await user.click(botao);

    expect(screen.getByText(/Nova candidatura de Carlos/)).toBeInTheDocument();
    expect(botao).toHaveAttribute("aria-expanded", "true");
  });

  it("marca todas como lidas", async () => {
    get.mockResolvedValue({
      data: {
        naoLidas: 1,
        notificacoes: [
          { id: "n1", message: "Aviso", read: false, createdAt: "2026-11-22T12:00:00.000Z" },
        ],
      },
    });
    patch.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<Notificacoes />);

    await user.click(await screen.findByRole("button", { name: /Notificações \(1\)/ }));
    await user.click(screen.getByRole("button", { name: "Marcar todas como lidas" }));

    expect(patch).toHaveBeenCalledWith("/notifications/read-all");
    expect(screen.getByRole("button", { name: "🔔 Notificações" })).toBeInTheDocument();
  });

  it("mostra mensagem quando não há notificações", async () => {
    get.mockResolvedValue({ data: { naoLidas: 0, notificacoes: [] } });
    const user = userEvent.setup();
    render(<Notificacoes />);

    await user.click(screen.getByRole("button", { name: /Notificações/ }));

    expect(await screen.findByText("Nenhuma notificação por enquanto.")).toBeInTheDocument();
  });

  it("não quebra a tela se a API falhar", async () => {
    get.mockRejectedValue(new Error("Network Error"));
    const user = userEvent.setup();
    render(<Notificacoes />);

    await user.click(screen.getByRole("button", { name: /Notificações/ }));

    expect(await screen.findByText("Nenhuma notificação por enquanto.")).toBeInTheDocument();
  });
});
