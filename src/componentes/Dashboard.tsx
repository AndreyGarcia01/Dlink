import { useState, useEffect } from "react";
import { api } from "../services/api";
import Perfil from "./Perfil";
import SearchBar from "./SearchBar";
import AcessibilidadeTags from "./AcessibilidadeTags";
import Direitos from "./Direitos";
import Notificacoes from "./Notificacoes";
import {
  RECURSOS_ACESSIBILIDADE,
  type RecursoAcessibilidade,
} from "../constantes/acessibilidade";
import axios from "axios";

interface DashboardProps {
  userName: string;
  userEmail: string;
  accountType?: "candidato" | "empresa";
  onLogout: () => void;
  onUpdateName: (name: string) => void;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  workRegion: string;
  category: string;
  company: { name: string };
  accessibilities?: RecursoAcessibilidade[];
  applications?: { id: string }[];
}

interface Application {
  id: string;
  status: "pending" | "approved" | "rejected";
  job: {
    title: string;
    company: { name: string };
  };
}

function opcoes(jobs: Job[], campo: "location" | "category" | "workRegion") {
  return [...new Set(jobs.map((job) => job[campo]).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
}

function Dashboard({
  userName,
  userEmail,
  onLogout,
  onUpdateName,
}: DashboardProps) {
  const initial = userName.charAt(0).toUpperCase();
  const [activeTab, setActiveTab] = useState<
    "inicio" | "candidaturas" | "direitos" | "perfil"
  >("inicio");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const [myApplications, setMyApplications] = useState<Application[]>([]);

  const [busca, setBusca] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroLocal, setFiltroLocal] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroRegime, setFiltroRegime] = useState("");
  const [filtroAcessibilidade, setFiltroAcessibilidade] = useState("");

  const termo = busca.trim().toLowerCase();
  const vagasFiltradas = jobs.filter(
    (job) =>
      (!termo ||
        [job.title, job.description, job.company.name]
          .join(" ")
          .toLowerCase()
          .includes(termo)) &&
      (!filtroLocal || job.location === filtroLocal) &&
      (!filtroArea || job.category === filtroArea) &&
      (!filtroRegime || job.workRegion === filtroRegime) &&
      (!filtroAcessibilidade ||
        (job.accessibilities ?? []).some(
          (r) =>
            r.resource === filtroAcessibilidade && r.status === "available",
        )),
  );
  const temFiltro = Boolean(
    termo || filtroLocal || filtroArea || filtroRegime || filtroAcessibilidade,
  );

  function limparFiltros() {
    setBusca("");
    setFiltroLocal("");
    setFiltroArea("");
    setFiltroRegime("");
    setFiltroAcessibilidade("");
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/applications/me"),
        ]);

        setJobs(jobsRes.data);

        const appliedIds = jobsRes.data
          .filter((job: Job) => job.applications && job.applications.length > 0)
          .map((job: Job) => job.id);
        setAppliedJobs(appliedIds);

        setMyApplications(appsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setIsLoading(false);
      }
    }
    void carregarDados();
  }, []);

  async function handleApply(jobId: string) {
    const precisaInterprete = window.confirm(
      "Você precisará de um intérprete de Libras na entrevista ou no primeiro contato?\n\nClique em 'OK' para SIM ou 'Cancelar' para NÃO.",
    );

    try {
      await api.post(`/jobs/${jobId}/apply`, {
        requiresInterpreter: precisaInterprete,
      });

      setAppliedJobs((prev) => [...prev, jobId]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        if (
          error.response.data.error === "Você já se candidatou a esta vaga."
        ) {
          setAppliedJobs((prev) => [...prev, jobId]);
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert("Erro ao se candidatar.");
      }
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        {}
        <div className="sidebar-logo">
          <div className="mini-logo">D</div>
          <span className="mini-logo-text">D-Link</span>
        </div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === "inicio" ? "active" : ""}`}
            onClick={() => setActiveTab("inicio")}
          >
            Início
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === "candidaturas" ? "active" : ""}`}
            onClick={() => setActiveTab("candidaturas")}
          >
            Candidaturas
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === "perfil" ? "active" : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            Meu Perfil
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === "direitos" ? "active" : ""}`}
            onClick={() => setActiveTab("direitos")}
          >
            Meus Direitos
          </button>
          <Notificacoes />
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-email">{userEmail}</div>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {activeTab === "inicio" && (
          <>
            <h1>Bem-vindo, {userName}!</h1>
            <p className="dashboard-subtitle">
              Encontre vagas acessíveis para você
            </p>

            <SearchBar
              value={busca}
              onSearch={setBusca}
              onFiltersClick={() => setMostrarFiltros((v) => !v)}
              filtersOpen={mostrarFiltros}
            />

            {mostrarFiltros && (
              <div id="painel-filtros" className="field-row">
                <div className="field">
                  <label htmlFor="filtro-local">Localidade</label>
                  <select
                    id="filtro-local"
                    value={filtroLocal}
                    onChange={(e) => setFiltroLocal(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {opcoes(jobs, "location").map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="filtro-area">Área de atuação</label>
                  <select
                    id="filtro-area"
                    value={filtroArea}
                    onChange={(e) => setFiltroArea(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {opcoes(jobs, "category").map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="filtro-regime">Regime</label>
                  <select
                    id="filtro-regime"
                    value={filtroRegime}
                    onChange={(e) => setFiltroRegime(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {opcoes(jobs, "workRegion").map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="filtro-acessibilidade">Acessibilidade</label>
                  <select
                    id="filtro-acessibilidade"
                    value={filtroAcessibilidade}
                    onChange={(e) => setFiltroAcessibilidade(e.target.value)}
                  >
                    <option value="">Qualquer</option>
                    {RECURSOS_ACESSIBILIDADE.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <p className="results-count" role="status">
              {vagasFiltradas.length} vagas encontradas
            </p>

            {isLoading ? (
              <p>Carregando vagas...</p>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhuma vaga encontrada</h3>
                <p>Ainda não há vagas publicadas. Volte em breve!</p>
              </div>
            ) : vagasFiltradas.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhuma vaga com esses filtros</h3>
                <p>Tente buscar por outro termo ou limpar os filtros.</p>
                {temFiltro && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="jobs-grid">
                {vagasFiltradas.map((job) => {
                  const hasApplied = appliedJobs.includes(job.id);

                  return (
                    <div key={job.id} className="job-card">
                      <div className="job-card-header">
                        <span className="job-tag">{job.category}</span>
                        <h3>{job.title}</h3>
                        <p className="job-company">{job.company.name}</p>
                      </div>
                      <p className="job-description">{job.description}</p>
                      {job.requirements && (
                        <p className="job-requirements">
                          <span className="rotulo">Requisitos:</span>{" "}
                          {job.requirements}
                        </p>
                      )}
                      <AcessibilidadeTags recursos={job.accessibilities} />
                      <div className="job-footer">
                        <span>📍 {job.location}</span>
                        <span>💼 {job.workRegion}</span>
                      </div>

                      {}
                      <button
                        className={`btn-apply ${hasApplied ? "applied" : ""}`}
                        onClick={() => !hasApplied && handleApply(job.id)}
                        disabled={hasApplied}
                      >
                        {hasApplied ? (
                          <>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ marginRight: "8px" }}
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Candidatado
                          </>
                        ) : (
                          "Candidatar-se"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "candidaturas" && (
          <div>
            <h1>Minhas Candidaturas</h1>
            <p className="dashboard-subtitle">
              Acompanhe o status das suas candidaturas
            </p>

            {myApplications.length === 0 ? (
              <div className="empty-state" style={{ marginTop: "40px" }}>
                <h3>Nenhuma candidatura ainda</h3>
                <p>
                  Explore as vagas disponíveis e candidate-se às que mais
                  combinam com você.
                </p>
              </div>
            ) : (
              <div className="jobs-grid" style={{ marginTop: "20px" }}>
                {myApplications.map((app) => (
                  <div key={app.id} className="job-card">
                    <div className="job-card-header">
                      <h3>{app.job.title}</h3>
                      <p className="job-company">{app.job.company.name}</p>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      {app.status === "pending" && (
                        <span className="status-badge status-pending">
                          ⏳ Em análise
                        </span>
                      )}
                      {app.status === "approved" && (
                        <span className="status-badge status-approved">
                          ✅ Aprovado
                        </span>
                      )}
                      {app.status === "rejected" && (
                        <span className="status-badge status-rejected">
                          ❌ Rejeitado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "perfil" && <Perfil onUpdateName={onUpdateName} />}

        {activeTab === "direitos" && <Direitos />}
      </main>
    </div>
  );
}

export default Dashboard;
