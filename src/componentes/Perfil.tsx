import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { api } from "../services/api";

function linkSeguro(endereco: string) {
  try {
    const url = new URL(endereco);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

interface PerfilProps {
  onUpdateName?: (name: string) => void;
}

function Perfil({ onUpdateName }: PerfilProps) {
  const [nome, setNome] = useState("");
  const [perdaAuditiva, setPerdaAuditiva] = useState("Profundo");
  const [comunicacao, setComunicacao] = useState("Libras");
  const [resumo, setResumo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [formacao, setFormacao] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSalvo, setVideoSalvo] = useState("");
  const [novaHabilidade, setNovaHabilidade] = useState("");
  const [habilidades, setHabilidades] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "ok" | "erro";
    texto: string;
  } | null>(null);

  const initial = nome.charAt(0).toUpperCase() || "U";

  async function carregarPerfil() {
    try {
      const { data } = await api.get("/profile/me");
      const perfil = data.candidateProfile ?? {};

      setNome(data.name || "");
      setPerdaAuditiva(data.hearingLossLevel || "Profundo");
      setComunicacao(data.communicationPreference || "Libras");
      setResumo(perfil.bio || "");
      setExperiencia(perfil.experience || "");
      setFormacao(perfil.education || "");
      setVideoUrl(perfil.videoUrl || "");
      setVideoSalvo(perfil.videoUrl || "");
      setHabilidades(
        perfil.skills
          ? perfil.skills
              .split(",")
              .map((h: string) => h.trim())
              .filter(Boolean)
          : [],
      );
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível carregar seu perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  const adicionarHabilidade = () => {
    const valor = novaHabilidade.trim();
    if (!valor) return;
    setHabilidades((prev) => [...prev, valor]);
    setNovaHabilidade("");
  };

  const removerHabilidade = (index: number) => {
    setHabilidades((prev) => prev.filter((_, i) => i !== index));
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setIsSaving(true);
    try {
      await api.put("/profile/me", {
        name: nome.trim(),
        hearingLossLevel: perdaAuditiva,
        communicationPreference: comunicacao,
        bio: resumo,
        skills: habilidades,
        experience: experiencia,
        education: formacao,
        videoUrl: videoUrl.trim(),
      });
      onUpdateName?.(nome.trim());

      await carregarPerfil();
      setMensagem({ tipo: "ok", texto: "Perfil salvo com sucesso!" });
    } catch (error) {
      const texto =
        axios.isAxiosError<{ error?: string }>(error) &&
        error.response?.data?.error
          ? error.response.data.error
          : "Erro ao salvar o perfil.";
      setMensagem({ tipo: "erro", texto });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="perfil-page">Carregando perfil...</p>;
  }

  return (
    <form className="perfil-page" onSubmit={salvar}>
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
        <h3>
          <label htmlFor="perfil-resumo">Resumo profissional</label>
        </h3>
        <textarea
          id="perfil-resumo"
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
            aria-label="Nova habilidade"
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
        <h3>
          <label htmlFor="perfil-experiencia">Experiência profissional</label>
        </h3>
        <textarea
          id="perfil-experiencia"
          className="perfil-textarea"
          placeholder="Ex: Auxiliar administrativo na Empresa X (2023–2025)..."
          value={experiencia}
          onChange={(e) => setExperiencia(e.target.value)}
        />
      </div>

      <div className="perfil-card">
        <h3>
          <label htmlFor="perfil-formacao">Formação acadêmica</label>
        </h3>
        <textarea
          id="perfil-formacao"
          className="perfil-textarea"
          placeholder="Ex: Técnico em Informática — Instituto Y (2022)..."
          value={formacao}
          onChange={(e) => setFormacao(e.target.value)}
        />
      </div>

      <div className="perfil-card">
        <h3>
          <label htmlFor="perfil-video">Vídeo de apresentação em Libras</label>
        </h3>
        <p className="perfil-empty-hint">
          Cole o link do seu vídeo (YouTube, Google Drive etc.).
        </p>
        <div className="field">
          <input
            id="perfil-video"
            type="url"
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>
        {linkSeguro(videoSalvo) && (
          <p>
            <a
              href={linkSeguro(videoSalvo)!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Assistir ao meu vídeo em Libras
            </a>
          </p>
        )}
      </div>

      {mensagem && (
        <p
          role={mensagem.tipo === "erro" ? "alert" : "status"}
          style={{ color: mensagem.tipo === "erro" ? "red" : "green" }}
        >
          {mensagem.texto}
        </p>
      )}

      <button type="submit" className="save-btn" disabled={isSaving}>
        {isSaving ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

export default Perfil;
