TONоготчи — MVP Monorepo

What’s inside
- apps/api: NestJS API with MVP endpoints
- apps/worker: cron worker for neglect/lifespan checks
- packages/db: Drizzle ORM schema + simple SQL migration runner
- packages/shared: shared types and constants
- packages/contracts: Tact contract stubs (NftItem mortality, BreedingService)
- packages/renderer: renderer stub interface

Env
Copy .env.example to .env and fill values:
- TON_RPC_URL, TON_MNEMONIC, COLLECTION_ADDR
- GRAVE_CID, RENDER_WEBHOOK_SECRET
- POSTGRES_URL, REDIS_URL
- RENDER_QUEUE (default render_jobs), RENDERER_URL, CALLBACK_URL

Scripts
- npm run build — build all workspaces
- npm run dev — dev for all workspaces (run separately per app for now)
- npm --workspace apps/api run dev — start API at :3000
- npm --workspace apps/worker run dev — start worker loop
- npm --workspace apps/renderer-svc run dev — start renderer HTTP
- npm --workspace apps/render-worker run dev — start renderer worker
- npm --workspace @tonogotchi/db run migrate:sql — apply initial schema

API (draft)
- GET /api/pet/:addr — pet status/meta
- POST /api/pet/:addr/care { type } — record care event
- POST /api/breed/start { A, B, commitHash }
- POST /api/breed/reveal { sessionId, seed }
- POST /api/market/list { addr, market }
- POST /api/clan/create; POST /api/clan/join; GET /api/clan/:id

Cron logic
- neglect-check: every 30m, kills pets with >7 days without care
- lifespan-check: natural deaths by time

Contracts
- NftItem.tact: declareDeath() flips content_uri to GRAVE_CID and clears editor
- BreedingService.tact: start/reveal stubs for commit-reveal

Notes
- Marketplace deeplink is returned to be opened client-side.
- TonConnect flows, on-chain calls, and full renderer pipeline are stubbed for MVP.

Railway Deploy
- Install Railway CLI and login: `npm i -g @railway/cli && railway login`
- Create a project: `railway init`
- Deploy services using Dockerfiles:
  - API: from repo root run `railway up --service api --path ./` and set the service to build `apps/api/Dockerfile` (or deploy from folder `apps/api` with its Dockerfile path).
  - Worker: `railway up --service worker` (Dockerfile at `apps/worker/Dockerfile`).
  - Renderer HTTP: `railway up --service renderer-svc` (Dockerfile at `apps/renderer-svc/Dockerfile`).
  - Render worker: `railway up --service render-worker` (Dockerfile at `apps/render-worker/Dockerfile`).
- Configure variables per service in Railway Dashboard:
  - Common: `POSTGRES_URL`, `REDIS_URL`, `RENDER_WEBHOOK_SECRET`.
  - API: `RENDERER_URL` (public URL of renderer-svc), `CALLBACK_URL` (public URL of API), TON vars.
  - Worker: TON vars.
  - Renderer-svc: `REDIS_URL`, `RENDER_WEBHOOK_SECRET`, `RENDER_QUEUE`.
  - Render-worker: `REDIS_URL`, `RENDER_QUEUE`.
