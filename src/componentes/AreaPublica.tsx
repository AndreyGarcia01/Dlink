import { useEffect, useState } from "react";
import { api } from "../services/api";
import AcessibilidadeTags from "./AcessibilidadeTags";
import Direitos from "./Direitos";
import type { RecursoAcessibilidade } from "../constantes/acessibilidade";

interface VagaPublica {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  workRegion: string;
  category: string | null;
  company: { name: string; sector: string | null };
  accessibilities: RecursoAcessibilidade[];
}

interface AreaPublicaProps {
  onLogin: () => void;
  onCreateAccount: () => void;
}

export default function AreaPublica({
  onLogin,
  onCreateAccount,
}: AreaPublicaProps) {
  const [aba, setAba] = useState<"vagas" | "direitos">("vagas");
  const [vagas, setVagas] = useState<VagaPublica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await api.get("/public/jobs");
        setVagas(data);
      } catch {
        setErro(
          "Não foi possível carregar as vagas. Tente de novo mais tarde.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, []);

  return (
    <div className="area-publica">
      <header className="area-publica-topo">
        <div className="sidebar-logo">
          <div className="mini-logo">D</div>
          <span className="mini-logo-text">D-Link</span>
        </div>
        <nav className="area-publica-acoes">
          <button type="button" className="btn-secondary" onClick={onLogin}>
            Entrar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onCreateAccount}
          >
            Criar conta
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        <h1>Vagas inclusivas para a comunidade surda</h1>
        <p className="dashboard-subtitle">
          Veja as oportunidades e os recursos de acessibilidade de cada empresa.
          Para se candidatar, entre ou crie sua conta gratuita.
        </p>

        <div className="area-publica-abas" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === "vagas"}
            className={`nav-item ${aba === "vagas" ? "active" : ""}`}
            onClick={() => setAba("vagas")}
          >
            Vagas abertas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === "direitos"}
            className={`nav-item ${aba === "direitos" ? "active" : ""}`}
            onClick={() => setAba("direitos")}
          >
            Seus direitos
          </button>
        </div>

        {aba === "vagas" && (
          <>
            {isLoading && <p>Carregando vagas...</p>}
            {erro && <p role="alert">{erro}</p>}
            {!isLoading && !erro && vagas.length === 0 && (
              <div className="empty-state">
                <h3>Nenhuma vaga aberta no momento</h3>
                <p>Volte em breve!</p>
              </div>
            )}
            <div className="jobs-grid">
              {vagas.map((vaga) => (
                <article key={vaga.id} className="job-card">
                  <div className="job-card-header">
                    {vaga.category && (
                      <span className="job-tag">{vaga.category}</span>
                    )}
                    <h3>{vaga.title}</h3>
                    <p className="job-company">{vaga.company.name}</p>
                  </div>
                  <p className="job-description">{vaga.description}</p>
                  <p className="job-requirements">
                    <span className="rotulo">Requisitos:</span>{" "}
                    {vaga.requirements}
                  </p>
                  <AcessibilidadeTags recursos={vaga.accessibilities} />
                  <div className="job-footer">
                    <span>📍 {vaga.location}</span>
                    <span>💼 {vaga.workRegion}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-apply"
                    onClick={onCreateAccount}
                  >
                    Quero me candidatar
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        {aba === "direitos" && <Direitos />}
      </main>
    </div>
  );
}
