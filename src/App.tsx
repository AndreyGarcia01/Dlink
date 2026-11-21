import { useState, useEffect } from "react";
import Login from "./componentes/Login";
import CriarConta from "./componentes/CriarConta";
import Dashboard from "./componentes/Dashboard";
import PainelEmpresa from "./componentes/PainelEmpresa";
import ReactVLibras from "react-vlibras-plugin";
import { SESSAO_EXPIRADA } from "./services/api";
import "./App.css";

type View = "login" | "signup" | "candidate_dashboard" | "company_dashboard";

function lerUsuario() {
  const user = localStorage.getItem("@DLink:user");
  return user ? JSON.parse(user) : null;
}

function App() {
  const [view, setView] = useState<View>(() => {
    const token = localStorage.getItem("@DLink:token");
    const user = localStorage.getItem("@DLink:user");
    if (token && user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.role === "company"
        ? "company_dashboard"
        : "candidate_dashboard";
    }
    return "login";
  });

  const [userName, setUserName] = useState(() => lerUsuario()?.name ?? "");
  const [userEmail, setUserEmail] = useState(() => lerUsuario()?.email ?? "");

  useEffect(() => {
    const voltarParaLogin = () => {
      setUserName("");
      setUserEmail("");
      setView("login");
    };
    window.addEventListener(SESSAO_EXPIRADA, voltarParaLogin);
    return () => window.removeEventListener(SESSAO_EXPIRADA, voltarParaLogin);
  }, []);

  const handleLogin = (email: string, role: string) => {
    setUserEmail(email);

    setUserName(lerUsuario()?.name || email.split("@")[0] || "usuário");

    if (role === "company") {
      setView("company_dashboard");
    } else {
      setView("candidate_dashboard");
    }
  };

  const handleSignup = (name: string, email: string, role: string) => {
    setUserName(name || email.split("@")[0]);
    setUserEmail(email);

    if (role === "company") {
      setView("company_dashboard");
    } else {
      setView("candidate_dashboard");
    }
  };

  const atualizarNome = (name: string) => {
    setUserName(name);
    const user = lerUsuario();
    if (user) {
      localStorage.setItem("@DLink:user", JSON.stringify({ ...user, name }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setView("login");
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
      return <PainelEmpresa onLogout={handleLogout} />;
    }

    return (
      <Dashboard
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onUpdateName={atualizarNome}
      />
    );
  };

  return (
    <>
      {}
      {renderView()}

      {}
      <ReactVLibras position="bottomRight" avatar="guga" />
    </>
  );
}

export default App;
