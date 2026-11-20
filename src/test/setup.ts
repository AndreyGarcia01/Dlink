import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Limpa a tela e o localStorage entre um teste e outro
afterEach(() => {
  cleanup();
  localStorage.clear();
});
