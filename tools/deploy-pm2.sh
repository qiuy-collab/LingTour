#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/root/LingTour}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
BACKUP_ROOT="${BACKUP_ROOT:-/root/backups}"

cd "$APP_DIR"

echo "==> LingTour PM2 deploy"
echo "App dir: $APP_DIR"
echo "Target:  $REMOTE/$BRANCH"

backup_dir="$BACKUP_ROOT/lingtour-predeploy-$(date +%Y%m%d-%H%M%S)"
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
  echo "==> Server has local working-tree changes. Resetting to HEAD before fast-forward."
  git reset --hard HEAD
  # Remove only untracked source files that would block checkout; keep ignored env/build/runtime files.
  git clean -fd \
    site/src/app/culture/CulturePageClient.tsx \
    site/src/app/interpreting/InterpretingPageClient.tsx \
    site/src/app/routes/RoutesPageClient.tsx \
    site/src/app/shop/ShopPageClient.tsx \
    site/src/lib/content-cleaners.ts \
    site/src/lib/region-currency.ts \
    site/src/components/ui/Price.tsx \
    2>/dev/null || true
fi

git merge --ff-only "$REMOTE/$BRANCH"

echo "==> Building API"
cd "$APP_DIR/api"
# Avoid stale incremental build cache producing declarations without JS output.
rm -f tsconfig.build.tsbuildinfo
npm run build

test -f dist/main.js || {
  echo "ERROR: api/dist/main.js was not generated" >&2
  exit 1
}

echo "==> Building site"
cd "$APP_DIR/site"
npm run build

echo "==> Restarting PM2 services"
cd "$APP_DIR"
pm2 restart lingtour-api lingtour-site lingtour-admin --update-env
pm2 save

echo "==> Health checks"
sleep 3
pm2 list
curl -fsS --max-time 20 http://127.0.0.1:8000/health
printf '\n'
curl -fsS -o /dev/null -w 'site:%{http_code}\n' --max-time 20 https://lingfengtranstour.cn
curl -fsS -o /dev/null -w 'admin:%{http_code}\n' --max-time 20 https://admin.lingfengtranstour.cn
curl -fsS -o /dev/null -w 'api-health:%{http_code}\n' --max-time 20 https://api.lingfengtranstour.cn/health

echo "==> Deploy complete"
