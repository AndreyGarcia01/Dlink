import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PerfilEmpresa from "../componentes/PerfilEmpresa";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { get: vi.fn(), put: vi.fn() },
}));

const get = vi.mocked(api.get);
const put = vi.mocked(api.put);

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(window, "alert").mockImplementation(() => {});
  get.mockResolvedValue({
    data: {
      name: "Loja X",
      cnpj: "00.000.000/0001-00",
      sector: "Varejo",
      companyDescription: "Loja inclusiva",
    },
  });
});

describe("Perfil da empresa", () => {
  it("carrega os dados salvos", async () => {
    render(<PerfilEmpresa />);

    expect(await screen.findByLabelText("Razão social *")).toHaveValue("Loja X");
    expect(screen.getByLabelText("CNPJ")).toHaveValue("00.000.000/0001-00");
    expect(screen.getByLabelText("Setor de atuação")).toHaveValue("Varejo");
  });

  it("salva as alterações", async () => {
    put.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<PerfilEmpresa />);

    const setor = await screen.findByLabelText("Setor de atuação");
    await user.clear(setor);
    await user.type(setor, "Tecnologia");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(put).toHaveBeenCalledWith(
      "/profile/me",
      expect.objectContaining({ name: "Loja X", sector: "Tecnologia" }),
    );
    expect(window.alert).toHaveBeenCalledWith("Perfil da empresa salvo com sucesso!");
  });

  it("avisa quando não consegue salvar", async () => {
    put.mockRejectedValue(new Error("Network Error"));
    const user = userEvent.setup();
    render(<PerfilEmpresa />);

    await user.click(
      await screen.findByRole("button", { name: "Salvar alterações" }),
    );

    expect(window.alert).toHaveBeenCalledWith("Erro ao salvar o perfil da empresa.");
  });
});
