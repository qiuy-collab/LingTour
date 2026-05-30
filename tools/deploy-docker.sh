#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/root/LingTour}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-/root/backups}"

cd "$APP_DIR"

echo "==> LingTour Docker deploy"
echo "App dir:      $APP_DIR"
echo "Target:       $REMOTE/$BRANCH"
echo "Compose file: $COMPOSE_FILE"

if [ ! -f .env ]; then
  echo "ERROR: $APP_DIR/.env is missing. Copy .env.production.example to .env and fill secrets first." >&2
  exit 1
fi

backup_dir="$BACKUP_ROOT/lingtour-docker-predeploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

git status --short > "$backup_dir/git-status.txt"
if ! git diff --quiet; then
  git diff > "$backup_dir/server-working-tree.diff"
fi
if ! git diff --cached --quiet; then
  git diff --cached > "$backup_dir/server-staged.diff"
fi

echo "==> Backed up server git state to $backup_dir"

echo "==> Fetching latest code"
git fetch "$REMOTE" "$BRANCH"

if [ -s "$backup_dir/git-status.txt" ]; then
  echo "==> Server has local working-tree changes. Resetting tracked files before fast-forward."
  git reset --hard HEAD
fi

git merge --ff-only "$REMOTE/$BRANCH"

echo "==> Building and starting Docker services"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d --build

echo "==> Container status"
docker compose -f "$COMPOSE_FILE" --env-file .env ps

echo "==> Health checks"
# nginx is intentionally bound to host port 8088 for safe migration behind the existing host proxy.
curl -fsS --max-time 20 http://127.0.0.1:8088/ >/dev/null
curl -fsS --max-time 20 -H 'Host: api.lingfengtranstour.cn' http://127.0.0.1:8088/health
printf '\n'
curl -fsS -o /dev/null -w 'site-via-docker-nginx:%{http_code}\n' --max-time 20 -H 'Host: lingfengtranstour.cn' http://127.0.0.1:8088/
curl -fsS -o /dev/null -w 'admin-via-docker-nginx:%{http_code}\n' --max-time 20 -H 'Host: admin.lingfengtranstour.cn' http://127.0.0.1:8088/
curl -fsS -o /dev/null -w 'api-via-docker-nginx:%{http_code}\n' --max-time 20 -H 'Host: api.lingfengtranstour.cn' http://127.0.0.1:8088/health

echo "==> Docker deploy complete"
