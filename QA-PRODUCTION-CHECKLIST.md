# 2bleA — Production QA & Deploy Final Checklist

## 1. Pre-Deploy Validation

### Environment Variables
- [ ] All vars set in `.env.production` (use `.env.production.example` template)
- [ ] `NEXTAUTH_SECRET` is 32+ chars (`openssl rand -base64 32`)
- [ ] `DATABASE_URL` includes `?sslmode=require` for Neon/Supabase
- [ ] `NEXTAUTH_URL` uses HTTPS
- [ ] `PUSHER_*` vars match the Pusher dashboard
- [ ] `CLOUDINARY_*` vars match the Cloudinary dashboard
- [ ] `STORAGE_PROVIDER=cloudinary` set in production
- [ ] Pusher app enabled private channels in dashboard settings
- [ ] Pusher app ID/key/secret/cluster all match
- [ ] Cloudinary cloud name is correct

### Pusher Configuration
- [ ] App Dashboard → App Settings → Enable `Private channels`
- [ ] Create a `.env` entry for each Pusher var
- [ ] Verify auth endpoint returns 200 on socket auth
- [ ] Verify private channel subscription works
- [ ] Verify typing events broadcast correctly
- [ ] Verify notification events reach clients
- [ ] Verify reconnection after network drop
- [ ] Rate limiting active on auth endpoint (20 req/min)

### Cloudinary Configuration
- [ ] Image upload returns secure URL
- [ ] PDF upload works (resource_type: raw)
- [ ] File delete removes from Cloudinary
- [ ] `2blea/images`, `2blea/documents`, `2blea/archives` folders auto-created
- [ ] Auto-optimization (quality: auto, fetch_format: auto) active
- [ ] All URLs use HTTPS

### PostgreSQL / Prisma
- [ ] Connection pooler URL (Neon: `-pooler` suffix, Supabase: transaction mode)
- [ ] `prisma migrate deploy` runs without errors
- [ ] `prisma db seed` populates initial admin + services
- [ ] Soft-delete queries respect `deletedAt: null`
- [ ] Indexes created for all query patterns
- [ ] SSL enforced via `?sslmode=require`

### Docker
- [ ] `docker compose build` succeeds
- [ ] `docker compose up -d` starts cleanly
- [ ] Healthcheck `GET /api/health` returns `{"status":"ok"}`
- [ ] Volumes persist across restarts (pgdata, uploads)
- [ ] Non-root `nextjs` user in container
- [ ] `.dockerignore` excludes `.env`, `node_modules`, `.next`, `uploads/`

---

## 2. Production QA — Route-by-Route

### Auth
- [ ] `/login` renders correctly
- [ ] Login with ADMIN user → redirects to `/admin/dashboard`
- [ ] Login with CLIENTE user → redirects to `/cliente/dashboard`
- [ ] Invalid credentials → error message
- [ ] Logout → redirects to `/login`
- [ ] Session persists across page reloads
- [ ] Direct access to `/admin/*` without auth → redirects to `/login`
- [ ] Direct access to `/cliente/*` without auth → redirects to `/login`
- [ ] ADMIN accessing `/cliente/*` → redirects to `/login`
- [ ] CLIENTE accessing `/admin/*` → redirects to `/login`

### Landing Page (`/`)
- [ ] Hero section loads with animations
- [ ] GSAP SplitType animation runs on hero text
- [ ] Services section displays correctly
- [ ] Offers section loads with discounts
- [ ] Budget calculator multi-step works
- [ ] Calculator sends WhatsApp message with correct values
- [ ] CTA section renders
- [ ] Contact form works
- [ ] Footer with all links
- [ ] Responsive on mobile (<768px)
- [ ] Lenis smooth scroll active
- [ ] SEO metadata present (title, description, OG)

### Admin Dashboard (`/admin/dashboard`)
- [ ] Stats cards load (projects, clients, activity)
- [ ] Recent activity list renders
- [ ] Real-time updates appear without refresh
- [ ] Notification bell shows unread count
- [ ] Notification dropdown opens/closes
- [ ] Realtime toasts appear for events

### Admin Clients (`/admin/clientes`)
- [ ] Client list loads
- [ ] Create client modal opens
- [ ] Create client form submits
- [ ] Client appears in list after creation
- [ ] Soft delete works
- [ ] Real-time notification on new client

### Admin Projects (`/admin/proyectos`)
- [ ] Project list loads
- [ ] Create project modal opens
- [ ] Create project form submits
- [ ] Click project → detail page (`/admin/proyectos/[id]`)
- [ ] Detail page tabs: Info, Files, Activity, Messages
- [ ] Status change works
- [ ] Progress update works
- [ ] File upload: drag & drop works
- [ ] File upload: click to upload works
- [ ] File preview: images render
- [ ] File preview: PDF/mp4/zip show icon
- [ ] File delete works
- [ ] Activity timeline updates in real-time
- [ ] Messages tab loads conversations
- [ ] Message send works with real-time push
- [ ] Typing indicator appears/disappears
- [ ] Responsive on tablet/mobile

### Admin Services (`/admin/servicios`)
- [ ] Services list loads
- [ ] Edit service modal opens
- [ ] Service update persists
- [ ] Order changes work

### Admin Offers (`/admin/ofertas`)
- [ ] Offers list loads
- [ ] Create offer modal opens
- [ ] Offer creation persists
- [ ] Delete works

### Admin Messages (`/admin/mensajes`)
- [ ] Conversation list loads
- [ ] Click conversation → messages load
- [ ] Send message appears instantly (optimistic)
- [ ] Real-time message push works
- [ ] Typing indicator works
- [ ] Read receipts work
- [ ] Unread badges update

### Client Dashboard (`/cliente/dashboard`)
- [ ] Client projects load
- [ ] Stats show correctly
- [ ] Recent activity visible

### Client Projects (`/cliente/proyectos`)
- [ ] Project list loads
- [ ] Click project → detail view
- [ ] Files tab loads file list
- [ ] File preview works (read-only)
- [ ] Activity visible
- [ ] Messages tab works
- [ ] Client can send messages to admin
- [ ] Real-time message delivery

### Profile (`/perfil`)
- [ ] Profile loads with user data
- [ ] Edit name/email works
- [ ] Change password works
- [ ] Avatar upload works
- [ ] Validation errors show

---

## 3. Security Hardening

### HTTP Headers
- [ ] `Content-Security-Policy` present (proxied by middleware)
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Strict-Transport-Security` (1 year, includeSubDomains)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` restricts camera/mic/geo

### Rate Limiting
- [ ] Pusher auth: 20 req/min per IP
- [ ] File upload: 50 req/min per IP
- [ ] Login: handled by NextAuth (recommend Cloudflare WAF for extra)

### Upload Safety
- [ ] MIME type validation (only JPG, PNG, WEBP, PDF, MP4, ZIP)
- [ ] File size limit: 100MB
- [ ] Max 200 files per project (DB check)
- [ ] `requireAdmin` guard on upload endpoint
- [ ] Filename sanitized (existing)

### Database
- [ ] All queries use `deletedAt: null` for soft-delete tables
- [ ] Auth required on all protected routes (`requireAuth`/`requireAdmin`)
- [ ] Prisma prepared statements (parameterized)
- [ ] Connection pooling active (Neon pooler or PgBouncer)

### Auth
- [ ] JWT tokens (not database sessions)
- [ ] Session expires after configured time
- [ ] CSRF protection (NextAuth built-in)
- [ ] Secure cookies (`__Secure-` prefix in production)
- [ ] Password hashing with bcryptjs

---

## 4. Performance Checks

- [ ] Build completes without errors
- [ ] TypeScript check passes (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] First load < 3 seconds (target)
- [ ] No render-blocking resources in critical path
- [ ] Images lazy-loaded
- [ ] Dynamic imports for heavy components (notification-dropdown, realtime-toast, realtime-status)
- [ ] GSAP only loads on landing page
- [ ] Pusher JS only loads for authenticated users
- [ ] Prisma query logging disabled in production

---

## 5. Docker & Infrastructure

- [ ] `Dockerfile` builds under 5 min
- [ ] Final image < 500MB
- [ ] `docker compose up -d` starts app + db
- [ ] Healthcheck returns 200 within 40s
- [ ] Volumes persist data across container restart
- [ ] `docker compose down` doesn't delete volumes
- [ ] Log rotation configured (Docker default)
- [ ] Nginx reverse proxy with SSL (if VPS)

---

## 6. Final Deploy Steps

```bash
# 1. Build & test locally
npm run build && npx tsc --noEmit && npm run lint

# 2. Set production env
cp .env.production.example .env.production
# ... fill all values ...

# 3. Docker deploy (VPS)
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed

# 4. Verify health
curl https://2blea.com/api/health

# 5. Verify one user journey:
#    - Go to / → landing loads
#    - Go to /login → login as admin
#    - Create a project → upload a file → send a message
#    - Logout → login as client → see the project + message

# 6. Setup monitoring
#    - Uptime Robot / Better Uptime → 5min checks on /api/health
#    - Database backup cron job

# 7. Go live!
```

---

## 7. Services & URLs

| Service | URL | Credentials |
|---|---|---|
| **Pusher** | https://dashboard.pusher.com | App Key: `NEXT_PUBLIC_PUSHER_KEY` |
| **Cloudinary** | https://cloudinary.com/console | Cloud name: `CLOUDINARY_CLOUD_NAME` |
| **Neon** (DB) | https://neon.tech | Connection string: `DATABASE_URL` |
| **Resend** | https://resend.com | API Key: `RESEND_API_KEY` |
| **Vercel** | https://vercel.com | Deploy from GitHub |
| **Cloudflare** | https://cloudflare.com | DNS + WAF + CDN |

## 8. Post-Deploy Monitoring (Day 1-3)

- [ ] Monitor 404/500 errors in logs
- [ ] Verify realtime events deliver in < 500ms
- [ ] Check database pool connections (Neon dashboard)
- [ ] Verify uploads appear in Cloudinary dashboard
- [ ] Test all user journeys on production URLs
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit → target 90+ performance
- [ ] Verify email delivery (if RESEND configured)
