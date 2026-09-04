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

echo "==> Building Docker images"
docker compose -f "$COMPOSE_FILE" --env-file .env build

printf '%s\n' "==> Running database migrations against the configured host database"
docker compose -f "$COMPOSE_FILE" --env-file .env run --rm --no-deps api \
  npx typeorm migration:run -d dist/database/data-source.js

printf '%s\n' "==> Starting Docker services"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d --remove-orphans

echo "==> Waiting for container health"
for attempt in $(seq 1 30); do
  unhealthy=$(docker compose -f "$COMPOSE_FILE" --env-file .env ps --format json | \
    grep -E '"Health":"(starting|unhealthy)"' || true)
  if [ -z "$unhealthy" ]; then
    break
  fi
  sleep 2
done

docker compose -f "$COMPOSE_FILE" --env-file .env ps

if docker compose -f "$COMPOSE_FILE" --env-file .env ps --format json | \
  grep -E '"Health":"unhealthy"' >/dev/null; then
  echo "ERROR: Docker service health check failed" >&2
  exit 1
fi

printf '%s\n' "==> Health checks"
# nginx is intentionally bound to loopback port 8088 behind the existing host TLS proxy.
curl -fsS --max-time 20 http://127.0.0.1:8088/ >/dev/null
curl -fsS --max-time 20 -H 'Host: api.lingfengtranstour.cn' http://127.0.0.1:8088/health
printf '\n'
curl -fsS -o /dev/null -w 'site-via-docker-nginx:%{http_code}\n' --max-time 20 -H 'Host: lingfengtranstour.cn' http://127.0.0.1:8088/
curl -fsS -o /dev/null -w 'admin-via-docker-nginx:%{http_code}\n' --max-time 20 -H 'Host: admin.lingfengtranstour.cn' http://127.0.0.1:8088/
curl -fsS -o /dev/null -w 'api-via-docker-nginx:%{http_code}\n' --max-time 20 -H 'Host: api.lingfengtranstour.cn' http://127.0.0.1:8088/health

echo "==> Docker deploy complete"
echo "==> PM2 remains untouched; switch host Nginx only after these checks pass."
