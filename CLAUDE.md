# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Governing documents

The project constitution is the source of all engineering rules (principles, testing discipline, Git workflow, quality gates). It is imported below and takes precedence over this file; if this file contradicts it, fix this file.

@.specify/memory/constitution.md

- `DESIGN.md` is the design source of truth — read it before any UI work. `codeconnect-design/` (prototypes and handoff) is a local-only visual reference, git-ignored.
- The constitution, `DESIGN.md`, the README and all UI copy are in Brazilian Portuguese; this file stays in English.
- Features follow the Spec Kit flow (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`); amend the constitution only via `/speckit-constitution`.

## Overview

Monorepo: React 19 + Vite 7 + Tailwind 4 + TypeScript (`frontend/`) and a Go + Gin REST API (`backend/`) backed by MySQL, all running in Docker Compose.

## Commands

The Makefile wraps `docker compose` (`make help` lists everything):

- `make up` — copies `.env.example` → `.env` if missing, builds and starts all services (frontend :5173, API :8080, MySQL host port :3307)
- `make logs` / `logs-backend` / `logs-frontend` / `logs-mysql`
- `make backend-test` — `go test --race ./...` inside the backend container (single test: `docker compose exec -e CGO_ENABLED=1 backend go test --race ./internal/handlers -run TestName`). `--race` needs CGO; gcc/musl-dev are installed in the `dev` image stage, so rebuild with `make build` after pulling Dockerfile changes
- `make frontend-lint` — type check only (`tsc -b --noEmit`); there is no ESLint and no frontend test runner yet (Vitest + Testing Library still to be added to meet constitution principle IV)
- `make frontend-install pkg=<name>` / `make backend-tidy` — add deps inside the containers
- `make db-cli` (app user) / `make db-root`; `make db-dump` / `db-restore` use `db/dump.sql`; `make db-reset` and `make clean` are destructive
- `make hooks-install` — sets `core.hooksPath` to `.githooks`; the `pre-commit` hook runs `go fmt` (re-staging the formatted files) and `go vet` on the backend and aborts the commit if vet fails. It uses local Go if present, otherwise the running backend container
- `make prod-build` — builds the `prod` Docker targets for both services

## Conventions

- The main branch is `master`.
- If you find that an assumption in this file (or one you made during the session) was wrong, suggest a correction to `CLAUDE.md`.

## Architecture

**Backend** (`backend/`, module `github.com/code-connect/backend`): `cmd/api/main.go` wires `config.Load()` → `database.Connect(cfg.DSN())` → `router.New(cfg, db)`. Handlers are structs holding their dependencies (e.g. `handlers.Health{DB: db}`) with methods registered in `internal/router/router.go` under the `/api` group. Config defaults live in `internal/config`. Dev hot reload uses Air (`.air.toml`, polling mode, builds to `tmp/`). Source is bind-mounted into the container at `/app`.

**Frontend** (`frontend/`): the Vite dev server proxies `/api` to `VITE_API_PROXY_TARGET` (set to `http://backend:<port>` by compose); in prod, nginx serves the build and proxies `/api/` to `backend:8080` (`frontend/nginx.conf`). File watching uses polling because of the bind mount. `node_modules` lives in a named volume.

**Config flow**: root `.env` (see `.env.example`) → `docker-compose.yml` maps `MYSQL_*` vars to the backend's `DB_*` vars and sets `CORS_ORIGIN` (must match the frontend origin).

**Docker**: both Dockerfiles are multi-stage with `dev` and `prod` targets; compose uses `dev`.

`db/` is mounted at `/db` in the `mysql-cli` container (profile `tools`) for `source /db/file.sql`.
