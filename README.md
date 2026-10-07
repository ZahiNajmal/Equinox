# Equinox — Fullstack Web Application (Frontend + Backend)

Equinox is an educational web platform (frontend in React + Vite, Tailwind CSS; backend in Node.js + Express). This repo contains the full source for both client and server, sample data, and API endpoints that proxy AI and News APIs through server-side environment variables.

This README explains installation, environment variables, dev commands, and notes about cost-control, caching, and deployment.

## Folder layout
See top of repository for the full folder tree. Key folders:
- client/ — React + Tailwind frontend (Vite)
- server/ — Express API server and sample dataset

## Requirements
- Node.js 18+ recommended
- npm (or yarn)
- (Optional) For PDF generation: no external service required; uses pdfkit (server-side)

## Environment variables
Copy `.env.example` to `.env` in the `server/` folder and fill with your keys (do NOT commit real keys).

Server environment variables (server/.env):
- GOOGLE_AI_KEY — Google AI Studio API key (or other AI provider key) — server-side only
- NEWSAPI_KEY — NewsAPI.org API key — server-side only
- PORT — optional (default 4000)

## Local development

1. Install dependencies (root runs both client & server installs)
```bash
npm run bootstrap
```

2. Run both dev servers (concurrently)
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api

Alternatively run individually:
- Server:
  ```
  cd server
  npm run dev
  ```
- Client:
  ```
  cd client
  npm run dev
  ```

## Build & Deploy

- Vercel: Deploy `client` as static frontend and `server` as serverless functions or deploy server separately (e.g., Render) and set environment variables there.
- Render / Heroku: Deploy `server` as an Express app. Deploy `client` as static site or create combined build.
- Make sure to set `GOOGLE_AI_KEY` and `NEWSAPI_KEY` in the production environment.

## Data & DB
This MVP uses simple JSON files (server/data/*.json) to store experiments, countries, and user progress. For production, migrate to SQLite/Postgres.

Sample datasets:
- 30 countries in `server/data/countries.json`
- 8 experiments in `server/data/experiments.json`

## API Overview
The backend exposes these endpoints:

- GET `/api/dashboard`
- GET `/api/experiments`
- POST `/api/experiments/:id/run` — accepts JSON variables; returns simulated result series
- POST `/api/ai/qa` — QA interaction (calls AI)
- POST `/api/ai/lab` — lab explanation (AI)
- POST `/api/ai/generateQuiz` — returns quiz JSON
- POST `/api/ai/generateMission` — mission generation
- POST `/api/ai/reflect` — reflection assistant
- POST `/api/ai/summarize` — summarize text via AI
- GET `/api/news?topic=...` — proxies to NewsAPI
- GET `/api/map/country/:code` — returns country details
- POST `/api/missions/complete` — marks mission complete
- GET `/api/user/progress` — returns progress
- POST `/api/reports/lab` — create lab report (returns PDF link stub)
- POST `/api/reports/progress` — export progress report (PDF)

Important security note: client never has third-party API keys. All third-party calls are server-side only.

## Postman / CURL
See `curl_examples.sh` in root for example calls to test APIs.

## Cost-control & Caching (short)
- All AI calls should be rate-limited and cached.
- Server implements a simple memory cache (services/cache.js). For production, use Redis.
- Minimize tokens by sending short prompts; batch operations; reuse cached summaries.
- Recommended rate limit: ~60 requests per minute per API key as a safe starting point; implement exponential backoff and retries on 429.

## Development notes & comments
- The server includes example code showing how to call Google AI Studio style endpoints using `process.env.GOOGLE_AI_KEY`. It does not include your real key.
- All AI endpoints return sample responses for local dev when `GOOGLE_AI_KEY` is not set, so you can build UI without costs.

---

If anything is missing or you want a Dockerfile, a SQLite migration, or more sample data, tell me and I will add it.