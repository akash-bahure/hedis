SHELL := /bin/bash

.PHONY: install dev dev-infra dev-all lint format test \
	docker-build docker-up docker-down docker-prune docker-logs clean

# ── Development ──────────────────────────────────────────────────────────────

install:
	@uv sync

dev:
	@uv run uvicorn src.myapp_ai.app:app --reload --host 0.0.0.0 --port 8080

dev-infra:
	@COMPOSE_FILE=docker-compose.local.yml docker compose up -d --remove-orphans
	@echo "PostgreSQL: localhost:5433  |  Phoenix UI: http://localhost:6006"

dev-all: dev-infra
	@sleep 2
	@$(MAKE) dev

dev-infra-down:
	@COMPOSE_FILE=docker-compose.local.yml docker compose down

dev-infra-prune:
	@COMPOSE_FILE=docker-compose.local.yml docker compose down -v

dev-infra-logs:
	@COMPOSE_FILE=docker-compose.local.yml docker compose logs -f

# ── Code Quality ─────────────────────────────────────────────────────────────

lint:
	@uv run ruff check .
	@uv run ruff format --check .

format:
	@uv run ruff format .
	@uv run ruff check --fix .

test:
	@uv run pytest

# ── Docker (production image) ────────────────────────────────────────────────

docker-build:
	@docker build -t ai-service .

docker-up:
	@docker compose up -d

docker-down:
	@docker compose down

docker-prune:
	@docker compose down -v

docker-logs:
	@docker compose logs -f

# ── Cleanup ──────────────────────────────────────────────────────────────────

clean:
	@find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.pyc" -delete
	@rm -rf .venv dist build *.egg-info artifacts/
