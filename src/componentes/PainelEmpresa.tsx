import { useState, useEffect } from "react";
import { api } from "../services/api";
import axios from "axios";
import PerfilEmpresa from "./PerfilEmpresa"; // <-- 1. Importação do Perfil

interface PainelEmpresaProps {
  onLogout: () => void;
}

interface Job {
  id: string;
  title: string;
  status: string;
  location: string;
  workRegion: string;
  _count: { applications: number };
}

interface Application {
  id: string;
  status: "pending" | "approved" | "rejected";
  candidate: {
    name: string;
    email: string;
    communicationPreference: string;
    candidateProfile?: { bio: string; skills: string };
  };
}

function PainelEmpresa({ onLogout }: PainelEmpresaProps) {
  // <-- 2. Adicionado o "perfil" nas opções de aba
  const [activeTab, setActiveTab] = useState<
    "vagas" | "criar" | "candidatos" | "perfil"
  >("vagas");

  // Estados do formulário de vaga
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [workRegion, setWorkRegion] = useState("Presencial");

  // Estados de Vaga e Candidatos
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  async function carregarVagas() {
    try {
      const response = await api.get("/jobs/company/me");
      setJobs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "vagas") carregarVagas();
  }, [activeTab]);

  const handleCriarVaga = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/jobs", {
        title,
        description,
        requirements,
        location,
        workRegion,
        category: "Geral",
      });
      alert("Vaga publicada com sucesso!");
      setTitle("");
      setDescription("");
      setRequirements("");
      setLocation("");
      setActiveTab("vagas");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error)
        alert(error.response.data.error);
      else alert("Erro ao publicar vaga.");
    }
  };

  const verCandidatos = async (jobId: string, jobTitle: string) => {
    setSelectedJobTitle(jobTitle);
    setActiveTab("candidatos");
    setIsLoadingCandidates(true);
    try {
      const response = await api.get(`/jobs/${jobId}/candidates`);
      setCandidates(response.data);
    } catch (error) {
      console.error("Erro ao buscar candidatos", error);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const alterarStatus = async (
    applicationId: string,
    newStatus: "approved" | "rejected",
  ) => {
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === applicationId ? { ...c, status: newStatus } : c,
        ),
      );
    } catch {
      alert("Erro ao atualizar status.");
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="mini-logo">D</div>
          <span className="mini-logo-text">D-Link</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "vagas" ? "active" : ""}`}
            onClick={() => setActiveTab("vagas")}
          >
            Minhas Vagas
          </button>
          <button
            className={`nav-item ${activeTab === "criar" ? "active" : ""}`}
            onClick={() => setActiveTab("criar")}
          >
            Publicar Nova Vaga
          </button>

          {/* 3. Novo Botão de Perfil no Menu Lateral */}
          <button
            className={`nav-item ${activeTab === "perfil" ? "active" : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            Meu Perfil
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* ABA DE VAGAS */}
        {activeTab === "vagas" && (
          <div>
            <h1>Minhas Vagas</h1>
            <p className="dashboard-subtitle">
              Gerencie as oportunidades que você publicou
            </p>
            {isLoading ? (
              <p>Carregando vagas...</p>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-header">
                      <span
                        className={`job-tag ${job.status === "active" ? "bg-green" : "bg-gray"}`}
                      >
                        {job.status === "active" ? "Ativa" : "Encerrada"}
                      </span>
                      <h3>{job.title}</h3>
                      <p className="job-company">
                        📍 {job.location} • 💼 {job.workRegion}
                      </p>
                    </div>
                    <div className="job-footer" style={{ marginTop: "16px" }}>
                      <span>👥 {job._count.applications} candidato(s)</span>
                      <button
                        className="btn-apply"
                        style={{
                          width: "auto",
                          marginTop: 0,
                          padding: "8px 16px",
                        }}
                        onClick={() => verCandidatos(job.id, job.title)}
                      >
                        Ver Candidatos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA DE CRIAR VAGA */}
        {activeTab === "criar" && (
          <div className="perfil-page" style={{ textAlign: "left" }}>
            <h1>Publicar Nova Vaga</h1>
            <form onSubmit={handleCriarVaga} className="perfil-card">
              <div className="field">
                <label>Título</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Descrição</label>
                <textarea
                  className="perfil-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Requisitos</label>
                <textarea
                  className="perfil-textarea"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Localidade</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Regime</label>
                  <select
                    value={workRegion}
                    onChange={(e) => setWorkRegion(e.target.value)}
                  >
                    <option>Presencial</option>
                    <option>Híbrido</option>
                    <option>Remoto</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="save-btn"
                style={{ marginTop: "20px" }}
              >
                Publicar Vaga
              </button>
            </form>
          </div>
        )}

        {/* ABA DE CANDIDATOS */}
        {activeTab === "candidatos" && (
          <div>
            <button
              className="btn-secondary"
              style={{
                width: "auto",
                marginBottom: "20px",
                padding: "8px 16px",
              }}
              onClick={() => setActiveTab("vagas")}
            >
              ← Voltar para Minhas Vagas
            </button>
            <h1>Candidatos para: {selectedJobTitle}</h1>

            {isLoadingCandidates ? (
              <p>Buscando candidatos...</p>
            ) : candidates.length === 0 ? (
              <p>Nenhum candidato se aplicou a esta vaga ainda.</p>
            ) : (
              <div className="jobs-grid">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="job-card">
                    <div className="job-card-header">
                      <h3>{candidate.candidate.name}</h3>
                      <p className="job-company">{candidate.candidate.email}</p>
                      <p
                        style={{
                          fontSize: "13px",
                          marginTop: "8px",
                          color: "#666",
                        }}
                      >
                        🗣️ Comunicação:{" "}
                        {candidate.candidate.communicationPreference ||
                          "Não informada"}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "15px",
                        borderTop: "1px solid #e0e0e0",
                      }}
                    >
                      <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
                        Status:{" "}
                        {candidate.status === "pending"
                          ? "⏳ Em análise"
                          : candidate.status === "approved"
                            ? "✅ Aprovado"
                            : "❌ Rejeitado"}
                      </p>

                      {candidate.status === "pending" && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className="save-btn"
                            style={{ background: "#2e7d32", padding: "10px" }}
                            onClick={() =>
                              alterarStatus(candidate.id, "approved")
                            }
                          >
                            Aprovar
                          </button>
                          <button
                            className="save-btn"
                            style={{ background: "#d32f2f", padding: "10px" }}
                            onClick={() =>
                              alterarStatus(candidate.id, "rejected")
                            }
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. RENDERIZAÇÃO DA ABA DE PERFIL DA EMPRESA */}
        {activeTab === "perfil" && <PerfilEmpresa />}
      </main>
    </div>
  );
}

export default PainelEmpresa;
