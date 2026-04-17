"""
Environment-driven configuration for the AI service.

All settings are loaded from environment variables (or a `.env` file).
See `.env.example` for the full reference.
"""

from __future__ import annotations

from enum import Enum
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    LOCAL = "local"
    PRODUCTION = "production"


class ArtifactBackend(str, Enum):
    MEMORY = "memory"
    LOCAL = "local"
    S3 = "s3"
    GCS = "gcs"


class Settings(BaseSettings):
    """Central configuration — every field maps to an env var."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── General ──────────────────────────────────────────────────────────
    environment: Environment = Environment.LOCAL
    app_name: str = "ai-service"
    log_level: str = "DEBUG"
    host: str = "0.0.0.0"
    port: int = 8080

    # ── LLM ──────────────────────────────────────────────────────────────
    google_api_key: str = ""
    google_genai_use_vertexai: bool = False
    default_model: str = "gemini-2.0-flash"

    # ── Database (ADK Session / Memory persistence) ──────────────────────
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5433/ai_service"
    )

    # ── Artifact storage ─────────────────────────────────────────────────
    artifact_backend: ArtifactBackend = ArtifactBackend.LOCAL
    artifact_local_dir: Path = Path("./artifacts")
    artifact_s3_bucket: str = ""
    artifact_s3_endpoint: str = ""
    artifact_s3_region: str = ""
    artifact_s3_access_key: str = ""
    artifact_s3_secret_key: str = ""
    artifact_gcs_bucket: str = ""

    # ── Phoenix Observability ────────────────────────────────────────────
    phoenix_enabled: bool = True
    phoenix_collector_endpoint: str = "http://localhost:4317"
    phoenix_project_name: str = "ai-service"

    # ── Derived helpers ──────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.environment == Environment.PRODUCTION

    @property
    def uvicorn_reload(self) -> bool:
        return not self.is_production

    @property
    def uvicorn_workers(self) -> int:
        return 4 if self.is_production else 1


settings = Settings()
