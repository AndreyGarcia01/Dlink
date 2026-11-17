import { useState } from "react";

interface PerfilEmpresaProps {
  nomeEmpresa: string;
}

function PerfilEmpresa({ nomeEmpresa }: PerfilEmpresaProps) {
  const [razaoSocial, setRazaoSocial] = useState(nomeEmpresa);
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");
  const [descricao, setDescricao] = useState("");

  return (
    <div className="perfil-page">
      <h1>Perfil da Empresa</h1>
      <p className="dashboard-subtitle">
        Informações visíveis para os candidatos
      </p>

      <div className="perfil-card">
        <h3>Informações da empresa</h3>

        <div className="empresa-logo-row">
          <div className="empresa-logo-box">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4" />
              <path d="M10 10h4" />
              <path d="M10 14h4" />
              <path d="M10 18h4" />
            </svg>
          </div>
          <div>
            <div className="empresa-logo-title">Logo da empresa</div>
            <div className="empresa-logo-hint">Upload de logo (em breve)</div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="empresa-razao">Razão social *</label>
          <input
            id="empresa-razao"
            type="text"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="empresa-cnpj">CNPJ</label>
            <input
              id="empresa-cnpj"
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div className="field">
            <label htmlFor="empresa-setor">Setor de atuação</label>
            <input
              id="empresa-setor"
              type="text"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              placeholder="Ex: Tecnologia, Varejo..."
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="empresa-descricao">Descrição da empresa</label>
          <textarea
            id="empresa-descricao"
            className="perfil-textarea"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Conte um pouco sobre a empresa, cultura e ações de inclusão..."
          />
        </div>
      </div>

      <button type="button" className="save-btn">
        Salvar alterações
      </button>
    </div>
  );
}

export default PerfilEmpresa;
