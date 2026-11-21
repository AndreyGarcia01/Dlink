# Testes e Qualidade

## Testes automatizados

Ferramentas: **Vitest** (executor), **Supertest** (chama a API sem subir o servidor), **Testing Library** (testa os componentes React como o usuário usa) e **jsdom** (navegador simulado).

| Onde | O que testa |
|---|---|
| `Server/__tests__/` | Rotas da API: cadastro, login, perfil, vagas, candidaturas, regras de acesso (RN07, RN10) e o middleware de autenticação |
| `src/__tests__/` | Componentes: login, cadastro, perfil, busca e filtros, navegação do `App` e o `api.ts` (token e sessão expirada) |

### Como os testes do backend funcionam sem banco

O Prisma é substituído por um **mock** (`Server/__tests__/helpers.ts`): cada teste programa o que o "banco" devolve. Assim os testes rodam em segundos, sem internet e sem mexer em dados reais, e conseguem simular situações difíceis de reproduzir (erro de banco, vaga de outra empresa etc.).

### Rodando

```bash
npm test                 # todos os testes
npm run test:coverage    # testes + cobertura
```

O relatório HTML fica em `coverage/index.html`.

## Metas de cobertura

| Parte | Meta (disciplina) | Configurada em |
|---|---|---|
| Backend (`Server/`) | 75% | `vitest.config.ts` → `coverage.thresholds` |
| Frontend (`src/`) | 25% | `vitest.config.ts` → `coverage.thresholds` |

Se a cobertura cair abaixo da meta, o `npm run test:coverage` falha, e com ele o CI. Assim, o código não chega na `main`.

## Análise estática

| Ferramenta | O que verifica | Onde roda |
|---|---|---|
| **ESLint** | Padrões de código e erros comuns em TypeScript/React | `npm run lint` e CI |
| **TypeScript** | Tipos do frontend e do backend | `npm run typecheck` e CI |
| **CodeQL** | Vulnerabilidades de segurança (ex.: XSS, injeção) | `codeql.yml`; bloqueia o PR quando acha alerta |
| **SonarCloud** | Qualidade, code smells, duplicação e cobertura | `ci.yml` (job `sonarcloud`) |

### Exemplo real: o CodeQL barrando um PR

Num PR do perfil do candidato, o CodeQL apontou **"DOM text reinterpreted as HTML" (alta severidade)**: o link do vídeo em Libras usava direto o texto digitado no campo. Em vez de ignorar o alerta, a correção foi:

- o link passou a usar só o valor já salvo e validado pela API;
- antes de virar link, o endereço passa por `new URL()` e só `http`/`https` são aceitos (função `linkSeguro` em `Perfil.tsx`);
- dois testes garantem que texto digitado e endereços perigosos (`javascript:`) nunca viram link.

## Segurança aplicada

- Senhas com **bcrypt** e hash **nunca** devolvido pela API.
- **JWT** com validade de 1 dia; a API não sobe sem `JWT_SECRET`.
- Regras de acesso por perfil e por **dono do recurso** (empresa só mexe nas próprias vagas e candidaturas).
- **Prisma ORM** com consultas parametrizadas (proteção contra SQL injection).
- **HTTPS** obrigatório (Nginx redireciona a porta 80) e porta da API fechada na internet.
- Segredos só no `.env` (fora do Git) e nos *Secrets* do GitHub.
