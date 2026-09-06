import { useState, FormEvent } from "react";

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("teste123@gmail.com");
  const [password, setPassword] = useState("teste123");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const passwordOk = password.length > 0;

    setEmailError(!emailOk);
    setPasswordError(!passwordOk);

    if (!emailOk || !passwordOk) return;

    onLogin();
  };

  return (
    <div id="login-screen">
      <div className="login-visual">
        <div className="brand">
          <div className="brand-mark">DL</div>
          DeafLink
        </div>

        <div className="pitch">
          <h1>Oportunidades e conexões pensadas para a comunidade surda.</h1>
          <p>
            Encontre empresas inclusivas, construa sua rede profissional e
            compartilhe conquistas com quem entende a sua jornada.
          </p>
        </div>

        <svg
          className="network-graphic"
          viewBox="0 0 420 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="80"
            y1="120"
            x2="210"
            y2="200"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <line
            x1="210"
            y1="200"
            x2="330"
            y2="140"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <line
            x1="210"
            y1="200"
            x2="180"
            y2="330"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <line
            x1="210"
            y1="200"
            x2="330"
            y2="300"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <line
            x1="80"
            y1="120"
            x2="60"
            y2="260"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <circle cx="210" cy="200" r="26" fill="#F4A200" />
          <circle cx="80" cy="120" r="14" fill="#ffffff" fillOpacity="0.85" />
          <circle cx="330" cy="140" r="18" fill="#ffffff" fillOpacity="0.55" />
          <circle cx="180" cy="330" r="16" fill="#ffffff" fillOpacity="0.65" />
          <circle cx="330" cy="300" r="10" fill="#ffffff" fillOpacity="0.4" />
          <circle cx="60" cy="260" r="9" fill="#ffffff" fillOpacity="0.35" />
        </svg>

        <div className="stat-row">
          <div>
            <div className="num">1.200+</div>
            <div className="label">profissionais na rede</div>
          </div>
          <div>
            <div className="num">180+</div>
            <div className="label">empresas inclusivas</div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrap">
          <h2>Entrar na DeafLink</h2>
          <p className="sub">Acesse sua conta para continuar.</p>

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
          <p className="signup-line">
            Ainda não tem conta? <a href="#">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
