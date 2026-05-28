#!/usr/bin/env bash
# ---------------------------------------------------------------
# LingTour database backup script
# Creates timestamped pg_dump backups and rotates old copies.
# ---------------------------------------------------------------
set -euo pipefail

# ── Configuration (override via environment variables) ─────────
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-lingtour}"
DB_USER="${DB_USER:-postgres}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_COUNT="${KEEP_COUNT:-7}"

# ── Ensure backup directory exists ─────────────────────────────
mkdir -p "$BACKUP_DIR"

# ── Generate timestamped filename ──────────────────────────────
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# ── Run pg_dump and compress ───────────────────────────────────
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup of '${DB_NAME}' on ${DB_HOST}:${DB_PORT} ..."
pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup saved to ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))"

# ── Rotate: keep only the latest $KEEP_COUNT backups ───────────
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}/${DB_NAME}_"*.sql.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$KEEP_COUNT" ]; then
  DELETE_COUNT=$((BACKUP_COUNT - KEEP_COUNT))
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rotating: removing ${DELETE_COUNT} old backup(s) ..."
  ls -1t "${BACKUP_DIR}/${DB_NAME}_"*.sql.gz \
    | tail -n "$DELETE_COUNT" \
    | xargs rm -f
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete. (${BACKUP_COUNT} file(s) in ${BACKUP_DIR})"
