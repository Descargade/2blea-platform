#!/usr/bin/env bash
set -euo pipefail

# 2bleA — Disaster Recovery Script
# Usage: bash infra/scripts/recovery.sh <backup-file>

if [ $# -ne 1 ]; then
    echo "Usage: bash infra/scripts/recovery.sh <path-to-backup.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /backups/2blea/ 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"
DB_CONTAINER="2blea-db"
DB_USER="${POSTGRES_USER:-2blea}"
DB_NAME="${POSTGRES_DB:-2blea}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "================================================"
echo "  2bleA Disaster Recovery"
echo "================================================"
echo ""
echo "⚠️  WARNING: This will DESTROY the current database"
echo "   and replace it with the backup."
echo ""
read -p "Type 'RECOVER' to confirm: " CONFIRM

if [ "$CONFIRM" != "RECOVER" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🛑 Stopping app container..."
docker compose stop app

echo "🗄️  Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker compose exec -T "$DB_CONTAINER" psql \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully"
else
    echo "❌ Database restore failed"
    echo "   Check the error above"
    exit 1
fi

echo "🚀 Restarting app..."
docker compose start app

echo ""
echo "⏳ Waiting for healthcheck..."
sleep 10
for i in {1..12}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        echo "✅ App is healthy"
        break
    fi
    if [ "$i" = "12" ]; then
        echo "❌ Healthcheck failed"
        echo "   Run: docker compose logs app"
    fi
    sleep 5
done

echo "================================================"
echo "  ✅ Recovery complete!"
echo "================================================"
