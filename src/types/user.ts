export type AccountType = "candidate" | "company";
export type SignupType = "candidato" | "empresa";

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
