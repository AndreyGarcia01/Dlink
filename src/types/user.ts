// Tipos de perfil padronizados com o backend
export type AccountType = "candidate" | "company";
export type SignupType = "candidato" | "empresa"; // Usado no formulário de cadastro

export interface User {
  id: string;
  name: string;
  email: string;
  role: AccountType;
  hearingLossLevel?: string | null;
  communicationPreference?: string | null;
  cnpj?: string | null;
  companyDescription?: string | null;
  sector?: string | null;
}
