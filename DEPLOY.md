# 2bleA — Deployment Guide

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel     │     │   VPS/Docker  │     │   Railway   │
│  (Frontend)  │  or │  (Full-stack) │  or │  (Postgres) │
└──────────────┘     └──────────────┘     └─────────────┘
                            │                     │
                            └────────┬────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │    PostgreSQL (Neon/     │
                        │  Supabase/Railway/Volt)  │
                        └─────────────────────────┘
```

## Option A: Vercel (recommended for frontend)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel Dashboard
vercel env pull
```

**Important**: Vercel handles Pusher, but you need an external PostgreSQL host.

## Option B: Docker (full-stack VPS)

### Prerequisites
- Docker & Docker Compose v2
- A VPS with Ubuntu 22.04+
- Domain pointed to VPS IP
- Cloudflare or other DNS

### Setup

```bash
# 1. Clone
git clone https://github.com/your-org/2blea-platform /opt/2blea
cd /opt/2blea

# 2. Create production env
cp .env.production.example .env.production
nano .env.production   # fill in all values

# 3. Start
docker compose up -d

# 4. Run migrations
docker compose exec app npx prisma migrate deploy

# 5. Seed (optional)
docker compose exec app npx prisma db seed

# 6. Verify
curl http://localhost:3000/api/health
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name 2blea.com www.2blea.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 2blea.com www.2blea.com;

    ssl_certificate /etc/letsencrypt/live/2blea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/2blea.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (Pusher doesn't need proxied WS, but keep for future)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Upload limit
    client_max_body_size 100M;
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | App URL (e.g. https://2blea.com) |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char string |
| `NEXT_PUBLIC_PUSHER_KEY` | ✅ | Pusher channel app key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | ✅ | Pusher cluster (e.g. us2) |
| `PUSHER_APP_ID` | ✅ | Pusher app ID |
| `PUSHER_KEY` | ✅ | Pusher key |
| `PUSHER_SECRET` | ✅ | Pusher secret |
| `PUSHER_CLUSTER` | ✅ | Pusher cluster |
| `STORAGE_PROVIDER` | ✅ | `local` or `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | * | Required if STORAGE_PROVIDER=cloudinary |
| `CLOUDINARY_API_KEY` | * | Required if STORAGE_PROVIDER=cloudinary |
| `CLOUDINARY_API_SECRET` | * | Required if STORAGE_PROVIDER=cloudinary |
| `RESEND_API_KEY` | Optional | Transactional emails |
| `NEXT_PUBLIC_APP_URL` | Optional | Public app URL |

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random string (`openssl rand -base64 32`)
- [ ] Database connection uses SSL (`?ssl=true` or `?sslmode=require`)
- [ ] Pusher channels use private auth (implemented)
- [ ] CORS restricted to app origin (via middleware)
- [ ] CSP headers active (via middleware)
- [ ] HSTS enabled (1 year)
- [ ] All uploads validated by MIME type + size (implemented)
- [ ] Rate limiting on auth endpoints (recommend Cloudflare WAF)
- [ ] `.env.*` files in `.gitignore`
- [ ] No secrets in image layers (Docker multi-stage)
- [ ] Non-root user in container (`nextjs` user)

## Backup Checklist

- [ ] PostgreSQL: daily `pg_dump` to S3/Backblaze
- [ ] Uploaded files: volume backup or Cloudinary (provider-managed)
- [ ] Environment variables: stored in password manager

### Postgres Backup Script

```bash
#!/bin/bash
# /etc/cron.daily/2blea-backup
BACKUP_DIR=/backups/2blea
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U 2blea 2blea | gzip > $BACKUP_DIR/2blea_$DATE.sql.gz
# Upload to S3
aws s3 cp $BACKUP_DIR/2blea_$DATE.sql.gz s3://2blea-backups/
# Keep last 7 days local
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

## Monitoring

- Health endpoint: `GET /api/health`
- Recommended: Uptime Robot / Better Uptime (5 min checks)
- Container healthchecks built into Dockerfile

## Rollback

```bash
# Docker: revert to previous image
docker compose down
git checkout <previous-tag>
docker compose up -d --build

# DB: restore backup
gunzip < backup.sql.gz | docker compose exec -T db psql -U 2blea 2blea
```

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Run migration
docker compose exec app npx prisma migrate deploy

# Reset DB (dev only)
docker compose exec app npx prisma migrate reset

# Enter container
docker compose exec app sh

# Full rebuild
docker compose up -d --build --force-recreate
```

## Cloud Services Links

| Service | Purpose | Sign-up |
|---|---|---|
| [Neon](https://neon.tech) | Serverless PostgreSQL | Free tier |
| [Supabase](https://supabase.com) | PostgreSQL + Auth | Free tier |
| [Railway](https://railway.app) | PostgreSQL + Hosting | Free trial |
| [Pusher](https://pusher.com) | WebSockets / Realtime | Free tier (200K msgs/day) |
| [Cloudinary](https://cloudinary.com) | Image/File hosting | Free tier (25GB storage) |
| [Resend](https://resend.com) | Transactional emails | Free tier (100/day) |
| [Vercel](https://vercel.com) | Frontend hosting | Free tier |
| [Cloudflare](https://cloudflare.com) | DNS + WAF + CDN | Free tier |
