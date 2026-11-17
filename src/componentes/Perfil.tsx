import { useState } from "react";

function Perfil() {
  const [nome, setNome] = useState("");
  const [perdaAuditiva, setPerdaAuditiva] = useState("Profundo");
  const [comunicacao, setComunicacao] = useState("Libras");
  const [resumo, setResumo] = useState("");
  const [novaHabilidade, setNovaHabilidade] = useState("");
  const [habilidades, setHabilidades] = useState<string[]>([]);

  const initial = nome.charAt(0).toUpperCase() || "U";

  const adicionarHabilidade = () => {
    const valor = novaHabilidade.trim();
    if (!valor) return;
    setHabilidades((prev) => [...prev, valor]);
    setNovaHabilidade("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="perfil-perda">Grau de perda auditiva</label>
            <select
              id="perfil-perda"
              value={hearingLossLevel}
              onChange={(e) => setHearingLossLevel(e.target.value)}
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
              value={communicationPreference}
              onChange={(e) => setCommunicationPreference(e.target.value)}
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
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="perfil-card">
        <h3>Habilidades</h3>
        <div className="skill-add-row">
          <input
            type="text"
            placeholder="Ex: JavaScript, Libras, Excel..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <button
            type="button"
            className="skill-add-btn"
            onClick={handleAddSkill}
            aria-label="Adicionar habilidade"
          >
            +
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="perfil-empty-hint">Adicione suas habilidades acima.</p>
        ) : (
          <div className="skill-tags">
            {skills.map((h, i) => (
              <span key={`${h}-${i}`} className="skill-tag">
                {h}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(i)}
                  aria-label={`Remover ${h}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 5. Inputs diretos para Experiência */}
      <div className="perfil-card">
        <h3>Experiência profissional</h3>
        <textarea
          className="perfil-textarea"
          placeholder="Descreva suas experiências profissionais anteriores..."
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>

      <button type="button" className="save-btn">
        💾 Salvar alterações
      </button>
    </div>
  );
}

export default Perfil;
