# Como Rodar Localmente

## Pré-requisitos

- **Node.js 22** (a mesma versão do CI)
- **Git**
- Um banco **PostgreSQL**. O projeto usa a Neon; para desenvolvimento, use uma branch de banco separada da produção (ver [[Deploy]]).

## Passo a passo

```bash
# 1. Baixar o código
git clone https://github.com/AndreyGarcia01/Dlink.git
cd Dlink

# 2. Instalar as dependências exatamente como estão no package-lock.json
npm ci

# 3. Criar o arquivo .env na raiz (ele NÃO vai para o Git)
#    DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
#    JWT_SECRET="uma-chave-longa-e-aleatoria"
#    PORT=3333

# 4. Gerar o Prisma Client e criar as tabelas no banco
npx prisma generate
npx prisma migrate deploy
```

Para gerar um `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Rodando

São dois processos, em dois terminais:

```bash
# Terminal 1 — API (http://localhost:3333), reinicia sozinha ao salvar
npm run dev:server

# Terminal 2 — site (http://localhost:5173)
npm run dev
```

O site chama a API por `/api`; o Vite repassa essas chamadas para `localhost:3333` (configuração `server.proxy` no `vite.config.ts`). Se aparecer `ECONNREFUSED` no terminal do site, a API (terminal 1) não está rodando.

## Variáveis de ambiente

| Variável | Para que serve | Onde é lida |
|---|---|---|
| `DATABASE_URL` | Conexão com o PostgreSQL | `prisma/schema.prisma` |
| `JWT_SECRET` | Chave que assina os tokens de login. Sem ela a API não sobe | `Server/routes/auth.ts`, `Server/middlewares/authMiddleware.ts` |
| `PORT` | Porta da API (padrão 3333) | `Server/index.ts` |

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos do frontend e do backend |
| `npm test` | Roda os testes |
| `npm run test:coverage` | Testes + relatório de cobertura (em `coverage/index.html`) |
| `npm run build` | Gera o site de produção em `dist/` |
| `npx prisma studio` | Abre uma tela para ver e editar os dados do banco |

## Problemas comuns

- **`@prisma/client did not initialize yet`** → rode `npx prisma generate`.
- **"Token inválido ou expirado"** → o login venceu (1 dia) ou o `JWT_SECRET` mudou; o sistema volta sozinho para a tela de login.
- **O `package-lock.json` mudou sem você instalar nada** → use `npm ci` em vez de `npm install` e desfaça com `git restore package-lock.json`.
