SHELL := /bin/bash

.PHONY: build up down logs prune manage \
	local-build local-up local-down local-logs local-prune local-manage \
	dev-build dev-up dev-down dev-logs dev-prune dev-manage \
	qa-build qa-up qa-down qa-logs qa-prune qa-manage \
	stage-build stage-up stage-down stage-logs stage-prune stage-manage \
	prod-build prod-up prod-down prod-logs prod-prune prod-manage \
	lint test

ARGS ?=

build:
	@$(MAKE) local-build

up:
	@$(MAKE) local-up

down:
	@$(MAKE) local-down

logs:
	@$(MAKE) local-logs

prune:
	@$(MAKE) local-prune

manage:
	@$(MAKE) local-manage

local-build:
	@COMPOSE_FILE=docker-compose.local.yml docker compose build

local-up:
	@COMPOSE_FILE=docker-compose.local.yml docker compose up -d --remove-orphans

local-down:
	@COMPOSE_FILE=docker-compose.local.yml docker compose down

local-prune:
	@COMPOSE_FILE=docker-compose.local.yml docker compose down -v

local-logs:
	@COMPOSE_FILE=docker-compose.local.yml docker compose logs -f

local-manage:
	@COMPOSE_FILE=docker-compose.local.yml docker compose run --rm django python ./manage.py $(ARGS)

dev-build:
	@COMPOSE_FILE=docker-compose.dev.yml docker compose build

dev-up:
	@COMPOSE_FILE=docker-compose.dev.yml docker compose up -d --remove-orphans

dev-down:
	@COMPOSE_FILE=docker-compose.dev.yml docker compose down

dev-prune:
	@COMPOSE_FILE=docker-compose.dev.yml docker compose down -v

dev-logs:
	@COMPOSE_FILE=docker-compose.dev.yml docker compose logs -f

dev-manage:
	@COMPOSE_FILE=docker-compose.dev.yml docker compose run --rm django python ./manage.py $(ARGS)

qa-build:
	@COMPOSE_FILE=docker-compose.qa.yml docker compose build

qa-up:
	@COMPOSE_FILE=docker-compose.qa.yml docker compose up -d --remove-orphans

qa-down:
	@COMPOSE_FILE=docker-compose.qa.yml docker compose down

qa-prune:
	@COMPOSE_FILE=docker-compose.qa.yml docker compose down -v

qa-logs:
	@COMPOSE_FILE=docker-compose.qa.yml docker compose logs -f

qa-manage:
	@COMPOSE_FILE=docker-compose.qa.yml docker compose run --rm django python ./manage.py $(ARGS)

stage-build:
	@COMPOSE_FILE=docker-compose.stage.yml docker compose build

stage-up:
	@COMPOSE_FILE=docker-compose.stage.yml docker compose up -d --remove-orphans

stage-down:
	@COMPOSE_FILE=docker-compose.stage.yml docker compose down

stage-prune:
	@COMPOSE_FILE=docker-compose.stage.yml docker compose down -v

stage-logs:
	@COMPOSE_FILE=docker-compose.stage.yml docker compose logs -f

stage-manage:
	@COMPOSE_FILE=docker-compose.stage.yml docker compose run --rm django python ./manage.py $(ARGS)

prod-build:
	@COMPOSE_FILE=docker-compose.prod.yml docker compose build

prod-up:
	@COMPOSE_FILE=docker-compose.prod.yml docker compose up -d --remove-orphans

prod-down:
	@COMPOSE_FILE=docker-compose.prod.yml docker compose down

prod-prune:
	@COMPOSE_FILE=docker-compose.prod.yml docker compose down -v

prod-logs:
	@COMPOSE_FILE=docker-compose.prod.yml docker compose logs -f

prod-manage:
	@COMPOSE_FILE=docker-compose.prod.yml docker compose run --rm django python ./manage.py $(ARGS)

lint:
	@echo "No lint configured for apps/core-api"

test:
	@echo "No tests configured for apps/core-api"
