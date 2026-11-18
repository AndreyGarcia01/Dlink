import { useState, FormEvent } from "react";
import axios from "axios";
import { api } from "../services/api";

interface CriarContaProps {
  // Mudança 1: O role agora é obrigatório para avisar o App.tsx
  onCreated: (name: string, email: string, role: string) => void;
  onBackToLogin: () => void;
}

function CriarConta({ onCreated, onBackToLogin }: CriarContaProps) {
  const [tipo, setTipo] = useState<"candidato" | "empresa">("candidato");
  const [showPassword, setShowPassword] = useState(false);

  // Estados para os campos
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Campos de candidato
  const [perdaAuditiva, setPerdaAuditiva] = useState("Profundo");
  const [comunicacao, setComunicacao] = useState("Libras");

  // Campos de empresa
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");

  // Estados para controle da API
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    // Validação básica de senha
    if (password !== confirmPassword) {
      setApiError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setApiError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);

    // Define o role baseado no tipo selecionado
    const role = tipo === "candidato" ? "candidate" : "company";

    try {
      // Chamada real para o backend salvar no banco Neon
      await api.post("/auth/register", {
        name: nome.trim(),
        email: email.trim(),
        password,
        role,
        hearingLossLevel: tipo === "candidato" ? perdaAuditiva : null,
        communicationPreference: tipo === "candidato" ? comunicacao : null,
        cnpj: tipo === "empresa" ? cnpj : null,
        sector: tipo === "empresa" ? setor : null,
      });

      // Se deu certo, avisa o App.tsx (passando o role para ele redirecionar)
      onCreated(nome.trim(), email.trim(), role);
    } catch (error) {
      if (
        axios.isAxiosError<{ error?: string }>(error) &&
        error.response?.data?.error
      ) {
        setApiError(error.response.data.error);
      } else {
        setApiError("Erro ao conectar com o servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-screen">
      <div className="signup-topbar">
        <div className="mini-logo">D</div>
        <span className="mini-logo-text">D-Link</span>
      </div>
      <p className="signup-subtitle">Crie sua conta gratuitamente</p>

      <div className="signup-card">
        <h2>Criar conta</h2>

        {/* Mensagem de erro caso o backend recuse (ex: e-mail já em uso) */}
        {apiError && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {apiError}
          </div>
        )}

        <p className="signup-label">Você é:</p>
        <div className="account-type-row">
          <button
            type="button"
            className={`type-option${tipo === "candidato" ? " selected" : ""}`}
            onClick={() => setTipo("candidato")}
          >
            <span className="type-icon">👤</span>
            Candidato Surdo
          </button>
          <button
            type="button"
            className={`type-option${tipo === "empresa" ? " selected" : ""}`}
            onClick={() => setTipo("empresa")}
          >
            <span className="type-icon">🏢</span>
            Empresa
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tipo === "candidato" ? (
            <div className="field">
              <label htmlFor="nome">Nome completo *</label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="razao-social">Razão social *</label>
              <input
                id="razao-social"
                type="text"
                placeholder="Nome da empresa"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="signup-email">E-mail *</label>
            <input
              id="signup-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="signup-password">Senha *</label>
              <div className="password-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 6 caracteres"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar senha"
                >
                  👁
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirmar senha *</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {tipo === "candidato" ? (
            <div className="field-row">
              <div className="field">
                <label htmlFor="perda-auditiva">Grau de perda auditiva</label>
                <select
                  id="perda-auditiva"
                  value={perdaAuditiva}
                  onChange={(e) => setPerdaAuditiva(e.target.value)}
                >
                  <option>Leve</option>
                  <option>Moderada</option>
                  <option>Severa</option>
                  <option>Profundo</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="comunicacao">Preferência de comunicação</label>
                <select
                  id="comunicacao"
                  value={comunicacao}
                  onChange={(e) => setComunicacao(e.target.value)}
                >
                  <option>Libras</option>
                  <option>Leitura labial</option>
                  <option>Escrita</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="field-row">
              <div className="field">
                <label htmlFor="cnpj">CNPJ</label>
                <input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="setor">Setor de atuação</label>
                <input
                  id="setor"
                  type="text"
                  placeholder="Ex: Tecnologia, Varejo..."
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="btn-center-wrap">
            <button
              type="submit"
              className="btn-primary btn-auto"
              disabled={isLoading}
            >
              <span aria-hidden="true">＋</span>{" "}
              {isLoading ? "Criando conta..." : "Criar conta gratuita"}
            </button>
          </div>
        </form>

        <p className="signup-footer">
          Já tem conta?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBackToLogin();
            }}
          >
            Fazer login
          </a>
        </p>
      </div>
    </div>
  );
}

export default CriarConta;
