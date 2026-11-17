import { useState, useEffect } from "react";
import { api } from "../services/api";
import Perfil from "./Perfil";
import axios from "axios";
import type { Job } from "../types/job";
import type { Application } from "../types/application";
import SearchBar from "./SearchBar";

interface DashboardProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onUpdateName: (name: string) => void;
}

function Dashboard({
  userName,
  userEmail,
  onLogout,
  onUpdateName,
}: DashboardProps) {
  const initial = userName.charAt(0).toUpperCase();
  const [activeTab, setActiveTab] = useState<
    "inicio" | "candidaturas" | "perfil"
  >("inicio");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);

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
    carregarDados();
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

            <SearchBar />

            <p className="results-count">{jobs.length} vagas encontradas</p>

            {isLoading ? (
              <p>Carregando vagas...</p>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhuma vaga encontrada</h3>
                <p>Ainda não há vagas publicadas. Volte em breve!</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job) => {
                  const hasApplied = appliedJobs.includes(job.id);

                  return (
                    <div key={job.id} className="job-card">
                      <div className="job-card-header">
                        <span className="job-tag">{job.category}</span>
                        <h3>{job.title}</h3>
                        <p className="job-company">{job.company.name}</p>
                      </div>
                      <p className="job-description">{job.description}</p>
                      <div className="job-footer">
                        <span>📍 {job.location}</span>
                        <span>💼 {job.workRegion}</span>
                      </div>

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
                      <h3>{app.job?.title}</h3>
                      <p className="job-company">{app.job?.company.name}</p>
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
      </main>
    </div>
  );
}

export default Dashboard;
