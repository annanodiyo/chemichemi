# Chemichemi — Local dev & run instructions

Quick notes to run the frontend and backend together, how environment variables map, and how the on-device AI (prediction) is integrated so features work without conflicts.

**Prerequisites**
- Go 1.22+ installed and on your PATH
- Node.js (16+) and `npm` (or `pnpm`/`yarn`) for the frontend
- Docker (optional, for `make docker`)

**Setup**
1. Install backend deps:

```bash
cd $(pwd)
go mod download
```

2. Install frontend deps:

```bash
cd frontend
npm ci
```

**Environment (.env)**
- Place runtime secrets in a workspace `.env` file (this repo already ignores `.env`).
- Backend expects `AT_APIKEY` (or `AFRICASTALKING_SANDBOX_API_KEY`) and optional `AT_USERNAME`.
- The Makefile maps `AFRICASTALKING_API_KEY` → `AT_APIKEY` when starting the backend via `make run` / `make dev` so you can use either name in `.env`.

Suggested variables (example):

```env
# Real / sandbox Africa's Talking API key (backend uses AT_APIKEY)
AFRICASTALKING_API_KEY=atsk_xxx...   # or AT_APIKEY=...
AT_USERNAME=sandbox                 # optional; "sandbox" points to the sandbox API

# Optional: override users file path
USERS_FILE=backend/users.json

# Frontend-only sandbox recipients (comma separated)
AFRICASTALKING_SANDBOX_RECIPIENTS=+2547XXXXXXXX

PORT=8080                            # backend port (default 8080)
CORS_ORIGIN=http://127.0.0.1:5173     # frontend dev origin
```

**Run (development)**
- Start both frontend and backend in one terminal:

```bash
make dev
```

- Or run in two terminals:

```bash
make backend    # runs `go run ./backend/cmd` with .env exported
cd frontend && npm run dev
```

**Run (build)**

```bash
make build
./bin/chemichemi      # runs the compiled backend
cd frontend && npm run build
```

**Deploy (single Docker image)**

This repository now builds the frontend and embeds it into the Go backend binary so the project runs as a single web service.

- Build locally with Docker:

```bash
docker build -t chemichemi:local .
docker run -p 8080:8080 -e AT_APIKEY=atsk_xxx... chemichemi:local
```

- Deploy on Render: `render.yaml` is configured to use the root `Dockerfile`. Import the repo in Render and set the following secrets for the service `chemichemi`:
	- `AT_APIKEY` (required for real SMS)
	- `AT_USERNAME` (optional; set to `sandbox` for sandbox testing)
	- `AFRICASTALKING_SANDBOX_RECIPIENTS` (optional; comma-separated)

The single service will serve the SPA and expose API endpoints at `/api/*`, `/webhook/sms`, and `/healthz`.

**AI / Intelligence integration (how features work together)**
- The core "AI" prediction is an on-device logistic regression implemented in the frontend at `frontend/src/lib/intelligence.ts`. It runs fully offline in the browser and does not require a remote ML service.
- The frontend computes risk, water-quality indices and a 72-hour probability prediction using deterministic rules + the on-device classifier. This means the AI features work immediately in the browser and do not conflict with backend behavior.
- The backend provides SMS webhook handling and broadcasting via Africa's Talking (see `backend/internal/sms/sms.go`). To send real SMS you must supply a live `AT_APIKEY` and (optionally) `AT_USERNAME`.
- For safe local testing, the frontend supports Africa's Talking Sandbox via `AFRICASTALKING_SANDBOX_API_KEY` and `AFRICASTALKING_SANDBOX_RECIPIENTS`. Sandbox messages do not reach real handsets.

**Why there should be no conflicts**
- On-device AI keeps model/state in the frontend; the backend is stateless for prediction concerns, so updating one side won't unexpectedly change the other.
- The Makefile and README document environment variable names and the mapping of `AFRICASTALKING_API_KEY` → `AT_APIKEY` used by the backend to avoid mismatched env names.
- CORS is pre-configured in the backend (default `http://127.0.0.1:5173`) — set `CORS_ORIGIN` in `.env` to match your frontend host if needed.

**Testing SMS flow (sandbox)**
1. Add `AFRICASTALKING_SANDBOX_API_KEY` and `AFRICASTALKING_SANDBOX_RECIPIENTS` to `.env` (or to `frontend/.env` for frontend-only testing).
2. Start the frontend (`make frontend` or `npm run dev`).
3. In the UI, use "Send sandbox alert" — it invokes the frontend server function which posts to Africa's Talking sandbox.

**Troubleshooting**
- If server functions fail, ensure the frontend dev server is running via Vite (port 5173) and backend on 8080 unless overridden.
- If SMS calls return API errors, check `AT_APIKEY`/`AFRICASTALKING_SANDBOX_API_KEY` and `AT_USERNAME` values; inspect logs in the backend terminal for HTTP response bodies.
- If users aren't persisted, verify `USERS_FILE` path or that `backend/users.json` exists and is writable.

**Next steps I can do for you**
- Add a short `Dockerfile` for the backend and a `docker-compose` to run both services together.
- Add a small integration test that hits `/api/trigger-alert` and validates broadcast logging.

---
If you want, I can commit this README now and optionally spin up the dev servers and show logs. Which would you like next? 
