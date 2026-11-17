import { useState, useEffect } from "react";
import { api } from "../services/api";

// 1. Adicionando a interface para receber a função do Dashboard
interface PerfilProps {
  onUpdateName?: (name: string) => void;
}

function Perfil({ onUpdateName }: PerfilProps) {
  const [name, setName] = useState("");
  const [hearingLossLevel, setHearingLossLevel] = useState("Profundo");
  const [communicationPreference, setCommunicationPreference] =
    useState("Libras");
  const [bio, setBio] = useState("");

  // 2. Novos estados para Experiência e Formação
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // 3. Estado do botão verde

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/profile/me");
        const data = response.data;

        setName(data.name || "");
        setHearingLossLevel(data.hearingLossLevel || "Profundo");
        setCommunicationPreference(data.communicationPreference || "Libras");

        if (data.candidateProfile) {
          setBio(data.candidateProfile.bio || "");
          // Buscando experiência e formação do banco
          setExperience(data.candidateProfile.experience || "");
          setEducation(data.candidateProfile.education || "");

          const skillsArray = data.candidateProfile.skills
            ? data.candidateProfile.skills
                .split(",")
                .map((s: string) => s.trim())
            : [];
          setSkills(skillsArray);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleAddSkill = () => {
    const value = newSkill.trim();
    if (!value) return;
    setSkills((prev) => [...prev, value]);
    setNewSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      await api.put("/profile/me", {
        name,
        hearingLossLevel,
        communicationPreference,
        bio,
        skills,
        experience, // Enviando para o backend
        education, // Enviando para o backend
      });

      // Atualiza o nome na barra lateral esquerda imediatamente
      if (onUpdateName) onUpdateName(name);

      // 4. Ativa o botão verde por 3 segundos
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const initial = name.charAt(0).toUpperCase() || "U";

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Carregando perfil...
      </div>
    );
  }

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

      {/* 6. Inputs diretos para Formação */}
      <div className="perfil-card">
        <h3>Formação acadêmica</h3>
        <textarea
          className="perfil-textarea"
          placeholder="Descreva sua formação acadêmica (cursos, faculdades...)"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
      </div>

      {/* BOTÃO COM FEEDBACK VISUAL VERDE */}
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

export default Perfil;
