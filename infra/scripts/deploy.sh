#!/usr/bin/env bash
set -euo pipefail

# 2bleA — Production Deploy Script
# Usage: bash infra/scripts/deploy.sh [--build] [--migrate] [--seed]

APP_DIR="/opt/2blea"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"
ENV_FILE="$APP_DIR/.env.production"

echo "================================================"
echo "  2bleA Deploy Script"
echo "================================================"

# Verify environment
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.production not found at $ENV_FILE"
    echo "   Create it from .env.production.example"
    exit 1
fi

cd "$APP_DIR"

# Pull latest code (if git repo)
if [ -d ".git" ]; then
    echo "📦 Pulling latest code..."
    git pull origin main
fi

# Rebuild if requested
if [[ "$*" == *"--build"* ]]; then
    echo "🔨 Building Docker images..."
    docker compose -f "$COMPOSE_FILE" build --pull
fi

# Run migrations
if [[ "$*" == *"--migrate"* ]]; then
    echo "🗄️  Running database migrations..."
    docker compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy
fi

# Seed if requested
if [[ "$*" == *"--seed"* ]]; then
    echo "🌱 Seeding database..."
    docker compose -f "$COMPOSE_FILE" run --rm app npx prisma db seed
fi

# Deploy
echo "🚀 Deploying..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Cleanup old images
echo "🧹 Cleaning up..."
docker image prune -f

# Verify health
echo "⏳ Waiting for healthcheck..."
sleep 10
for i in {1..12}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        echo "✅ Healthcheck passed (HTTP $STATUS)"
        break
    fi
    if [ "$i" = "12" ]; then
        echo "❌ Healthcheck failed after 60s"
        echo "   Run: docker compose logs app"
        exit 1
    fi
    sleep 5
done

echo "================================================"
echo "  ✅ 2bleA deployed successfully!"
echo "================================================"
echo ""
echo "  App:     https://2blea.com"
echo "  Health:  https://2blea.com/api/health"
echo "  Logs:    docker compose logs -f app"
echo ""
