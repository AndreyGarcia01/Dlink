import { useState, FormEvent } from "react";

interface Vaga {
  id: number;
  titulo: string;
  modalidade: "Presencial" | "Híbrido" | "Remoto";
  cidade: string;
  descricao: string;
  status: "Ativo" | "Encerrado";
  candidatos: number;
}

interface PainelEmpresaProps {
  nomeEmpresa: string;
}

const vagasIniciais: Vaga[] = [
  {
    id: 1,
    titulo: "Marketing Digital",
    modalidade: "Presencial",
    cidade: "Joinville, SC",
    descricao: "",
    status: "Ativo",
    candidatos: 0,
  },
  {
    id: 2,
    titulo: "Desenvolvedor Front-end pleno",
    modalidade: "Híbrido",
    cidade: "São Francisco do Sul, SC",
    descricao: "",
    status: "Encerrado",
    candidatos: 0,
  },
];

function vagaVazia(): Omit<Vaga, "id" | "status" | "candidatos"> {
  return { titulo: "", modalidade: "Presencial", cidade: "", descricao: "" };
}

function PainelEmpresa({ nomeEmpresa }: PainelEmpresaProps) {
  const [vagas, setVagas] = useState<Vaga[]>(vagasIniciais);
  const [view, setView] = useState<"lista" | "form">("lista");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState(vagaVazia());

  const abrirNovaVaga = () => {
    setEditandoId(null);
    setForm(vagaVazia());
    setView("form");
  };

  const abrirEdicao = (vaga: Vaga) => {
    setEditandoId(vaga.id);
    setForm({
      titulo: vaga.titulo,
      modalidade: vaga.modalidade,
      cidade: vaga.cidade,
      descricao: vaga.descricao,
    });
    setView("form");
  };

  const salvarVaga = (e: FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    if (editandoId === null) {
      const novaVaga: Vaga = {
        id: Date.now(),
        titulo: form.titulo.trim(),
        modalidade: form.modalidade,
        cidade: form.cidade.trim(),
        descricao: form.descricao.trim(),
        status: "Ativo",
        candidatos: 0,
      };
      setVagas((prev) => [novaVaga, ...prev]);
    } else {
      setVagas((prev) =>
        prev.map((v) =>
          v.id === editandoId
            ? {
                ...v,
                titulo: form.titulo.trim(),
                modalidade: form.modalidade,
                cidade: form.cidade.trim(),
                descricao: form.descricao.trim(),
              }
            : v,
        ),
      );
    }

    setView("lista");
  };

  const alternarStatus = (id: number) => {
    setVagas((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: v.status === "Ativo" ? "Encerrado" : "Ativo" }
          : v,
      ),
    );
  };

  if (view === "form") {
    return (
      <div className="painel-page">
        <h1>{editandoId === null ? "Nova vaga" : "Editar vaga"}</h1>
        <p className="dashboard-subtitle">Preencha os detalhes da vaga</p>

        <div className="perfil-card">
          <form onSubmit={salvarVaga}>
            <div className="field">
              <label htmlFor="vaga-titulo">Título da vaga *</label>
              <input
                id="vaga-titulo"
                type="text"
                placeholder="Ex: Desenvolvedor Front-end pleno"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="vaga-modalidade">Modalidade</label>
                <select
                  id="vaga-modalidade"
                  value={form.modalidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      modalidade: e.target.value as Vaga["modalidade"],
                    })
                  }
                >
                  <option>Presencial</option>
                  <option>Híbrido</option>
                  <option>Remoto</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="vaga-cidade">Cidade/Estado</label>
                <input
                  id="vaga-cidade"
                  type="text"
                  placeholder="Ex: Joinville, SC"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="vaga-descricao">Descrição da vaga</label>
              <textarea
                id="vaga-descricao"
                className="perfil-textarea"
                placeholder="Descreva as responsabilidades, requisitos e benefícios..."
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary btn-auto"
                onClick={() => setView("lista")}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary btn-auto">
                {editandoId === null ? "Publicar vaga" : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="painel-page">
      <div className="painel-header">
        <div>
          <h1>Painel da empresa</h1>
          <p className="dashboard-subtitle">{nomeEmpresa}</p>
        </div>
        <button
          type="button"
          className="btn-primary btn-auto"
          onClick={abrirNovaVaga}
        >
          + Nova vaga
        </button>
      </div>

      <h3 className="painel-section-title">Suas vagas</h3>

      {vagas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3>Nenhuma vaga publicada</h3>
          <p>Clique em "Nova vaga" para publicar a primeira.</p>
        </div>
      ) : (
        <div className="vaga-list">
          {vagas.map((vaga) => (
            <div key={vaga.id} className="vaga-card">
              <div className="vaga-info">
                <div className="vaga-title-row">
                  <button
                    type="button"
                    className="vaga-title-btn"
                    onClick={() => abrirEdicao(vaga)}
                  >
                    {vaga.titulo}
                  </button>
                  <span
                    className={`status-badge${vaga.status === "Ativo" ? " active" : " closed"}`}
                  >
                    {vaga.status}
                  </span>
                </div>
                <div className="vaga-tags">
                  <span className="job-tag">{vaga.modalidade}</span>
                  {vaga.cidade && (
                    <span className="vaga-meta">{vaga.cidade}</span>
                  )}
                  <span className="vaga-meta">
                    👥 {vaga.candidatos} candidatos
                  </span>
                </div>
              </div>
              <div className="vaga-actions">
                <button
                  type="button"
                  className="btn-primary btn-auto btn-small"
                >
                  👥 Candidatos
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-auto btn-small"
                  onClick={() => alternarStatus(vaga.id)}
                >
                  {vaga.status === "Ativo" ? "Encerrar" : "Reativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PainelEmpresa;
