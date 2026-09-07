# eggwhite — web

Full-stack rewrite of the eggwhite English tests.

- **Next.js 16** (App Router, TypeScript) — one deployable unit for UI **and** API.
- **MongoDB Atlas** via **Mongoose** (`Attempt` model) + the native driver for the auth adapter.
- **Auth.js v5** — Google & GitHub OAuth, sessions stored in MongoDB.
- **Tailwind v4** available; the egg-white theme lives as CSS tokens in `src/app/globals.css`.

## Architecture

```
src/
  auth.ts                     Auth.js config (providers, MongoDB adapter, session.user.id)
  app/
    layout.tsx                fonts + <Navbar/>
    page.tsx                  landing hub (server): sign-in card OR active/available/history
    signin/page.tsx           OAuth provider buttons
    me/page.tsx               all of the signed-in user's attempts
    results/[id]/page.tsx     read-only scorecard for a completed attempt
    tests/
      english-level/page.tsx      ensures an in-progress Attempt, renders the runner
      business-english/page.tsx    "
      preposition-party/page.tsx   drill test (DrillRunner + config)
      tension/page.tsx             drill test (DrillRunner + config)
    api/
      auth/[...nextauth]/route.ts  Auth.js handlers
      attempts/route.ts            GET (list mine) · POST (start, enforces one-open rule)
      attempts/[id]/route.ts       GET · PATCH (autosave answers / complete) · DELETE (discontinue)
  components/
    EnglishLevelRunner.tsx / BusinessEnglishRunner.tsx     client test UIs, debounced autosave
    EnglishLevelResults.tsx / BusinessEnglishResults.tsx   pure scorecards (reused by /results/[id])
    LandingHub.tsx, Navbar.tsx, AuthButtons.tsx
  lib/
    db.ts, mongoClient.ts     lazy cached connections (nothing connects at import → build works w/o env)
    models/Attempt.ts         Mongoose schema
    tests/englishLevel.ts     question bank + scoreEnglishLevel()
    tests/businessEnglish.ts  emails + vocab + norm/lev/grade + scoreBusinessEnglish()
    tests/score.ts            testId → { computeProgress, computeSummary }  (server-authoritative)
    tests/registry.ts         test metadata for the hub
    validation.ts             zod schemas for the API
    attempts.ts               server data access + serializeAttempt()
    ensureAttempt.ts          get-or-create the single in-progress attempt
```

**Scoring is server-authoritative.** Runners import the same `score*` functions for instant
feedback, but on `complete` the API recomputes `summary` from the stored answers and ignores
anything the client claims.

**One open test at a time** is enforced in `POST /api/attempts` and `ensureAttempt()`:
a second test is refused (409) while another attempt is `in_progress`.

## Local development

1. `npm install`
2. `cp .env.example .env.local` and fill it in (see below).
3. `npm run dev` → http://localhost:3000

Signed-out pages render without a database. Signing in and taking a test needs
`MONGODB_URI` and at least one OAuth provider.

### Environment variables

| Var | Where to get it |
|---|---|
| `MONGODB_URI` | Atlas → **Connect → Drivers**. Put the DB name in the path (`/eggwhite`). The adapter uses database `eggwhite`. |
| `AUTH_SECRET` | `npx auth secret` (or `openssl rand -base64 33`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → **APIs & Services → Credentials → OAuth client ID → Web application** |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub → **Settings → Developer settings → OAuth Apps → New** |
| `AUTH_URL` | local only, `http://localhost:3000`. Vercel sets it automatically. |

OAuth redirect / callback URLs to register:

```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
https://YOUR_VERCEL_DOMAIN/api/auth/callback/google
https://YOUR_VERCEL_DOMAIN/api/auth/callback/github
```

## Deploy to Vercel

1. **MongoDB Atlas**: create a free **M0** cluster. Add a database user. Under
   **Network Access** add `0.0.0.0/0` (Vercel's IPs are dynamic). Copy the SRV URI and
   append `/eggwhite`.
2. **Vercel → New Project** → import this repo. Set **Root Directory = `web`**.
   Framework preset auto-detects Next.js.
3. Add all env vars from the table above under **Settings → Environment Variables**
   (Production + Preview). Do **not** set `AUTH_URL`.
4. Deploy. Note the production domain.
5. Add the production callback URLs (above) to the Google and GitHub OAuth apps.
6. Re-deploy if you changed env vars after the first build.

`npm run build` runs `next build`; no extra build command or output directory needed.
