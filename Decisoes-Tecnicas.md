# Decisões Técnicas (ADRs)

Registro das principais decisões de arquitetura: o contexto, a escolha e as consequências. Inclui as mudanças em relação ao que o RFC previa.

---

## ADR-001 — PostgreSQL gerenciado na Neon

- **Contexto:** o RFC definiu PostgreSQL. Manter um banco instalado na própria EC2 exigiria cuidar de backup, atualização e segurança.
- **Decisão:** usar PostgreSQL serverless da **Neon**, na região `sa-east-1` (São Paulo).
- **Consequências:** backups e disponibilidade ficam com o provedor; a Neon permite criar **branches de banco**, usadas para separar desenvolvimento e produção. Em troca, a aplicação depende de um serviço externo.

## ADR-002 — Prisma ORM

- **Decisão:** acessar o banco pelo **Prisma**.
- **Motivo:** tipos gerados a partir do `schema.prisma` (erros aparecem no editor), migrations versionadas no Git e consultas parametrizadas (protege contra SQL injection).
- **Consequência:** toda mudança no banco passa pelo `schema.prisma` + uma migration. Uma coluna criada sem migration (`requires_interpreter`) foi corrigida depois com a migration `20261121180000_add_requires_interpreter`.

## ADR-003 — Autenticação JWT stateless

- **Decisão:** login gera um **JWT** com `id` e `role`, válido por **1 dia**; o `authMiddleware` valida o token em cada requisição.
- **Motivo:** a API não precisa guardar sessão; o `role` no token permite o controle de acesso por perfil (RN01).
- **Consequências:** não dá para "derrubar" um token antes de vencer (por isso a validade curta). Quando o token vence, o `api.ts` trata o 401 num lugar só e devolve o usuário para o login.

## ADR-004 — Uma tabela de usuários para candidatos e empresas

- **Decisão:** tabela `users` única com o campo `role` (`candidate` / `company`).
- **Motivo:** login, cadastro e autenticação são iguais para os dois perfis.
- **Consequência:** campos específicos de cada perfil são opcionais na tabela.

## ADR-005 — AWS EC2 + Nginx + PM2 (sem Docker)

- **Contexto:** a disciplina pede deploy em nuvem com controle da infraestrutura e veta plataformas que escondem o backend (Vercel, Netlify, Render).
- **Decisão:** **EC2 Ubuntu** com **Nginx** (HTTPS e proxy reverso) e **PM2** (mantém a API rodando).
- **Motivo:** controle total do servidor, HTTPS com Let's Encrypt, e o site e a API no mesmo domínio (sem problemas de CORS).
- **Consequências:** a configuração do servidor é manual e foi documentada em [[Deploy]]. Por ser uma máquina pequena, foi preciso configurar swap e evitar reinstalar dependências sem necessidade. Docker fica como melhoria futura.

## ADR-006 — CI/CD no GitHub Actions

- **Decisão:** três workflows: `ci.yml` (qualidade), `codeql.yml` (segurança) e `deploy.yml` (entrega).
- **Motivo:** nada chega na produção sem passar por lint, tipos, testes com meta de cobertura e análise de segurança. O deploy usa exatamente o commit que o CI aprovou.
- **Consequência:** as actions são fixadas por SHA (proteção da cadeia de suprimentos) e precisam ser atualizadas de vez em quando.

## ADR-007 — Navegação por estado no `App.tsx` (desvio do RFC)

- **Contexto:** o RFC previa **React Router** e **Context API**.
- **Decisão:** a navegação é feita por um estado (`view`) no `App.tsx`, e o usuário logado fica no `App` e no `localStorage`.
- **Motivo:** o sistema tem poucas telas e dois perfis; um estado simples resolveu sem dependências extras.
- **Consequências:** as telas não têm URL própria (não dá para abrir direto `/perfil`). Se o número de telas crescer, migrar para React Router.

## ADR-008 — Vídeo em Libras como link (desvio do RF08)

- **Contexto:** o RF08 prevê "envio de vídeo". Guardar vídeos exigiria armazenamento de arquivos (ex.: S3), limite de tamanho e processamento.
- **Decisão:** o candidato informa o **link** do vídeo (YouTube, Google Drive etc.), validado como `http(s)` na API e no frontend.
- **Consequências:** o vídeo fica hospedado em plataformas já otimizadas para streaming (atende o RNF03 e a RN05) e a EC2 não precisa guardar arquivos grandes. Em troca, o candidato precisa publicar o vídeo em outro lugar.

## ADR-009 — Testes do backend com Prisma mockado

- **Decisão:** nos testes, o Prisma é trocado por um mock (`Server/__tests__/helpers.ts`), e a API é chamada pelo Supertest.
- **Motivo:** testes rápidos, sem banco nem internet, rodando no CI, e capazes de simular erros e acessos indevidos.
- **Consequência:** não testam o SQL de verdade; isso fica coberto pelo Prisma e pelos testes manuais no ambiente de desenvolvimento.
