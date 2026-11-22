import { describe, it, expect } from "vitest";
import { linkSeguro } from "../utils/linkSeguro";

describe("linkSeguro", () => {
  it("aceita links http e https", () => {
    expect(linkSeguro("https://youtu.be/abc")).toBe("https://youtu.be/abc");
    expect(linkSeguro("http://exemplo.com")).toBe("http://exemplo.com/");
  });

  it("recusa javascript:, texto solto e vazio", () => {
    expect(linkSeguro("javascript:alert(1)")).toBeNull();
    expect(linkSeguro("não é link")).toBeNull();
    expect(linkSeguro("")).toBeNull();
    expect(linkSeguro(null)).toBeNull();
  });
});
