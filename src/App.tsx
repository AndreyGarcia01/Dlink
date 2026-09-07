import { useState } from "react";
import Login from "./componentes/Login";
import CriarConta from "./componentes/CriarConta";
import Dashboard from "./componentes/Dashboard";
import "./App.css";

type View = "login" | "signup" | "dashboard";

function nameFromEmail(email: string) {
  return email.split("@")[0] || "usuário";
}

function App() {
  const [view, setView] = useState<View>("login");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setUserName(nameFromEmail(email));
    setView("dashboard");
  };

  const handleSignup = (name: string, email: string) => {
    setUserName(name || nameFromEmail(email));
    setUserEmail(email);
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
      onLogout={handleLogout}
    />
  );
}

export default App;
