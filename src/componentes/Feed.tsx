interface FeedProps {
  onLogout: () => void;
}

function Feed({ onLogout }: FeedProps) {
  return (
    <div id="app">
      <header>
        <div className="header-container">
          <div className="logo">DeafLink</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar profissionais, empresas..."
            />
          </div>
          <div className="nav-buttons">
            <a href="#home">Início</a>
            <a href="#jobs">Oportunidades</a>
            <a href="#network">Rede</a>
            <button className="btn btn-login" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <aside className="sidebar-left">
          <div className="profile-card">
            <div className="profile-pic">👤</div>
            <h3>João Silva</h3>
            <p>Designer UX/UI • São Paulo, SP</p>
            <button
              className="btn"
              style={{ background: "#0077b6", color: "white", width: "100%" }}
            >
              Ver Perfil
            </button>
          </div>
          <div className="stats">
            <div>
              <div className="stats-number">245</div>
              <div>Conexões</div>
            </div>
            <div>
              <div className="stats-number">12</div>
              <div>Recomendações</div>
            </div>
          </div>
        </aside>

        <main className="main-feed">
          <div className="create-post">
            <div className="post-input-group">
              <div className="profile-pic" style={{ width: 40, height: 40 }}>
                👤
              </div>
              <input
                type="text"
                placeholder="Compartilhe uma oportunidade ou seu conhecimento..."
              />
            </div>
            <div className="post-actions">
              <button>📷 Mídia</button>
              <button>📅 Evento</button>
              <button>💼 Vaga</button>
            </div>
          </div>

          <article className="post">
            <div className="post-header">
              <div className="post-avatar">🏢</div>
              <div className="post-info">
                <h4>TechCorp Brasil</h4>
                <p>2 horas atrás</p>
              </div>
            </div>
            <div className="post-content">
              🎯 Estamos contratando! Procuramos desenvolvedores surdos para
              nossa equipe de TI. Salário competitivo + benefícios inclusivos.
              Interessados, enviem CV! #Inclusão #Tecnologia
            </div>
            <div className="post-engagement">
              <button>👍 Gostei (45)</button>
              <button>💬 Comentar (8)</button>
              <button>➡️ Compartilhar</button>
            </div>
          </article>

          <article className="post">
            <div className="post-header">
              <div className="post-avatar">👨</div>
              <div className="post-info">
                <h4>Maria Santos</h4>
                <p>Analista de Sistemas • RJ</p>
                <p>4 horas atrás</p>
              </div>
            </div>
            <div className="post-content">
              Feliz em anunciar que fui promovida a Líder Técnica! Agradeço à
              minha equipe pelo apoio e inclusão. A acessibilidade no trabalho
              fez toda diferença! 🙌
            </div>
            <div className="post-engagement">
              <button>👍 Gostei (120)</button>
              <button>💬 Comentar (25)</button>
              <button>➡️ Compartilhar</button>
            </div>
          </article>

          <article className="post">
            <div className="post-header">
              <div className="post-avatar">👩</div>
              <div className="post-info">
                <h4>Carlos Oliveira</h4>
                <p>Especialista em Acessibilidade</p>
                <p>1 dia atrás</p>
              </div>
            </div>
            <div className="post-content">
              Dica importante: Ao recrutar, verificar se a empresa tem
              intérprete de Libras é essencial para acessibilidade no dia a dia!
              💡
            </div>
            <div className="post-engagement">
              <button>👍 Gostei (230)</button>
              <button>💬 Comentar (45)</button>
              <button>➡️ Compartilhar</button>
            </div>
          </article>
        </main>

        <aside className="sidebar-right">
          <h3>🏢 Empresas Inclusivas</h3>
          <div className="companies-list">
            <div className="company-item">
              <h4>TechCorp Brasil</h4>
              <p>📍 Recrutando • 150+ funcionários</p>
            </div>
            <div className="company-item">
              <h4>SoftDev Solutions</h4>
              <p>📍 Enviando propostas • 80+ funcionários</p>
            </div>
            <div className="company-item">
              <h4>Design Acessível Co.</h4>
              <p>📍 Recrutando • 45+ funcionários</p>
            </div>
            <div className="company-item">
              <h4>Inovação Social Ltda</h4>
              <p>📍 Atualmente contratando • 200+ funcionários</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Feed;
