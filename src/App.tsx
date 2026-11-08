import { useState, useRef } from "react";
import Login from "./componentes/Login";
import CriarConta from "./componentes/CriarConta";
import Dashboard from "./componentes/Dashboard";
import PainelEmpresa from "./componentes/PainelEmpresa";
import ReactVLibras from "react-vlibras-plugin";
import "./App.css";

type View = "login" | "signup" | "candidate_dashboard" | "company_dashboard";

function App() {
  const [view, setView] = useState<View>("login");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("candidato");

  // Lembra o tipo de conta de cada e-mail cadastrado nesta sessão,
  // já que ainda não há um backend real de autenticação.
  const registro = useRef<Record<string, AccountType>>({});

  const handleLogin = (email: string, role: string) => {
    setUserEmail(email);
    setUserName(email.split("@")[0] || "usuário");
    if (role === "company") setView("company_dashboard");
    else setView("candidate_dashboard");
  };

  const handleSignup = (name: string, email: string, role: string) => {
    setUserName(name || email.split("@")[0]);
    setUserEmail(email);
    if (role === "company") setView("company_dashboard");
    else setView("candidate_dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setView("login");
  };

  const handleUpdateName = (newName: string) => {
    setUserName(newName);
  };

  const renderView = () => {
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
        <Login
          onLogin={handleLogin}
          onCreateAccount={() => setView("signup")}
        />
      );
    }
    if (view === "company_dashboard") {
      return (
        <PainelEmpresa
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
          onUpdateName={handleUpdateName}
        />
      );
    }
    return (
      <Dashboard
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onUpdateName={handleUpdateName}
      />
    );
  };

  return (
    <>
      {renderView()}
      <ReactVLibras position="bottomRight" avatar="guga" />
    </>
  );
}

export default App;
