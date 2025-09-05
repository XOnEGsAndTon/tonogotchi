TONоготчи — MVP Monorepo

What’s inside
- apps/api: NestJS API with MVP endpoints
- apps/worker: cron worker for neglect/lifespan checks
- packages/db: Drizzle ORM schema + simple SQL migration runner
- packages/shared: shared types and constants
- packages/contracts: Tact contract stubs (NftItem mortality, BreedingService)
 

Env
Copy .env.example to .env and fill values:
- TON_RPC_URL, TON_MNEMONIC, COLLECTION_ADDR
- GRAVE_CID
- POSTGRES_URL, REDIS_URL
 

Scripts
- npm run build — build all workspaces
- npm run dev — dev for all workspaces (run separately per app for now)
- npm --workspace apps/api run dev — start API at :3000
- npm --workspace apps/worker run dev — start worker loop
 
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
 

Railway Deploy
- Install Railway CLI and login: `npm i -g @railway/cli && railway login`
- Create a project: `railway init`
- Deploy services using Dockerfiles:
  - API: from repo root run `railway up --service api --path ./` and set the service to build `apps/api/Dockerfile` (or deploy from folder `apps/api` with its Dockerfile path).
  - Worker: `railway up --service worker` (Dockerfile at `apps/worker/Dockerfile`).
- Configure variables per service in Railway Dashboard:
  - API: `POSTGRES_URL` and TON vars.
  - Worker: `POSTGRES_URL` and TON vars.
