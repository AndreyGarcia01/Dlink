import { promises as dns } from "node:dns";

export type ResultadoEmail = "ok" | "formato" | "dominio";

export interface ResolvedorMx {
  resolveMx(dominio: string): Promise<{ exchange: string }[]>;
}

const resolvedorPadrao: ResolvedorMx = new dns.Resolver({
  timeout: 3000,
  tries: 2,
});

const DOMINIO_SEM_EMAIL = new Set(["ENOTFOUND", "ENODATA", "NXDOMAIN"]);

export function formatoValido(email: string): boolean {
  if (email.length > 254 || /\s/.test(email)) return false;

  const arroba = email.indexOf("@");
  if (arroba < 1 || arroba !== email.lastIndexOf("@")) return false;

  const dominio = email.slice(arroba + 1);
  const partes = dominio.split(".");
  return partes.length >= 2 && partes.every((parte) => parte.length > 0);
}

export async function dominioRecebeEmail(
  dominio: string,
  resolvedor: ResolvedorMx = resolvedorPadrao,
): Promise<boolean> {
  try {
    const registros = await resolvedor.resolveMx(dominio);

    return registros.some((r) => r.exchange !== "" && r.exchange !== ".");
  } catch (erro) {
    const codigo = (erro as NodeJS.ErrnoException).code ?? "";
    if (DOMINIO_SEM_EMAIL.has(codigo)) return false;

    console.error("Falha ao consultar o DNS do e-mail no cadastro:", codigo);
    return true;
  }
}

export async function verificarEmail(
  email: string,
  resolvedor: ResolvedorMx = resolvedorPadrao,
): Promise<ResultadoEmail> {
  if (!formatoValido(email)) return "formato";

  const dominio = email.slice(email.indexOf("@") + 1).toLowerCase();
  return (await dominioRecebeEmail(dominio, resolvedor)) ? "ok" : "dominio";
}
