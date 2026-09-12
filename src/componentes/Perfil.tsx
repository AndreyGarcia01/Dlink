import { useRef, useState } from "react";

function Perfil() {
  const [nome, setNome] = useState("");
  const [perdaAuditiva, setPerdaAuditiva] = useState("Profundo");
  const [comunicacao, setComunicacao] = useState("Libras");
  const [resumo, setResumo] = useState("");
  const [novaHabilidade, setNovaHabilidade] = useState("");
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [videoNome, setVideoNome] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = nome.charAt(0).toUpperCase() || "U";

  const adicionarHabilidade = () => {
    const valor = novaHabilidade.trim();
    if (!valor) return;
    setHabilidades((prev) => [...prev, valor]);
    setNovaHabilidade("");
  };

  const removerHabilidade = (index: number) => {
    setHabilidades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideoNome(file ? file.name : null);
  };

  return (
    <div className="perfil-page">
      <h1>Meu Perfil</h1>
      <p className="dashboard-subtitle">
        Mantenha seu perfil atualizado para melhores oportunidades
      </p>

      <div className="perfil-card">
        <h3>Informações básicas</h3>
        <div className="perfil-basic-row">
          <div className="perfil-avatar">{initial}</div>
          <div className="field perfil-name-field">
            <label htmlFor="perfil-nome">Nome completo</label>
            <input
              id="perfil-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="perfil-perda">Grau de perda auditiva</label>
            <select
              id="perfil-perda"
              value={perdaAuditiva}
              onChange={(e) => setPerdaAuditiva(e.target.value)}
            >
              <option>Leve</option>
              <option>Moderada</option>
              <option>Severa</option>
              <option>Profundo</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="perfil-comunicacao">
              Preferência de comunicação
            </label>
            <select
              id="perfil-comunicacao"
              value={comunicacao}
              onChange={(e) => setComunicacao(e.target.value)}
            >
              <option>Libras</option>
              <option>Leitura labial</option>
              <option>Escrita</option>
              <option>Outro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <h3>Resumo profissional</h3>
        <textarea
          className="perfil-textarea"
          placeholder="Conte um pouco sobre você, suas habilidades e objetivos profissionais..."
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
        />
      </div>

      <div className="perfil-card">
        <h3>Habilidades</h3>
        <div className="skill-add-row">
          <input
            type="text"
            placeholder="Ex: JavaScript, Libras, Excel..."
            value={novaHabilidade}
            onChange={(e) => setNovaHabilidade(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarHabilidade();
              }
            }}
          />
          <button
            type="button"
            className="skill-add-btn"
            onClick={adicionarHabilidade}
            aria-label="Adicionar habilidade"
          >
            +
          </button>
        </div>

        {habilidades.length === 0 ? (
          <p className="perfil-empty-hint">Adicione suas habilidades acima.</p>
        ) : (
          <div className="skill-tags">
            {habilidades.map((h, i) => (
              <span key={`${h}-${i}`} className="skill-tag">
                {h}
                <button
                  type="button"
                  onClick={() => removerHabilidade(i)}
                  aria-label={`Remover ${h}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="perfil-card">
        <div className="perfil-card-header">
          <h3>Experiência profissional</h3>
          <button type="button" className="add-link">
            + Adicionar
          </button>
        </div>
        <p className="perfil-empty-hint">
          Nenhuma experiência adicionada ainda.
        </p>
      </div>

      <div className="perfil-card">
        <div className="perfil-card-header">
          <h3>Formação acadêmica</h3>
          <button type="button" className="add-link">
            + Adicionar
          </button>
        </div>
        <p className="perfil-empty-hint">Nenhuma formação adicionada ainda.</p>
      </div>

      <div className="perfil-card">
        <h3>
          <span className="video-icon" aria-hidden="true">
            ▶
          </span>{" "}
          Vídeo de apresentação em Libras
        </h3>
        <p className="perfil-hint">Máx. 50MB — .mp4, .mov, .webm</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          ▶ {videoNome ? videoNome : "Enviar vídeo de apresentação"}
        </button>
      </div>

      <button type="button" className="save-btn">
        💾 Salvar alterações
      </button>
    </div>
  );
}

export default Perfil;
