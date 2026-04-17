
# AGENTS.md

## Purpose
This repository is designed to be safely operated by **AI agents and humans**.
This document defines **how agents must behave**, **what they may modify**, and **how to run code safely**.

---

## Golden Rules
1. **Makefiles are the execution API**
2. **Nx decides what runs**
3. **Contracts define reality**
4. **Minimal change > clever change**
5. **When unsure: stop and ask**

---

## Repository Overview

### Apps
- `apps/core-api` — Django REST API (system of record)
- `apps/web` — React frontend (TanStack Start)
- `apps/ai-service` — FastAPI AI agent service
- `apps/ws-gateway` — Elysia WebSocket gateway (Bun)
- `apps/docs` — Starlight documentation site

### Shared Packages
- `packages/contracts` — OpenAPI specs + Event schemas (authoritative source of truth)
- `packages/sdk` — Shared SDK
- `packages/shared` — Shared utilities
- `packages/ui` — UI component library

---

## Required Workflow for Agents

### Default (safe)
```bash
bunx nx affected -t test --dry-run
bunx nx affected -t lint
bunx nx affected -t test
```

### If contracts change
```bash
bunx nx run contracts:contracts
bunx nx affected -t build
bunx nx affected -t test
```

---

## LLM Prompting Rules (Mandatory)

### Allowed
- Deterministic reasoning
- Small, reviewable diffs
- Reading docs before guessing

### Forbidden
- Hallucinating APIs or schemas
- Silent breaking changes
- Large refactors without request

### Discipline
- OpenAPI + JSON Schema are **ground truth**
- ADRs are **binding**
- Missing info → ask

---

## App-Specific Notes

### core-api
- Django management commands: `make -C apps/core-api local-manage ARGS="<command>"`
- Run migrations: `make -C apps/core-api local-manage ARGS="migrate"`
- Local dev: `make -C apps/core-api local-up`

### web
- Dev server: `make -C apps/web dev`
- Build: `make -C apps/web build`

### ai-service
- Entry: `src/myapp_ai/app.py`
- Dev infra (Postgres + Phoenix): `make -C apps/ai-service dev-infra`
- Dev: `make -C apps/ai-service dev`
- Dev all-in-one: `make -C apps/ai-service dev-all`
- Test: `make -C apps/ai-service test`
- Config: `apps/ai-service/.env` (copy from `.env.example`)

### ws-gateway
- Dev: `make -C apps/ws-gateway dev`

---

## Prohibited Actions
- Adding new services without discussion
- Modifying infrastructure assumptions
- Introducing new frameworks without approval
- Committing real secrets or credentials
- Modifying `packages/contracts/` without running `make contracts`

---

## Summary
- Use Makefiles
- Use Nx affected
- Respect contracts
