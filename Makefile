SHELL := /bin/bash

.PHONY: help dev lint test contracts graph affected-lint affected-test affected-build

help:
	@echo "Targets:"
	@echo "  bun install      - install JS workspace deps (Bun)"
	@echo "  make dev         - start dev for all apps (via Nx)"
	@echo "  make contracts   - validate + generate clients from contracts"
	@echo "  make lint        - lint all projects"
	@echo "  make test        - test all projects"
	@echo "  make graph       - visualize dependency graph"
	@echo "  make affected-*  - run only on affected projects"

dev:
	@bunx nx run-many -t dev --parallel=3

lint:
	@bunx nx run-many -t lint --parallel=3

test:
	@bunx nx run-many -t test --parallel=3

contracts:
	@bunx nx run contracts:contracts

graph:
	@bunx nx graph

affected-lint:
	@bunx nx affected -t lint

affected-test:
	@bunx nx affected -t test

affected-build:
	@bunx nx affected -t build
