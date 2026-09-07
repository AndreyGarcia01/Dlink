import { useState, FormEvent } from "react";

interface CriarContaProps {
  onCreated: (name: string, email: string) => void;
  onBackToLogin: () => void;
}

function CriarConta({ onCreated, onBackToLogin }: CriarContaProps) {
  const [tipo, setTipo] = useState<"candidato" | "empresa">("candidato");
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCreated(nome.trim(), email.trim());
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
                required
              />
            </div>
          </div>

          {tipo === "candidato" ? (
            <div className="field-row">
              <div className="field">
                <label htmlFor="perda-auditiva">Grau de perda auditiva</label>
                <select id="perda-auditiva" defaultValue="Profundo">
                  <option>Leve</option>
                  <option>Moderada</option>
                  <option>Severa</option>
                  <option>Profundo</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="comunicacao">Preferência de comunicação</label>
                <select id="comunicacao" defaultValue="Libras">
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
                <input id="cnpj" type="text" placeholder="00.000.000/0001-00" />
              </div>
              <div className="field">
                <label htmlFor="setor">Setor de atuação</label>
                <input
                  id="setor"
                  type="text"
                  placeholder="Ex: Tecnologia, Varejo..."
                />
              </div>
            </div>
          )}

          <div className="btn-center-wrap">
            <button type="submit" className="btn-primary btn-auto">
              <span aria-hidden="true">＋</span> Criar conta gratuita
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
