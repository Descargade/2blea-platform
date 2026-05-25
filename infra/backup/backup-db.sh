#!/usr/bin/env bash
set -euo pipefail

# 2bleA — PostgreSQL Daily Backup
# Install: sudo cp infra/backup/backup-db.sh /etc/cron.daily/2blea-backup
# Or add to crontab: 0 3 * * * /opt/2blea/infra/backup/backup-db.sh

BACKUP_DIR="/backups/2blea"
DB_CONTAINER="2blea-db"
DB_USER="${POSTGRES_USER:-2blea}"
DB_NAME="${POSTGRES_DB:-2blea}"
RETENTION_DAYS=30
S3_BUCKET="${S3_BACKUP_BUCKET:-}"

mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="2blea_${DATE}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Starting PostgreSQL backup..."

# Dump database
docker compose exec -T "$DB_CONTAINER" pg_dump \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    2>/dev/null | gzip > "$FILEPATH"

# Verify backup
if [ ! -s "$FILEPATH" ]; then
    echo "❌ Backup file is empty!"
    rm -f "$FILEPATH"
    exit 1
fi

BACKUP_SIZE=$(du -h "$FILEPATH" | cut -f1)
echo "✅ Backup created: $FILEPATH ($BACKUP_SIZE)"

# Rotate old backups
find "$BACKUP_DIR" -name "2blea_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
echo "🧹 Removed backups older than ${RETENTION_DAYS} days"

# Upload to S3-compatible storage (optional)
if [ -n "$S3_BUCKET" ]; then
    echo "☁️  Uploading to S3: s3://${S3_BUCKET}/database/"
    aws s3 cp "$FILEPATH" "s3://${S3_BUCKET}/database/$FILENAME" --only-show-errors
    echo "✅ S3 upload complete"
fi

echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Backup complete"
