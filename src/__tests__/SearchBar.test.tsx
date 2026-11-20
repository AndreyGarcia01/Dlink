import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../componentes/SearchBar";

describe("SearchBar", () => {
  it("avisa o termo digitado", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByPlaceholderText("Buscar vagas..."), "dev");

    expect(onSearch).toHaveBeenLastCalledWith("dev");
  });

  it("funciona sem onSearch", async () => {
    render(<SearchBar />);

    await userEvent.type(screen.getByPlaceholderText("Buscar vagas..."), "a");

    expect(screen.getByRole("button", { name: /Filtros/ })).toBeInTheDocument();
  });
});
