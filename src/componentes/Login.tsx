import { useState, FormEvent } from "react";

interface LoginProps {
  onLogin: (email: string) => void;
  onCreateAccount: () => void;
}

function Login({ onLogin, onCreateAccount }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const passwordOk = password.length > 0;

    setEmailError(!emailOk);
    setPasswordError(!passwordOk);

    if (!emailOk || !passwordOk) return;

    onLogin(email.trim());
  };

  return (
    <div id="login-screen">
      <div className="login-hero">
        <h1 className="brand-title">D-Link</h1>

        <p className="tagline">
          A plataforma de empregabilidade para a comunidade{" "}
          <strong>surda</strong>
        </p>

        <p className="hero-description">
          Conectamos pessoas surdas e com deficiência auditiva a empresas
          comprometidas com a inclusão, acessibilidade e diversidade. Um projeto{" "}
          <strong>sem fins lucrativos</strong>, feito com amor pela comunidade.
        </p>
      </div>

      <div className="login-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className={`field${emailError ? " invalid" : ""}`}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="nome@email.com"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(false);
              }}
            />
            <div className="field-error">Digite um e-mail válido.</div>
          </div>

          <div className={`field${passwordError ? " invalid" : ""}`}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(false);
              }}
            />
            <div className="field-error">Digite sua senha.</div>
          </div>

          <div className="form-row-between">
            <label>
              <input type="checkbox" /> Lembrar de mim
            </label>
            <a href="#">Esqueci minha senha</a>
          </div>

          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        <div className="divider">ou</div>

        <button
          type="button"
          className="btn-secondary"
          onClick={onCreateAccount}
        >
          Criar conta gratuita
        </button>
      </div>
    </div>
  );
}

export default Login;
