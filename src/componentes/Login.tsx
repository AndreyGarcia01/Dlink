import { useState, FormEvent } from "react";
import axios from "axios";
import { api } from "../services/api"; // Importando a conexão com o backend

interface LoginProps {
  onLogin: (email: string) => void;
  onCreateAccount: () => void;
}

function Login({ onLogin, onCreateAccount }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Novos estados para controle da API
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(""); // Limpa erros anteriores

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const passwordOk = password.length > 0;

    setEmailError(!emailOk);
    setPasswordError(!passwordOk);

    if (!emailOk || !passwordOk) return;

    setIsLoading(true); // Ativa o "carregando"

    try {
      // Chamando o backend Node.js que está rodando na porta 3333
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      // Salva o token e os dados do usuário no navegador
      localStorage.setItem("@DLink:token", token);
      localStorage.setItem("@DLink:user", JSON.stringify(user));

      // Avisa o componente pai que o login deu certo
      onLogin(email.trim());
    } catch (error) {
      // Se o backend retornar erro (ex: senha inválida), mostra a mensagem dele.
      // O "error" vem como "unknown"; o isAxiosError confirma que é um erro do axios.
      if (
        axios.isAxiosError<{ error?: string }>(error) &&
        error.response?.data?.error
      ) {
        setApiError(error.response.data.error);
      } else {
        setApiError("Erro ao conectar com o servidor.");
      }
    } finally {
      setIsLoading(false); // Desativa o "carregando"
    }
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
          {/* Mostra a mensagem de erro se o backend retornar algo */}
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

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
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
