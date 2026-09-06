import { useState } from "react";
import Login from "./componentes/Login";
import Feed from "./componentes/Feed";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Feed onLogout={() => setIsLoggedIn(false)} />;
}

export default App;
