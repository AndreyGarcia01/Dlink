

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


install -m 600 .env "$HOME/.dlink-env-backup"


git reset --hard "$SHA"

if [ ! -f .env ]; then
  echo "O .env sumiu no reset; restaurando a cópia de segurança."
  install -m 600 "$HOME/.dlink-env-backup" .env
fi
echo "Versão: $(git log --oneline -1)"

echo "==> Instalando dependências"

HASH_LOCK=$(sha256sum package-lock.json | cut -d' ' -f1)
HASH_ANTERIOR=$(cat "$HOME/.dlink-lock-hash" 2> /dev/null || true)
if [ -d node_modules ] && [ "$HASH_LOCK" = "$HASH_ANTERIOR" ]; then
  echo "Dependências iguais ao último deploy; pulando o npm ci."
else
  npm ci --no-audit --no-fund
  
  echo "$HASH_LOCK" > "$HOME/.dlink-lock-hash"
fi

echo "==> Prisma"
npx prisma generate

npx prisma migrate deploy

echo "==> Gerando o site (dist)"
npm run build

echo "==> Reiniciando a API"
pm2 delete "$NOME_PM2" > /dev/null 2>&1 || true
pm2 start npm --name "$NOME_PM2" -- run start:server

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
