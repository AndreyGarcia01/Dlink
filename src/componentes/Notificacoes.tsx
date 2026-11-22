import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Notificacao {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Notificacoes() {
  const [aberto, setAberto] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const [lista, setLista] = useState<Notificacao[]>([]);

  async function carregar() {
    try {
      const { data } = await api.get("/notifications");
      setLista(data.notificacoes ?? []);
      setNaoLidas(data.naoLidas ?? 0);
    } catch {
      // sem notificações não impede o resto do painel de funcionar
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function abrirOuFechar() {
    const abrindo = !aberto;
    setAberto(abrindo);
    if (abrindo) await carregar();
  }

  async function marcarTodasComoLidas() {
    await api.patch("/notifications/read-all");
    setLista((atual) => atual.map((n) => ({ ...n, read: true })));
    setNaoLidas(0);
  }

  return (
    <div className="notificacoes">
      <button
        type="button"
        className="nav-item"
        onClick={abrirOuFechar}
        aria-expanded={aberto}
        aria-controls="lista-notificacoes"
      >
        🔔 Notificações{naoLidas > 0 && ` (${naoLidas})`}
      </button>

      {aberto && (
        <div
          id="lista-notificacoes"
          className="notificacoes-painel"
          role="region"
          aria-label="Notificações"
        >
          {lista.length === 0 ? (
            <p>Nenhuma notificação por enquanto.</p>
          ) : (
            <>
              <ul>
                {lista.map((n) => (
                  <li key={n.id} className={n.read ? "" : "nao-lida"}>
                    {n.message}
                    <small>
                      {" "}
                      — {new Date(n.createdAt).toLocaleString("pt-BR")}
                    </small>
                  </li>
                ))}
              </ul>
              {naoLidas > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={marcarTodasComoLidas}
                >
                  Marcar todas como lidas
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
