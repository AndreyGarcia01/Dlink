#!/usr/bin/env bash
# Roda DENTRO da EC2 (o workflow deploy.yml manda este arquivo por SSH).
# Atualiza o código para o commit testado pelo CI, gera o site e reinicia a API.
#
# Uso: bash deploy.sh <sha-do-commit>
set -euo pipefail

SHA="${1:?informe o commit}"
PASTA="/home/ubuntu/Dlink"
NOME_PM2="dlink-api"

cd "$PASTA"

if [ ! -f .env ]; then
  echo "ERRO: $PASTA/.env não existe. A API precisa do DATABASE_URL e do JWT_SECRET."
  exit 1
fi

echo "==> Baixando o código do GitHub"
git fetch --prune origin
# reset --hard deixa a pasta exatamente igual ao commit testado.
# Arquivos ignorados pelo Git (.env, node_modules, dist) não são apagados.
git reset --hard "$SHA"
echo "Versão: $(git log --oneline -1)"

echo "==> Instalando dependências"
npm ci --no-audit --no-fund

echo "==> Prisma"
npx prisma generate
# Aplica no banco só as migrations novas que ainda não foram aplicadas.
npx prisma migrate deploy

echo "==> Gerando o site (dist)"
npm run build

echo "==> Reiniciando a API"
pm2 delete "$NOME_PM2" > /dev/null 2>&1 || true
pm2 start npm --name "$NOME_PM2" -- run start:server
# Guarda a lista do PM2 para a API voltar sozinha quando a EC2 reiniciar
pm2 save

echo "==> Conferindo se a API respondeu"
for _ in $(seq 1 15); do
  if curl -fsS http://localhost:3333/api/health > /dev/null; then
    echo "API no ar."
    exit 0
  fi
  sleep 2
done

echo "ERRO: a API não respondeu em /api/health. Últimas linhas do log:"
pm2 logs "$NOME_PM2" --lines 30 --nostream || true
exit 1
