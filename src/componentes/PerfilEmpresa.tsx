import { useState, useEffect } from "react";
import { api } from "../services/api";

// 1. ADICIONANDO A INTERFACE DE PROPS
interface PerfilEmpresaProps {
  onUpdateName?: (name: string) => void;
}

// 2. RECEBENDO A FUNÇÃO NA DESESTRUTURAÇÃO
function PerfilEmpresa({ onUpdateName }: PerfilEmpresaProps) {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");
  const [descricao, setDescricao] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const response = await api.get("/profile/me");
        const data = response.data;
        setRazaoSocial(data.name || "");
        setCnpj(data.cnpj || "");
        setSetor(data.sector || "");
        setDescricao(data.companyDescription || "");
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
      } finally {
        setIsLoading(false);
      }
    }
    carregarPerfil();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      await api.put("/profile/me", {
        name: razaoSocial,
        cnpj: cnpj,
        sector: setor,
        companyDescription: descricao,
      });

      // 3. AVISANDO O COMPONENTE PAI (App.tsx via PainelEmpresa) QUE O NOME MUDOU
      if (onUpdateName) onUpdateName(razaoSocial);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Erro ao salvar o perfil da empresa.");
    } finally {
      setIsSaving(false);
    }
  };

  const initial = razaoSocial.charAt(0).toUpperCase() || "E";

  if (isLoading)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Carregando perfil...
      </div>
    );

  return (
    <div className="perfil-page">
      <h1>Perfil da Empresa</h1>
      <p className="dashboard-subtitle">
        Informações visíveis para os candidatos
      </p>

      <div className="perfil-card">
        <h3>Informações básicas</h3>
        <div className="perfil-basic-row">
          <div className="perfil-avatar">{initial}</div>
          <div className="field perfil-name-field">
            <label>Razão Social *</label>
            <input
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div className="field">
            <label>Setor de atuação</label>
            <input
              type="text"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              placeholder="Ex: Tecnologia"
            />
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <h3>Resumo da empresa</h3>
        <textarea
          className="perfil-textarea"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Conte um pouco sobre a empresa, cultura e ações de inclusão..."
        />
      </div>

      <button
        type="button"
        className={`save-btn ${isSaved ? "saved" : ""}`}
        onClick={handleSave}
        disabled={isSaving || isSaved}
      >
        {isSaving
          ? "Salvando..."
          : isSaved
            ? "Salvo com sucesso! ✅"
            : "Salvar alterações"}
      </button>
    </div>
  );
}

export default PerfilEmpresa;
