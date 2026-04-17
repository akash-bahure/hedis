# ai-service

AI agent service powered by [Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/).

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  ai-service                      │
│                                                  │
│  FastAPI (Uvicorn)                               │
│  ├── POST /run         → Agent invocation        │
│  ├── GET  /agents      → List agents             │
│  ├── GET  /healthz     → Liveness probe          │
│  └── GET  /readyz      → Readiness probe         │
│                                                  │
│  ADK Runner                                      │
│  ├── DatabaseSessionService (PostgreSQL)         │
│  ├── ArtifactService    (S3 / GCS / Local / Mem) │
│  └── MemoryService      (In-memory)              │
│                                                  │
│  Phoenix Observability (OTLP/gRPC)               │
└──────────┬──────────────┬───────────────────────┘
           │              │
    ┌──────▼──────┐ ┌─────▼──────┐
    │ PostgreSQL  │ │   Phoenix  │
    │ (Sessions)  │ │ (Tracing)  │
    └─────────────┘ └────────────┘
```

## Quick Start — Local Development

### Step 1 — Install Python dependencies

```bash
cd apps/ai-service
make install
```

### Step 2 — Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set GOOGLE_API_KEY
```

### Step 3 — Start infrastructure (PostgreSQL + Phoenix)

```bash
make dev-infra
```

Services available:
- PostgreSQL: `localhost:5433` (ADK session store)
- Phoenix UI: http://localhost:6006
- Phoenix OTLP: `localhost:4317`

### Step 4 — Start the dev server

```bash
make dev
```

Or use the all-in-one command:

```bash
make dev-all    # starts infra + dev server
```

API available at: http://localhost:8080
- Swagger UI: http://localhost:8080/api/docs
- Health check: http://localhost:8080/healthz

### Step 5 — Test the agent

```bash
curl -X POST http://localhost:8080/run \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! What time is it?"}'
```

## Project Structure

```
apps/ai-service/
├── src/myapp_ai/
│   ├── __init__.py
│   ├── app.py              # FastAPI entry point
│   ├── settings.py          # Pydantic BaseSettings
│   ├── services.py          # Session/Artifact/Memory factories
│   ├── observability.py     # Phoenix + OpenTelemetry setup
│   └── agents/
│       ├── __init__.py      # Agent registry
│       └── hello/           # Example agent
│           ├── __init__.py
│           └── agent.py     # LlmAgent + tools
├── tests/
├── .env.example             # Environment variable template
├── docker-compose.local.yml # Local dev infrastructure
├── Dockerfile               # Multi-stage production build
├── Makefile                 # Development commands
├── project.json             # Nx project config
└── pyproject.toml           # Python dependencies (UV)
```

## Adding a New Agent

1. **Create a new directory:**

```bash
mkdir -p src/myapp_ai/agents/my_agent
```

2. **Create the agent file** (`src/myapp_ai/agents/my_agent/agent.py`):

```python
from google.adk.agents import LlmAgent
from myapp_ai.settings import settings

AGENT_NAME = "my-agent"

def my_tool(query: str) -> str:
    """Describe what this tool does."""
    return f"Result for: {query}"

agent = LlmAgent(
    name=AGENT_NAME,
    model=settings.default_model,
    instruction="You are a helpful assistant that...",
    tools=[my_tool],
)
```

3. **Export from `__init__.py`:**

```python
# src/myapp_ai/agents/my_agent/__init__.py
from myapp_ai.agents.my_agent.agent import AGENT_NAME, agent
__all__ = ["AGENT_NAME", "agent"]
```

4. **Register in the agent registry** (`src/myapp_ai/agents/__init__.py`):

```python
from myapp_ai.agents.my_agent import AGENT_NAME as my_name, agent as my_agent

AGENTS = {
    # ... existing agents ...
    my_name: my_agent,
}
```

## Configuration Reference

| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `local` | `local` or `production` |
| `GOOGLE_API_KEY` | — | Gemini API key |
| `DEFAULT_MODEL` | `gemini-2.0-flash` | LLM model name |
| `DATABASE_URL` | `postgresql+asyncpg://...localhost:5433/ai_service` | PostgreSQL connection (async) |
| `ARTIFACT_BACKEND` | `local` | `memory`, `local`, `s3`, or `gcs` |
| `ARTIFACT_LOCAL_DIR` | `./artifacts` | Local artifact directory |
| `ARTIFACT_S3_BUCKET` | — | S3 bucket name |
| `ARTIFACT_S3_ENDPOINT` | — | S3 endpoint (for MinIO, DO Spaces, etc.) |
| `PHOENIX_ENABLED` | `true` | Enable/disable Phoenix tracing |
| `PHOENIX_COLLECTOR_ENDPOINT` | `http://localhost:4317` | OTLP gRPC endpoint |
| `LOG_LEVEL` | `DEBUG` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |

See `.env.example` for the complete reference with documentation.

## Artifact Storage Backends

| Backend | Use case | Env vars needed |
|---|---|---|
| `memory` | Quick experiments, tests | — |
| `local` | Local development | `ARTIFACT_LOCAL_DIR` |
| `s3` | Production (AWS, MinIO, DO Spaces, Wasabi) | `ARTIFACT_S3_BUCKET`, `ARTIFACT_S3_ENDPOINT`, etc. |
| `gcs` | Production (Google Cloud) | `ARTIFACT_GCS_BUCKET` |

## Observability (Phoenix)

Phoenix provides tracing for all LLM and agent interactions:

- **Local**: Runs as a Docker container via `make dev-infra`
- **Phoenix UI**: http://localhost:6006 — explore traces, spans, latency
- **Production**: Deploy Phoenix separately and point `PHOENIX_COLLECTOR_ENDPOINT` to it
- **Disabled**: Set `PHOENIX_ENABLED=false` — the service works fine without it

## Makefile Commands

| Command | Description |
|---|---|
| `make install` | Install Python dependencies via UV |
| `make dev` | Start dev server (hot reload on port 8080) |
| `make dev-infra` | Start PostgreSQL + Phoenix containers |
| `make dev-all` | Start infra + dev server (one command) |
| `make dev-infra-down` | Stop infrastructure containers |
| `make dev-infra-prune` | Stop infra and destroy volumes |
| `make lint` | Run ruff linter + format check |
| `make format` | Auto-format code with ruff |
| `make test` | Run pytest |
| `make docker-build` | Build production Docker image |
| `make clean` | Remove caches and build artifacts |

## Production Deployment

The service is deployed to Kubernetes via ArgoCD. See:

- `infra/k8s/apps/ai-service/` — Kustomize manifests
- `infra/k8s/apps/ai-service/overlays/{dev,qa,stage,prod}/` — Environment-specific config

### OpenBao secrets to configure:

```bash
bao kv put kv/ai-service/dev \
  GOOGLE_API_KEY="your-api-key" \
  POSTGRES_PASSWORD="your-db-password" \
  ARTIFACT_S3_BUCKET="your-bucket" \
  ARTIFACT_S3_ENDPOINT="https://s3.amazonaws.com" \
  ARTIFACT_S3_ACCESS_KEY="your-access-key" \
  ARTIFACT_S3_SECRET_KEY="your-secret-key"
```

Port: `8080`
