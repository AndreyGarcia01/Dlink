import { useState } from "react";
import Login from "./componentes/Login";
import CriarConta from "./componentes/CriarConta";
import Dashboard from "./componentes/Dashboard";
import PainelEmpresa from "./componentes/PainelEmpresa"; // Vamos criar esse arquivo!
import "./App.css";

type View = "login" | "signup" | "candidate_dashboard" | "company_dashboard";

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

  const [userName, setUserName] = useState(() => {
    const user = localStorage.getItem("@DLink:user");
    return user ? JSON.parse(user).name : "";
  });

  // O Login agora precisa nos passar o "role" (perfil)
  const handleLogin = (email: string, role: string) => {
    setUserEmail(email);
    setUserName(email.split("@")[0] || "usuário");

    // Redireciona baseado no perfil
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

  const handleLogout = () => {
    localStorage.clear(); // Limpa o token ao sair
    setView("login");
  };

  const handleUpdateName = (newName: string) => {
    setUserName(newName);
    const user = localStorage.getItem("@DLink:user");
    if (user) {
      const parsedUser = JSON.parse(user);
      parsedUser.name = newName;
      localStorage.setItem("@DLink:user", JSON.stringify(parsedUser));
    }
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

  if (view === "company_dashboard") {
    return <PainelEmpresa onLogout={handleLogout} />;
  }

  return (
    <>
      {renderView()}
      <ReactVLibras position="bottomRight" avatar="guga" />
    </>
  );
}

export default App;
