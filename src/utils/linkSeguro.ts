export function linkSeguro(endereco: string | null | undefined) {
  if (!endereco) return null;
  try {
    const url = new URL(endereco);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
