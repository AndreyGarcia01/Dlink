import { useState, useRef } from "react";
import Login from "./componentes/Login";
import CriarConta from "./componentes/CriarConta";
import Dashboard from "./componentes/Dashboard";
import "./App.css";

type View = "login" | "signup" | "dashboard";
type AccountType = "candidato" | "empresa";

function nameFromEmail(email: string) {
  return email.split("@")[0] || "usuário";
}

function App() {
  const [view, setView] = useState<View>("login");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("candidato");

  // Lembra o tipo de conta de cada e-mail cadastrado nesta sessão,
  // já que ainda não há um backend real de autenticação.
  const registro = useRef<Record<string, AccountType>>({});

  const handleLogin = (email: string) => {
    const tipoConhecido = registro.current[email.toLowerCase()] ?? "candidato";
    setUserEmail(email);
    setUserName(nameFromEmail(email));
    setAccountType(tipoConhecido);
    setView("dashboard");
  };

  const handleSignup = (name: string, email: string, tipo: AccountType) => {
    registro.current[email.toLowerCase()] = tipo;
    setUserName(name || nameFromEmail(email));
    setUserEmail(email);
    setAccountType(tipo);
    setView("dashboard");
  };

  const handleLogout = () => {
    setView("login");
  };

  if (view === "signup") {
    return (
      <CriarConta
        onCreated={handleSignup}
        onBackToLogin={() => setView("login")}
      />
    );
  }

  if (view === "login") {
    return (
      <Login onLogin={handleLogin} onCreateAccount={() => setView("signup")} />
    );
  }

  return (
    <Dashboard
      userName={userName}
      userEmail={userEmail}
      accountType={accountType}
      onLogout={handleLogout}
    />
  );
}

export default App;
