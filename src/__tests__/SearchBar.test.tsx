import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../componentes/SearchBar";

describe("SearchBar", () => {
  it("avisa o termo digitado", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByLabelText("Buscar vagas"), "dev");

    expect(onSearch).toHaveBeenLastCalledWith("dev");
    expect(onSearch).toHaveBeenCalledTimes(3);
  });

  it("só mostra o botão Filtros quando ele tem uma ação", () => {
    render(<SearchBar />);

    expect(screen.queryByRole("button", { name: /Filtros/ })).not.toBeInTheDocument();
  });

  it("abre os filtros ao clicar", async () => {
    const onFiltersClick = vi.fn();
    render(<SearchBar onFiltersClick={onFiltersClick} filtersOpen={false} />);

    const botao = screen.getByRole("button", { name: /Filtros/ });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(botao);

    expect(onFiltersClick).toHaveBeenCalled();
  });
});
