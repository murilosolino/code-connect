# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo: React 19 + Vite 7 + Tailwind 4 + TypeScript (`frontend/`) and a Go + Gin REST API (`backend/`) backed by MySQL. Everything runs in Docker Compose; the README is in Portuguese.

## Commands

Development is container-first — the Makefile wraps `docker compose` (`make help` lists everything):

- `make up` — copies `.env.example` → `.env` if missing, builds and starts all services (frontend :5173, API :8080, MySQL host port :3307)
- `make logs` / `logs-backend` / `logs-frontend` / `logs-mysql`
- `make backend-test` — `go test --race ./...` inside the backend container (single test: `docker compose exec -e CGO_ENABLED=1 backend go test --race ./internal/handlers -run TestName`). Backend tests must always pass with the `--race` flag, which needs CGO (gcc/musl-dev are installed in the `dev` image stage; rebuild with `make build` after pulling Dockerfile changes)
- `make frontend-lint` — type check only (`tsc -b --noEmit`); there is no ESLint
- `make frontend-install pkg=<name>` / `make backend-tidy` — add deps inside the containers
- `make db-cli` (app user) / `make db-root`; `make db-dump` / `db-restore` use `db/dump.sql`; `make db-reset` and `make clean` are destructive
- `make hooks-install` — sets `core.hooksPath` to `.githooks`; the `pre-commit` hook runs `go fmt` (re-staging the formatted files) and `go vet` on the backend and aborts the commit if vet fails. It uses local Go if present, otherwise the running backend container
- `make prod-build` — builds the `prod` Docker targets for both services

Both Dockerfiles are multi-stage with `dev` and `prod` targets; compose uses `dev`.

## Conventions

- Use Conventional Commits for all commit messages (e.g. `feat: ...`, `fix(backend): ...`, `chore: ...`).
- Always work from a branch; never work directly on the main branch. Name branches `<convention>/<description>` in kebab-case, e.g. `feat/billing-module`, `fix/payment-credit-card-error`.
- If you find that an assumption in this file (or one you made during the session) was wrong, suggest a correction to `CLAUDE.md`.

## Architecture

**Backend** (`backend/`, module `github.com/code-connect/backend`): `cmd/api/main.go` wires `config.Load()` → `database.Connect(cfg.DSN())` → `router.New(cfg, db)`. Handlers are structs holding their dependencies (e.g. `handlers.Health{DB: db}`) with methods registered in `internal/router/router.go` under the `/api` group. Config comes only from env vars with defaults (`internal/config`). Dev hot reload uses Air (`.air.toml`, polling mode, builds to `tmp/`). Source is bind-mounted into the container at `/app`.

**Frontend** (`frontend/`): Vite dev server proxies `/api` to `VITE_API_PROXY_TARGET` (set to `http://backend:<port>` by compose), so frontend code should call relative `/api/...` URLs. File watching uses polling because of the bind mount. `node_modules` lives in a named volume, so install packages via the container, not the host.

**Config flow**: root `.env` (see `.env.example`) → `docker-compose.yml` maps `MYSQL_*` vars to the backend's `DB_*` vars and sets `CORS_ORIGIN` (must match the frontend origin).

`db/` is mounted at `/db` in the `mysql-cli` container (profile `tools`) for `source /db/file.sql`.
