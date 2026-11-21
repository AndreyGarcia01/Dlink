# Requisitos

Origem: RFC do projeto (PAC VII). A coluna **Status** mostra o estado atual no código.

Legenda: ✅ implementado · 🟡 parcial · ⏳ pendente

## Requisitos Funcionais (RF)

### Autenticação

| ID | Requisito | Status | Onde está |
|---|---|---|---|
| RF01 | Criar conta escolhendo o perfil (candidato ou empresa) com nome/razão social, e-mail e senha | ✅ | `CriarConta.tsx`, `POST /api/auth/register` |
| RF02 | Login com e-mail e senha | ✅ | `Login.tsx`, `POST /api/auth/login` |
| RF03 | Validar o formato do e-mail e mostrar erro | ✅ | `Login.tsx` |
| RF04 | Impedir cadastro de e-mail já usado | ✅ | `auth.ts` (register) |
| RF05 | Senha com no mínimo 6 caracteres | ✅ | `CriarConta.tsx` e `auth.ts` |

### Perfil do candidato

| ID | Requisito | Status | Onde está |
|---|---|---|---|
| RF06 | Cadastrar experiências, formação e habilidades | ✅ | `Perfil.tsx`, `PUT /api/profile/me` |
| RF07 | Informar a preferência de comunicação | ✅ | `CriarConta.tsx`, `Perfil.tsx` |
| RF08 | Vídeo de apresentação em Libras | 🟡 | Link para o vídeo (ver [[Decisões Técnicas|Decisoes-Tecnicas]], ADR-008) |
| RF09 | Exibir o perfil do candidato, com o vídeo | 🟡 | `Perfil.tsx` (o candidato vê o próprio vídeo) |
| RF10 | Editar o perfil a qualquer momento | ✅ | `Perfil.tsx` |

### Empresas e vagas

| ID | Requisito | Status | Onde está |
|---|---|---|---|
| RF11 | Publicar vagas com título, descrição, requisitos e localidade | ✅ | `PainelEmpresa.tsx`, `POST /api/jobs` |
| RF12 | Informar os recursos de acessibilidade da vaga | ⏳ | Tabela `job_accessibility` já existe no banco |
| RF13 | Visualizar, editar ou encerrar vagas | 🟡 | Visualizar e encerrar ✅ · editar ⏳ |
| RF14 | Filtros por localidade, área e tipo de acessibilidade | 🟡 | Busca, localidade, área e regime ✅ · acessibilidade ⏳ |
| RF15 | Detalhes completos da vaga | 🟡 | Card da vaga no `Dashboard.tsx` |
| RF16 | Estado vazio quando não houver vagas | ✅ | `Dashboard.tsx` |

### Candidaturas

| ID | Requisito | Status | Onde está |
|---|---|---|---|
| RF17 | Candidatar-se a vagas | ✅ | `POST /api/jobs/:id/apply` |
| RF18 | Notificar a empresa da nova candidatura | ⏳ | Tabela `notifications` já existe no banco |
| RF19 | Histórico de candidaturas do candidato | ✅ | Aba "Minhas Candidaturas", `GET /api/applications/me` |
| RF20 | Empresa vê os candidatos das suas vagas | ✅ | `GET /api/jobs/:id/candidates` |
| RF21 | Impedir candidatura duplicada | ✅ | Checagem na API + `@@unique` no banco |

### Acessibilidade e informação

| ID | Requisito | Status | Onde está |
|---|---|---|---|
| RF22 | Conteúdos sobre direitos trabalhistas | ⏳ | Tabela `content_articles` já existe no banco |
| RF23 | Transcrições dos conteúdos | ⏳ | Campo `transcript` em `content_articles` |
| RF24 | Compatibilidade com leitores de tela | 🟡 | Labels e `aria-*` nos formulários; VLibras |
| RF25 | Elementos com descrição acessível e tamanho adequado no mobile | 🟡 | `aria-label` nos botões de ícone |

## Requisitos Não Funcionais (RNF)

| ID | Requisito | Status |
|---|---|---|
| RNF01 / RNF02 | Páginas e listas carregam em menos de 5 s | 🟡 Atende nos testes manuais; medição automática virá com o monitoramento |
| RNF03 | Vídeos em Libras estáveis | ✅ Vídeo hospedado externamente (link) |
| RNF04 | Senhas criptografadas | ✅ bcrypt (salt 10) |
| RNF05 | Cada usuário vê apenas os próprios dados | ✅ Filtro por usuário do token em todas as rotas |
| RNF06 | Disponibilidade mínima de 90% | 🟡 EC2 com PM2 reiniciando a API; monitoramento ⏳ |
| RNF07 | Mensagens claras de erro e de conexão | ✅ |
| RNF08 | Criar conta e se candidatar em menos de 5 minutos | ✅ Após o cadastro o usuário já entra logado |
| RNF09 | Tudo em português | ✅ |
| RNF10 | Compatível com mobile e desktop | 🟡 |
| RNF11 | Contraste e tamanho mínimo dos elementos | 🟡 |
| RNF12 | Novas funcionalidades sem reconstruir o sistema | ✅ Rotas separadas por domínio |
| RNF13 | Banco suporta crescimento | ✅ PostgreSQL gerenciado (Neon) |

## Regras de Negócio (RN)

| ID | Regra | Status | Onde está |
|---|---|---|---|
| RN01 | Só usuários autenticados criam, veem ou editam seus dados | ✅ | `authMiddleware.ts` |
| RN02 | Só empresas publicam vagas | ✅ | `POST /api/jobs` |
| RN03 | Vaga exige título, descrição e requisitos | ✅ | `POST /api/jobs` |
| RN04 | Uma candidatura por vaga | ✅ | `POST /api/jobs/:id/apply` |
| RN05 | Limite de tamanho dos vídeos | ✅ | Vídeo é um link externo (ADR-008) |
| RN06 | Data e hora da candidatura registradas | ✅ | `createdAt` em `applications` |
| RN07 | Empresa vê só candidatos das próprias vagas | ✅ | `GET /api/jobs/:id/candidates` |
| RN08 | Vaga com candidaturas é desativada, não excluída | ✅ | `PATCH /api/jobs/:id/close` |
| RN09 | Visitante não vê dados privados | ✅ | `authMiddleware.ts` |
| RN10 | Só a empresa dona da vaga muda o status da candidatura | ✅ | `PUT /api/applications/:id/status` |

## Fora do escopo

Entrevista por vídeo dentro da plataforma, substituir intérpretes humanos, tradução automática em tempo real, integração com LinkedIn/Catho, funções de rede social, versão desktop instalada, funções financeiras, validação de certificados, chamadas de voz e seleção automática de candidatos por IA.
