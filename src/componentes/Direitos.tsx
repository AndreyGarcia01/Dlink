import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Conteudo {
  id: string;
  title: string;
  body: string | null;
  transcript: string | null;
  videoUrl: string | null;
}

export default function Direitos() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await api.get("/public/contents");
        setConteudos(data);
      } catch {
        setErro(
          "Não foi possível carregar os conteúdos. Tente de novo mais tarde.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, []);

  return (
    <section className="direitos" aria-labelledby="titulo-direitos">
      <h2 id="titulo-direitos">Seus direitos no trabalho</h2>
      <p className="dashboard-subtitle">
        Informações sobre as leis que protegem pessoas surdas e com deficiência
        auditiva. Use o botão do VLibras, no canto da tela, para ver em Libras.
      </p>

      {isLoading && <p>Carregando conteúdos...</p>}
      {erro && <p role="alert">{erro}</p>}
      {!isLoading && !erro && conteudos.length === 0 && (
        <p>Nenhum conteúdo publicado ainda.</p>
      )}

      {conteudos.map((c) => (
        <article key={c.id} className="perfil-card direito-card">
          <h3>{c.title}</h3>
          {c.transcript && (
            <p>
              <strong>Em resumo:</strong> {c.transcript}
            </p>
          )}
          {c.body && (
            <details>
              <summary>Ler explicação completa</summary>
              <p>{c.body}</p>
            </details>
          )}
        </article>
      ))}

      <p className="aviso-legal">
        Conteúdo informativo. Em caso de dúvida sobre o seu caso, procure a
        Defensoria Pública ou o Ministério Público do Trabalho.
      </p>
    </section>
  );
}
