D-Link
![CI](https://github.com/AndreyGarcia01/Dlink/actions/workflows/ci.yml/badge.svg)
![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=AndreyGarcia01_Dlink&metric=alert_status)
Plataforma web que aproxima candidatos surdos de empresas com vagas inclusivas. O candidato encontra vagas com os recursos de acessibilidade descritos (intérprete de Libras, comunicação por texto etc.), se candidata e acompanha o processo; a empresa publica vagas e gerencia os candidatos.
Site no ar: https://deaflink.duckdns.org
Documentação completa: Wiki do projeto
Funcionalidades
Área pública (sem login) com as vagas abertas e conteúdos sobre direitos trabalhistas da pessoa surda.
Cadastro e login de candidatos e empresas, com validação do domínio do e-mail.
Candidato: busca e filtros de vagas, candidatura (informando se precisa de intérprete), "Minhas Candidaturas", perfil e notificações.
Empresa: publicar, editar e encerrar vagas, marcar os recursos de acessibilidade, ver os candidatos e mudar o status de cada candidatura.
Notificações: a empresa é avisada de cada candidatura e o candidato de cada mudança de status.
VLibras em todas as telas.
Tecnologias
Camada	Tecnologias
Frontend	React 18, TypeScript, Vite, Axios, VLibras, CSS próprio
Backend	Node.js, Express 5, TypeScript (tsx), JWT, bcryptjs, express-rate-limit, prom-client
Banco de dados	PostgreSQL (Neon), Prisma ORM
Testes e qualidade	Vitest, Supertest, Testing Library, ESLint, SonarCloud, CodeQL, GitGuardian
Infraestrutura	AWS EC2 (Ubuntu), Nginx, Let's Encrypt, PM2, DuckDNS
CI/CD	GitHub Actions + AWS Systems Manager (SSM)
Observabilidade	Grafana Cloud, Grafana Alloy, Synthetic Monitoring
Arquitetura
O D-Link é uma aplicação cliente-servidor: uma SPA em React conversa com uma API REST em Express, que guarda os dados num PostgreSQL. Site e API ficam na mesma EC2, atrás do Nginx.
```text
Navegador (React)
   │  HTTPS, JSON, token JWT no cabeçalho
   ▼
Nginx (EC2) ── serve o site (pasta dist/)
   │  /api
   ▼
API Express (porta 3333, PM2)
   rate limit → autenticação JWT → rota → Prisma
   │
   ▼
PostgreSQL (Neon)
```
A API é organizada em camadas simples: cada arquivo de `Server/routes/` concentra as rotas de um assunto (validação, permissão e regra de negócio), `Server/middlewares/` faz a autenticação e `Server/lib/` guarda o que é compartilhado (Prisma, métricas, limites, regras de vagas, validação de e-mail). Diagramas C4 e decisões técnicas estão na Wiki.
Estrutura de pastas
```text
Dlink
├── src/                    Frontend (React)
│   ├── App.tsx             Decide qual tela mostrar e guarda o usuário logado
│   ├── componentes/        Telas e componentes (Login, Dashboard, PainelEmpresa...)
│   ├── services/api.ts     Axios: chamadas à API, token JWT e sessão expirada
│   ├── constantes/         Recursos de acessibilidade
│   ├── utils/              Validação de links (linkSeguro)
│   ├── types/              Tipos TypeScript
│   └── __tests__/          Testes dos componentes
├── Server/                 Backend (API)
│   ├── index.ts            Sobe a API na porta 3333
│   ├── app.ts              Middlewares e rotas do Express
│   ├── routes/             auth, profile, jobs, applications, notifications, public
│   ├── middlewares/        Autenticação JWT
│   ├── lib/                Prisma, métricas, rate limit, vagas, e-mail
│   └── __tests__/          Testes da API
├── prisma/                 schema.prisma e migrations
├── deploy/deploy.sh        Script de deploy executado na EC2
├── monitoramento/          Configuração do Alloy e painel do Grafana
└── .github/workflows/      CI (ci.yml), deploy (deploy.yml) e CodeQL
```
Rotas da API
Método	Rota	Quem usa
POST	`/api/auth/register` · `/api/auth/login`	Público
GET	`/api/public/jobs` · `/api/public/contents`	Público
GET, PUT	`/api/profile/me`	Logado
GET	`/api/jobs`	Logado
POST	`/api/jobs/:id/apply`	Candidato
GET	`/api/applications/me`	Candidato
POST, PUT	`/api/jobs` · `/api/jobs/:id`	Empresa
GET	`/api/jobs/company/me` · `/api/jobs/:id/candidates`	Empresa
PATCH	`/api/jobs/:id/close`	Empresa
PUT	`/api/applications/:id/status`	Empresa
GET, PATCH	`/api/notifications` · `/read-all` · `/:id/read`	Logado
GET	`/api/health`	Monitoramento
Como rodar localmente
Pré-requisitos: Node.js 22, Git e um banco PostgreSQL (o projeto usa um branch de desenvolvimento no Neon, separado da produção).
```bash
git clone https://github.com/AndreyGarcia01/Dlink.git
cd Dlink
npm ci
```
Crie um arquivo `.env` na raiz (ele não vai para o Git):
```env
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
JWT_SECRET="uma-chave-longa-e-aleatoria"
PORT=3333
```
Gere o Prisma Client e crie as tabelas:
```bash
npx prisma generate
npx prisma migrate deploy
```
Rode a API e o site em dois terminais:
```bash
npm run dev:server   # API em http://localhost:3333
npm run dev          # site em http://localhost:5173
```
O Vite repassa as chamadas de `/api` para a porta 3333. Mais detalhes em Como Rodar Localmente.
Comandos
Comando	O que faz
`npm run dev`	Site em modo desenvolvimento
`npm run dev:server`	API em modo desenvolvimento (reinicia ao salvar)
`npm run lint`	ESLint
`npm run typecheck`	Checagem de tipos do frontend e do backend
`npm test`	Todos os testes
`npm run test:coverage`	Testes com relatório de cobertura (pasta `coverage/`)
`npm run build`	Gera o site de produção em `dist/`
`npm run db:generate` / `npm run db:migrate`	Gera o Prisma Client / aplica as migrations
Testes
São 194 testes automatizados com Vitest:
Backend: as rotas são testadas com Supertest e o Prisma mockado, sem depender de banco ou internet.
Frontend: os componentes são testados com Testing Library, como o usuário usa a tela.
Meta mínima de cobertura: 75% no backend e 25% no frontend. Abaixo disso o comando falha e o CI fica vermelho. O SonarCloud exige ainda 80% de cobertura no código novo.
CI/CD e deploy
A cada push e pull request o GitHub Actions roda lint, checagem de tipos, testes com cobertura, build e SonarCloud; o CodeQL faz a análise de segurança. Em push na `main`, com tudo aprovado, o deploy é feito automaticamente:
O Actions entra na AWS com um usuário IAM de privilégio mínimo.
Envia o `deploy/deploy.sh` para a EC2 pelo AWS Systems Manager (sem SSH e sem a porta 22 aberta).
Na EC2, o script baixa o commit testado, aplica as migrations, gera o build e reinicia a API no PM2.
O Actions confere se `/api/health` e o site respondem.
Detalhes e rollback em Deploy.
Segurança
Senhas guardadas só como hash (bcrypt); login com JWT válido por 1 dia.
Cada rota confere o perfil (candidato ou empresa) e o dono do dado.
Rate limit por IP, com limite mais baixo no login e cadastro.
Segredos (`DATABASE_URL`, `JWT_SECRET`) só no `.env` de cada máquina, nunca no Git.
Prisma (consultas parametrizadas) contra SQL injection; React e validação de links contra XSS.
Por tratar dados de pessoas com deficiência auditiva, o projeto considera os princípios da LGPD: a área pública não expõe e-mails, candidaturas nem dados de perfil.
Política completa e como relatar vulnerabilidades: SECURITY.md.
Monitoramento
A API expõe métricas (tempo de resposta, erros e eventos de negócio) que o Grafana Alloy envia para o Grafana Cloud, onde ficam o painel e os alertas. O Synthetic Monitoring testa o site de fora a cada poucos minutos. Ver Observabilidade.
Protótipo
O protótipo visual usado como referência para as telas foi feito no Bolt.new: https://d-link-deaf-employab-hk0z.bolt.host/
Projeto acadêmico
Projeto individual da disciplina de Portfólio do curso de Engenharia de Software do Centro Universitário Católica de Santa Catarina, a partir da RFC elaborada no PAC VII.
Autor: Andrey Garcia dos Santos
