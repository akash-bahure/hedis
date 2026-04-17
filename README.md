# myapp Monorepo

> A production-ready polyglot monorepo template: Django API + React frontend + FastAPI AI service + WebSocket gateway + docs — deployed on Kubernetes via GitOps.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start — Local Development](#3-quick-start--local-development)
4. [Project Initialization (rename from template)](#4-project-initialization-rename-from-template)
5. [Repository Structure](#5-repository-structure)
6. [Apps](#6-apps)
   - [core-api (Django)](#61-core-api-django)
   - [web (React)](#62-web-react)
   - [ai-service (FastAPI)](#63-ai-service-fastapi)
   - [ws-gateway (Elysia)](#64-ws-gateway-elysia)
   - [docs (Starlight)](#65-docs-starlight)
7. [Shared Packages](#7-shared-packages)
8. [Contracts Workflow](#8-contracts-workflow)
9. [Adding a New App](#9-adding-a-new-app)
10. [Infrastructure Overview](#10-infrastructure-overview)
11. [Secrets Management (OpenBao)](#11-secrets-management-openbao)
12. [Kubernetes Cluster Setup](#12-kubernetes-cluster-setup)
13. [GitOps Bootstrap (ArgoCD)](#13-gitops-bootstrap-argocd)
14. [CI/CD (GitHub Actions + GHCR)](#14-cicd-github-actions--ghcr)
15. [Environment Reference](#15-environment-reference)
16. [Day-2 Operations](#16-day-2-operations)

---

## 1. Overview

### Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Client Browser                     │
└──────────────────┬───────────────┬───────────────────┘
                   │               │
              HTTPS (443)    WSS (443)
                   │               │
         ┌─────────▼───────────────▼──────────┐
         │          Traefik Ingress            │
         └─────┬──────────────┬───────────────┘
               │              │
    ┌──────────▼────┐  ┌──────▼───────────┐
    │   web (React) │  │ ws-gateway (Bun) │
    │   Nginx:80    │  │ Elysia:3001      │
    └───────────────┘  └──────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │  core-api (Django)  │
                   │  Gunicorn:5000      │
                   └──────┬─────────────┘
                          │
              ┌───────────┼──────────────┐
              │           │              │
    ┌─────────▼──┐  ┌─────▼───┐  ┌──────▼────┐
    │ PostgreSQL │  │  Redis  │  │  Celery   │
    │ (PgBouncer)│  │         │  │ Worker    │
    └────────────┘  └─────────┘  └───────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Django 5.2, DRF 3.16, Celery 5.6 |
| Frontend | React 19, TanStack Router/Query, Vite, Tailwind CSS |
| AI Service | Google ADK, FastAPI, Python 3.13, Phoenix |
| WebSocket | Elysia (Bun) |
| Documentation | Starlight (Astro) |
| Database | PostgreSQL 18 (via PgBouncer) |
| Cache / Queue | Redis 7.2 |
| Container Runtime | Docker |
| Orchestration | Kubernetes + Kustomize |
| GitOps | ArgoCD |
| Secrets | OpenBao + External Secrets Operator |
| CI/CD | GitHub Actions + GHCR |
| Monorepo | Nx 20, Yarn workspaces (JS), UV (Python) |

---

## 2. Prerequisites

Install these tools before getting started:

| Tool | Version | Install |
|---|---|---|
| [Bun](https://bun.sh) | ≥ 1.3 | `curl -fsSL https://bun.sh/install \| bash` |
| [Python](https://python.org) | 3.13 | [python.org](https://www.python.org/downloads/) |
| [UV](https://docs.astral.sh/uv/) | latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| [Docker](https://docker.com) | ≥ 27 | [docs.docker.com](https://docs.docker.com/get-docker/) |
| [Make](https://gnu.org/software/make/) | any | pre-installed on macOS/Linux |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | ≥ 1.29 | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/) | ≥ 2.10 | `brew install argocd` |
| [Helm](https://helm.sh) | ≥ 3.14 | `brew install helm` |
| git | ≥ 2.40 | pre-installed |

Optional but useful:

- `k9s` — terminal Kubernetes UI
- `bao` (OpenBao CLI) — secrets management

---

## 3. Quick Start — Local Development

### Step 1 — Clone and initialize

If you've already run `init.sh`, skip to Step 2. If you're starting from the template for the first time:

```bash
git clone git@github.com:my-org/myapp-monorepo.git
cd myapp-monorepo

# Rename placeholders to your project (see Section 4)
./tooling/scripts/init.sh myapp my-org example.com
```

### Step 2 — Install JS dependencies

```bash
bun install
```

### Step 3 — Set up core-api environment files

```bash
cp apps/core-api/.envs/.local/.django.example   apps/core-api/.envs/.local/.django
cp apps/core-api/.envs/.local/.postgres.example apps/core-api/.envs/.local/.postgres
```

Edit both files and set your values (the defaults work for local development as-is).

### Step 4 — Start core-api (Django + PostgreSQL + Redis + Celery)

```bash
# Build Docker images
make -C apps/core-api local-build

# Start all services
make -C apps/core-api local-up

# Run migrations
make -C apps/core-api local-manage ARGS="migrate"

# Create a superuser
make -C apps/core-api local-manage ARGS="createsuperuser"
```

Services available:
- Django API: http://localhost:8000
- Django Admin: http://localhost:8000/admin/
- API Docs (Swagger): http://localhost:8000/api/docs/
- Mailpit (email): http://localhost:8025
- Flower (Celery): http://localhost:5555

### Step 5 — Start web (React)

```bash
# In a separate terminal
make -C apps/web dev
```

Web app available at: http://localhost:3000

API requests are proxied to `http://localhost:8000` via `vite.config.ts`.

---

## 4. Project Initialization (rename from template)

The template uses placeholder strings that must be replaced before pushing to your repo.

### Run the init script

```bash
./tooling/scripts/init.sh <app-name> <github-org> <domain>
```

**Arguments:**

| Argument | Example | Description |
|---|---|---|
| `app-name` | `acme` | Lowercase project name used in code, Docker images, K8s labels |
| `github-org` | `acme-corp` | GitHub organisation slug |
| `domain` | `acme.com` | Your base domain for ingress |

**Example:**

```bash
./tooling/scripts/init.sh acme acme-corp acme.com
```

This replaces:
- `myapp` → `acme` in all files
- `my-org` → `acme-corp` in all files
- `example.com` → `acme.com` in all files
- Renames `apps/core-api/myapp/` directory → `apps/core-api/acme/`

After running, verify with:

```bash
git diff --stat
grep -r "myapp\|my-org\|example\.com" . --exclude-dir=.git --exclude-dir=node_modules
```

Then commit and push to your new repo.

---

## 5. Repository Structure

```
myapp-monorepo/
├── apps/                          # Deployable applications
│   ├── core-api/                  # Django REST API (system of record)
│   ├── web/                       # React frontend (TanStack Start)
│   ├── ai-service/                # FastAPI AI agent service
│   ├── ws-gateway/                # Elysia WebSocket gateway (Bun)
│   └── docs/                      # Starlight documentation
│
├── packages/                      # Shared libraries
│   ├── contracts/                 # OpenAPI specs + event schemas (source of truth)
│   ├── sdk/                       # Generated API clients + shared helpers
│   ├── shared/                    # Shared utilities (used by all apps)
│   └── ui/                        # React UI component library
│
├── infra/
│   ├── README.md                  # Infrastructure documentation
│   └── k8s/                       # Kubernetes manifests (Kustomize)
│       ├── apps/                  # Per-app base + overlays
│       ├── environments/          # Environment compositions
│       └── platform/              # Platform components (OpenBao, ESO)
│
├── clusters/
│   └── your-cluster/              # ArgoCD Application manifests
│
├── tooling/
│   └── scripts/
│       ├── init.sh                # Project rename script
│       └── contracts/             # OpenAPI validation + client generation
│
├── .github/workflows/             # GitHub Actions CI/CD
├── nx.json                        # Nx monorepo config
├── package.json                   # Yarn workspaces root
├── Makefile                       # Root-level commands
├── AGENTS.md                      # AI agent operational guidelines
└── README.md                      # This file
```

---

## 6. Apps

### 6.1 core-api (Django)

The system of record. Django 5.2 REST API with PostgreSQL, Redis, Celery, and PgBouncer.

**Location:** `apps/core-api/`

#### Environment files

| File | Purpose |
|---|---|
| `.envs/.local/.django.example` | Django settings template |
| `.envs/.local/.postgres.example` | PostgreSQL/PgBouncer template |

#### Django settings

| Module | When used |
|---|---|
| `config.settings.local` | Local Docker compose dev |
| `config.settings.test` | pytest runs |
| `config.settings.production` | Kubernetes deployments |

#### Common commands

```bash
# Start all local services
make -C apps/core-api local-up

# Run migrations
make -C apps/core-api local-manage ARGS="migrate"

# Create superuser
make -C apps/core-api local-manage ARGS="createsuperuser"

# Open Django shell
make -C apps/core-api local-manage ARGS="shell_plus"

# Run a specific management command
make -C apps/core-api local-manage ARGS="your_command --flag value"

# Stop services
make -C apps/core-api local-down

# Stop and destroy volumes (full reset)
make -C apps/core-api local-prune
```

#### Adding a Django app

```bash
# Create the app
make -C apps/core-api local-manage ARGS="startapp myfeature myapp/myfeature"

# Register in config/settings/base.py:
# LOCAL_APPS = [
#     "myapp.users",
#     "myapp.myfeature",   ← add here
# ]

# Create and run migrations
make -C apps/core-api local-manage ARGS="makemigrations myfeature"
make -C apps/core-api local-manage ARGS="migrate"
```

#### User model

The custom User model is at `myapp/users/models.py`:
- Uses UUID primary key
- Email login (no username)
- Extend with additional fields as needed

#### API documentation

Swagger UI is available at `http://localhost:8000/api/docs/` (requires admin login).

Register new ViewSets in `config/api_router.py`.

---

### 6.2 web (React)

React 19 SPA with TanStack Router, TanStack Query, Vite, and Tailwind CSS.

**Location:** `apps/web/`

#### Running locally

```bash
make -C apps/web dev     # Dev server on port 3000
make -C apps/web build   # Production build to dist/
make -C apps/web preview # Preview production build
```

The Vite dev server proxies `/api/*` to `http://localhost:8000` (configured in `vite.config.ts`).

#### Production build

Docker multi-stage build:
1. **Build stage**: Bun compiles React to static files in `dist/`
2. **Serve stage**: Nginx serves the SPA with proper caching headers

Nginx config (`nginx.conf`):
- `try_files $uri /index.html` — SPA routing fallback
- `/assets/` — 1-year immutable cache for hashed files

#### Environment variables

Vite exposes env vars prefixed with `VITE_` to the browser. Create `.env.local` for local overrides:

```bash
# apps/web/.env.local (not committed)
VITE_API_URL=http://localhost:8000
```

---

### 6.3 ai-service (Google ADK)

AI agent service powered by [Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/). Fully scaffolded with persistent sessions, cloud-agnostic artifact storage, and Phoenix observability.

**Location:** `apps/ai-service/`

#### Key features

| Feature | Implementation |
|---|---|
| Session persistence | `DatabaseSessionService` → PostgreSQL (asyncpg) |
| Artifact storage | Cloud-agnostic: S3 / GCS / local filesystem / in-memory |
| Observability | Arize Phoenix + OpenTelemetry (OTLP/gRPC) |
| Agent framework | Google ADK `LlmAgent` with function tools |
| API | FastAPI with health probes and Swagger docs |

#### Running locally

```bash
# Install dependencies
make -C apps/ai-service install

# Configure (set at minimum GOOGLE_API_KEY)
cp apps/ai-service/.env.example apps/ai-service/.env

# Start infrastructure (PostgreSQL + Phoenix) + dev server
make -C apps/ai-service dev-all
```

Services available:
- AI Service API: http://localhost:8080
- API Docs (Swagger): http://localhost:8080/api/docs
- Phoenix UI (traces): http://localhost:6006

#### Adding agents

Copy the `agents/hello/` directory pattern:

1. Create `src/myapp_ai/agents/your_agent/agent.py` — define `LlmAgent` + tools
2. Register in `src/myapp_ai/agents/__init__.py`

See [apps/ai-service/README.md](apps/ai-service/README.md) for the full guide.

Port: `8080`

---

### 6.4 ws-gateway (Elysia)

**Location:** `apps/ws-gateway/`

This is a stub. See [apps/ws-gateway/README.md](apps/ws-gateway/README.md) for initialization instructions.

**Initialization:**
```bash
cd apps/ws-gateway
bun create elysia .
```

Port: `3001`

---

### 6.5 docs (Starlight)

**Location:** `apps/docs/`

This is a stub. See [apps/docs/README.md](apps/docs/README.md) for initialization instructions.

**Initialization:**
```bash
cd apps/docs
bun create astro@latest . --template starlight
```

Port: `4321`

---

## 7. Shared Packages

| Package | Purpose |
|---|---|
| `packages/contracts` | OpenAPI specs + JSON event schemas (ground truth) |
| `packages/sdk` | Generated API clients + shared helper functions |
| `packages/shared` | Constants, type guards, formatters used across apps |
| `packages/ui` | Shared React component library |

Packages are consumed via Yarn workspaces:

```json
// apps/web/package.json
{
  "dependencies": {
    "@myapp/sdk": "*",
    "@myapp/ui": "*"
  }
}
```

---

## 8. Contracts Workflow

The `packages/contracts/` directory is the **single source of truth** for all API and event interfaces. Never copy-paste types between apps — generate them.

### Workflow

```bash
# 1. Edit the OpenAPI spec
#    packages/contracts/openapi/core-api.yaml

# 2. Validate all specs
make contracts

# 3. Generate clients (add generators to tooling/scripts/contracts/generate_clients.sh)
make contracts

# 4. Run affected tests
bunx nx affected -t test
```

### Adding a generator

Edit `tooling/scripts/contracts/generate_clients.sh`:

```bash
# Example: generate TypeScript types for the web app
npx openapi-typescript packages/contracts/openapi/core-api.yaml \
  --output packages/sdk/src/core-api.d.ts
```

### Nx module boundaries

Nx enforces that apps only import from allowed packages:

| App tag | Can depend on |
|---|---|
| `type:frontend` | `type:contracts`, `type:ui` |
| `type:backend` | `type:contracts` |
| `type:ai` | `type:contracts` |
| `type:realtime` | `type:contracts` |
| `type:docs` | `type:contracts` |

---

## 9. Adding a New App

Follow this checklist when adding a new app to the monorepo:

**Step 1 — Create the app directory**

```bash
mkdir apps/my-new-app
```

**Step 2 — Create `apps/my-new-app/project.json`**

```json
{
  "name": "my-new-app",
  "tags": ["type:backend"],
  "targets": {
    "dev": { "command": "..." },
    "lint": { "command": "..." },
    "test": { "command": "..." },
    "build": { "command": "..." }
  }
}
```

Choose the correct `tags` value:
- Backend service: `"type:backend"`
- Frontend: `"type:frontend"`
- AI service: `"type:ai"`
- Realtime/WS: `"type:realtime"`

**Step 3 — Create a Makefile**

Copy from an existing app and adapt.

**Step 4 — Create a Dockerfile** (if containerized)

**Step 5 — Create K8s manifests**

```bash
# Create base manifests
mkdir -p infra/k8s/apps/my-new-app/base
# Create overlay directories
for env in dev qa stage prod; do
  mkdir -p infra/k8s/apps/my-new-app/overlays/$env
done
```

**Step 6 — Add to environment kustomizations**

Edit `infra/k8s/environments/{dev,qa,stage,prod}/kustomization.yaml`:

```yaml
resources:
  - ../../apps/core-api/overlays/dev
  - ../../apps/web/overlays/dev
  - ../../apps/my-new-app/overlays/dev  ← add here
```

**Step 7 — Add ExternalSecrets** (if the app needs secrets)

Create `infra/k8s/apps/my-new-app/overlays/{env}/externalsecrets.yaml`

**Step 8 — Add secrets to OpenBao**

```bash
kubectl exec -n openbao openbao-0 -- bao kv put kv/my-new-app/dev \
  SECRET_KEY="value"
```

**Step 9 — Add a GitHub Actions workflow** (if needs CI build)

Copy `.github/workflows/apps-web-build.yml` and adapt.

---

## 10. Infrastructure Overview

All Kubernetes infrastructure uses the **Kustomize base/overlay pattern**:

```
infra/k8s/
├── apps/
│   └── core-api/
│       ├── base/           ← Common across all environments
│       └── overlays/
│           ├── dev/        ← Environment-specific (namespace, configmap, image tag)
│           ├── qa/
│           ├── stage/
│           └── prod/
├── environments/
│   ├── dev/                ← Composes all app overlays for dev
│   ├── qa/
│   ├── stage/
│   └── prod/
└── platform/
    ├── openbao/            ← Secrets management
    └── external-secrets/   ← K8s secret sync
```

**Required cluster components** (install before bootstrapping):

| Component | Purpose | Install via |
|---|---|---|
| Traefik | Ingress controller | Helm |
| cert-manager | TLS certificates (Let's Encrypt) | Helm |
| ArgoCD | GitOps CD | Helm |
| OpenBao | Secrets management | ArgoCD Helm app |
| External Secrets Operator | K8s secret sync | ArgoCD Helm app |

---

## 11. Secrets Management (OpenBao)

OpenBao stores all secrets. External Secrets Operator syncs them into Kubernetes Secrets.

### Secret layout in OpenBao

```
kv/
├── core-api/
│   ├── dev/
│   │   ├── DJANGO_SECRET_KEY
│   │   ├── POSTGRES_PASSWORD
│   │   ├── POSTGRES_USER
│   │   ├── POSTGRES_DB
│   │   ├── CELERY_FLOWER_USER
│   │   ├── CELERY_FLOWER_PASSWORD
│   │   └── SENTRY_DSN
│   ├── qa/
│   ├── stage/
│   └── prod/
└── ghcr/
    ├── dev/
    │   └── dockerconfigjson   ← base64 docker pull config
    ├── qa/
    ├── stage/
    └── prod/
```

### Setting secrets

```bash
# Connect to OpenBao (port-forward if needed)
kubectl port-forward -n openbao svc/openbao 8200:8200 &

# Set API secrets for dev
bao kv put kv/core-api/dev \
  DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(50))')" \
  POSTGRES_USER="myapp" \
  POSTGRES_PASSWORD="$(openssl rand -base64 24)" \
  POSTGRES_DB="myapp" \
  CELERY_FLOWER_USER="admin" \
  CELERY_FLOWER_PASSWORD="$(openssl rand -base64 16)" \
  SENTRY_DSN=""

# Set GHCR pull secret
bao kv put kv/ghcr/dev \
  dockerconfigjson="$(cat ~/.docker/config.json | base64 -w0)"
```

### OpenBao initial setup

See `infra/README.md` for the full OpenBao initialization and Kubernetes auth configuration sequence.

---

## 12. Kubernetes Cluster Setup

### Cluster requirements

- Kubernetes 1.29+ (any provider: Hetzner, DigitalOcean, AWS EKS, GKE, bare metal, etc.)
- A StorageClass that supports `ReadWriteOnce` (most cloud providers have this by default)
- A LoadBalancer or NodePort for Traefik
- DNS control over your domain

### Step 1 — Install Traefik

```bash
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik \
  --namespace traefik --create-namespace \
  --set ports.websecure.tls.enabled=true
```

Point your DNS wildcard (`*.example.com`) to the Traefik LoadBalancer IP.

### Step 2 — Install cert-manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set installCRDs=true
```

Create a ClusterIssuer for Let's Encrypt:

```yaml
# apply this after cert-manager is running
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: admin@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: traefik
```

### Step 3 — Install ArgoCD

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd \
  --namespace argocd --create-namespace
```

Get the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Access the UI:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Then open https://localhost:8080
```

Change the admin password immediately:

```bash
argocd login localhost:8080 --username admin --password <initial-password>
argocd account update-password
```

---

## 13. GitOps Bootstrap (ArgoCD)

Once ArgoCD is installed, a single `kubectl apply` command bootstraps the entire cluster.

### Step 1 — Add your repo to ArgoCD

```bash
# Add SSH deploy key to GitHub first, then:
argocd repo add git@github.com:my-org/myapp-monorepo.git \
  --ssh-private-key-path ~/.ssh/id_ed25519
```

### Step 2 — Update cluster manifests

Edit all `clusters/your-cluster/*.yaml` files and replace the `repoURL`:

```yaml
repoURL: git@github.com:my-org/myapp-monorepo.git  # ← your repo
```

> **Note:** If you ran `./tooling/scripts/init.sh`, this was done automatically.

### Step 3 — Apply the root application

```bash
kubectl apply -f clusters/your-cluster/root-app.yaml
```

ArgoCD will now:
1. Sync `clusters/your-cluster/` to discover child Applications
2. Install OpenBao and External Secrets Operator via Helm
3. Deploy all environments (dev, qa, stage, prod)
4. Keep everything in sync on every git push to `main`

### Step 4 — Initialize OpenBao

After OpenBao is running (see `infra/README.md`):
1. Initialize and unseal OpenBao
2. Configure Kubernetes auth
3. Populate secrets using the `bao kv put` commands from Section 11

Once secrets are in OpenBao, the External Secrets Operator will create the Kubernetes Secrets, and the pods will be able to start.

---

## 14. CI/CD (GitHub Actions + GHCR)

### How it works

Builds are triggered **manually** via `workflow_dispatch` in GitHub Actions. ArgoCD watches for new images.

### GitHub Actions workflows

| Workflow | File | What it builds |
|---|---|---|
| Apps API Images | `.github/workflows/apps-api-build.yml` | django, celeryworker, celerybeat, flower |
| Apps Web Image | `.github/workflows/apps-web-build.yml` | web (React + Nginx) |

### Image tagging strategy

| Environment | Tag |
|---|---|
| dev | `ghcr.io/my-org/django:dev-latest` |
| qa | `ghcr.io/my-org/django:qa-latest` |
| stage | `ghcr.io/my-org/django:stage-latest` |
| prod (git tag) | `ghcr.io/my-org/django:v1.2.3` |
| prod (no tag) | `ghcr.io/my-org/django:latest` |

### Triggering a build

1. Go to **Actions** tab in your GitHub repo
2. Select a workflow (e.g., "Apps API Images")
3. Click **Run workflow**
4. Choose environment (dev / qa / stage / prod / all)
5. Click **Run workflow**

ArgoCD Image Updater (if installed) will automatically detect new `dev-latest` / `qa-latest` images and update the Kustomize overlay, triggering a deployment.

### GHCR setup

The workflows use `GITHUB_TOKEN` automatically — no additional secrets needed for pushing to GHCR in the same organisation.

For pulling images in Kubernetes, create a GHCR pull secret:

```bash
# Create a GitHub PAT with read:packages scope, then:
bao kv put kv/ghcr/dev \
  dockerconfigjson="$(echo -n '{"auths":{"ghcr.io":{"auth":"'"$(echo -n "my-org:ghp_your_token" | base64)"'"}}}' | base64 -w0)"
```

---

## 15. Environment Reference

### Namespace layout

| Namespace | Purpose |
|---|---|
| `dev` | Development (auto-deployed on every build) |
| `qa` | Quality assurance |
| `stage` | Staging (production mirror) |
| `prod` | Production |
| `argocd` | GitOps control plane |
| `openbao` | Secrets manager |
| `external-secrets` | K8s secret sync |
| `cert-manager` | TLS automation |
| `traefik` | Ingress controller |

### What runs in each environment

| Component | dev | qa | stage | prod |
|---|---|---|---|---|
| core-api | ✓ | ✓ | ✓ | ✓ |
| web | ✓ | ✓ | ✓ | ✓ |
| ai-service | ✓ | ✓ | ✓ | ✓ |
| docs | — | — | — | ✓ |
| Mailpit | ✓ | ✓ | ✓ | — |
| Flower (Celery monitor) | ✓ | ✓ | ✓ | ✓ |

### Ingress / DNS convention

| Service | dev | prod |
|---|---|---|
| API | `api.dev.example.com` | `api.example.com` |
| Web | `app.dev.example.com` | `app.example.com` |
| Flower | `flower.dev.example.com` | `flower.example.com` |
| Mailpit | `mailpit.dev.example.com` | — |
| OpenBao | — | `openbao.example.com` |

---

## 16. Day-2 Operations

### Running Django migrations in Kubernetes

```bash
# One-off Django management command in a running pod
kubectl exec -n prod deploy/core-api -- python manage.py migrate

# Or use a job
kubectl run migrate --image=ghcr.io/my-org/django:latest \
  --namespace=prod \
  --restart=Never \
  --env-from=configmap/core-api-config \
  --env-from=secret/core-api-secrets \
  -- python manage.py migrate
```

### Scaling a deployment

```bash
kubectl scale deployment core-api --replicas=3 -n prod
```

For persistent scaling, update the `replicas:` field in the overlay's kustomization patch.

### Viewing logs

```bash
# Follow logs for core-api in prod
kubectl logs -f deploy/core-api -n prod

# All pods with a label
kubectl logs -f -l app=core-api -n prod

# Previous crashed container
kubectl logs deploy/core-api -n prod --previous
```

### Rolling back a deployment

```bash
# Roll back to previous revision
kubectl rollout undo deployment/core-api -n prod

# Roll back to a specific revision
kubectl rollout history deployment/core-api -n prod
kubectl rollout undo deployment/core-api -n prod --to-revision=3
```

Or revert the image tag in the Kustomize overlay and push — ArgoCD will self-heal.

### Creating a database backup

```bash
kubectl exec -n prod statefulsets/postgres -- \
  pg_dump -U myapp myapp > backup-$(date +%Y%m%d).sql
```

### Checking ArgoCD sync status

```bash
argocd app list
argocd app sync apps-prod
argocd app get apps-prod
```

### Resyncing a stuck ArgoCD application

```bash
argocd app sync apps-prod --force
argocd app terminate-op apps-prod  # If stuck in progress
```

---

## Development Workflow Summary

```bash
# Daily development cycle
make -C apps/core-api local-up          # Start backend
make -C apps/web dev                    # Start frontend (separate terminal)

# After changing OpenAPI spec
make contracts                          # Validate + regenerate clients
bunx nx affected -t test               # Test only what changed

# After code changes
bunx nx affected -t lint               # Lint affected projects
bunx nx affected -t test               # Test affected projects

# Before deploying
git push origin main
# → Trigger GitHub Actions workflow for the target environment
# → ArgoCD detects new image and deploys automatically
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes — keep diffs small and reviewable
3. Run `bunx nx affected -t lint test` before committing
4. Open a PR against `main`
5. Merge → deploy via GitHub Actions

---

*Generated from the [myapp-monorepo template](https://github.com/my-org/myapp-monorepo).*
