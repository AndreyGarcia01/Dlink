# Política de Segurança

## Como reportar uma vulnerabilidade

Se você encontrou uma falha de segurança no D-Link, não abra uma issue pública.
Use o botão "Report a vulnerability" na aba Security deste repositório
(relato privado do GitHub). Descreva o que encontrou, como reproduzir e o impacto.

O relato é respondido em até 7 dias. A correção é feita em um pull request e
publicada pelo pipeline de CI/CD depois de passar nos testes e na análise de segurança.

## Versões suportadas

Apenas a versão em produção (branch main, publicada em https://deaflink.duckdns.org)
recebe correções.

## Medidas de segurança do projeto

- Senhas com bcrypt; o hash nunca é devolvido pela API.
- Autenticação JWT com validade de 1 dia e controle de acesso por perfil e por dono do recurso.
- Limite de requisições por IP (300 a cada 15 min na API; 20 em login e cadastro).
- HTTPS obrigatório; porta da API fechada para a internet (só o Nginx acessa).
- Segredos fora do Git (.env na EC2 e Secrets do GitHub Actions).
- Análise automática a cada pull request: CodeQL, SonarCloud e GitGuardian.

## Riscos conhecidos e aceitos

- npm audit aponta 4 alertas em deepmerge-ts e effect, dependências do Prisma CLI
  (@prisma/config). São usadas só nos comandos de build/migração, não no caminho das
  requisições dos usuários. A correção exige o Prisma 7 (mudança grande), planejada para
  depois da entrega.
