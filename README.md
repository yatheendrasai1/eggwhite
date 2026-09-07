# eggwhite

English grammar & vocabulary improvement tests.

## Layout

- **`web/`** — the full-stack app (Next.js 16 + MongoDB Atlas + Auth.js), deployable to
  Vercel. This is the maintained version. See [`web/README.md`](web/README.md) for
  architecture, environment variables and deploy steps.
- **`index.html`, `english-level-test.html`, `inbox-test.html`** — the original
  no-backend static prototype. Kept for reference; superseded by `web/`.

## Quick start (the app)

```bash
cd web
npm install
cp .env.example .env.local   # then fill in MONGODB_URI, AUTH_SECRET, OAuth keys
npm run dev
```

## Deploy

Vercel → import this repo → **Root Directory = `web`** → add the env vars from
`web/.env.example` → deploy. Full walkthrough in [`web/README.md`](web/README.md).
