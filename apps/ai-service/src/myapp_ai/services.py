"""
Service factories for ADK session, artifact, and memory services.

Each factory reads from `settings` to decide which concrete implementation
to instantiate, making the service layer cloud-agnostic and easy to swap.
"""

from __future__ import annotations

import logging

from google.adk.artifacts import BaseArtifactService, InMemoryArtifactService
from google.adk.memory import InMemoryMemoryService
from google.adk.sessions import DatabaseSessionService

from myapp_ai.settings import ArtifactBackend, settings

logger = logging.getLogger(__name__)


# ── Session Service ──────────────────────────────────────────────────────────


def create_session_service() -> DatabaseSessionService:
    """Always use PostgreSQL-backed sessions for persistence."""
    logger.info("Initializing DatabaseSessionService → %s", settings.database_url)
    return DatabaseSessionService(db_url=settings.database_url)


# ── Artifact Service ─────────────────────────────────────────────────────────


def create_artifact_service() -> BaseArtifactService:
    """Pick an artifact backend based on ARTIFACT_BACKEND env var."""
    backend = settings.artifact_backend

    if backend == ArtifactBackend.S3:
        try:
            from adk_extra_services.artifact_service import S3ArtifactService

            logger.info(
                "Initializing S3ArtifactService → bucket=%s",
                settings.artifact_s3_bucket,
            )
            return S3ArtifactService(
                bucket_name=settings.artifact_s3_bucket,
                endpoint_url=settings.artifact_s3_endpoint or None,
                region_name=settings.artifact_s3_region or None,
                aws_access_key_id=settings.artifact_s3_access_key or None,
                aws_secret_access_key=settings.artifact_s3_secret_key or None,
            )
        except ImportError:
            logger.warning(
                "adk-extra-services not installed; "
                "falling back to InMemoryArtifactService"
            )
            return InMemoryArtifactService()

    if backend == ArtifactBackend.GCS:
        try:
            from google.adk.artifacts import GcsArtifactService

            logger.info(
                "Initializing GcsArtifactService → bucket=%s",
                settings.artifact_gcs_bucket,
            )
            return GcsArtifactService(bucket=settings.artifact_gcs_bucket)
        except ImportError:
            logger.warning(
                "GcsArtifactService not available; "
                "falling back to InMemoryArtifactService"
            )
            return InMemoryArtifactService()

    if backend == ArtifactBackend.LOCAL:
        try:
            from adk_extra_services.artifact_service import LocalFolderArtifactService

            artifact_dir = settings.artifact_local_dir
            artifact_dir.mkdir(parents=True, exist_ok=True)
            logger.info(
                "Initializing LocalFolderArtifactService → %s", artifact_dir
            )
            return LocalFolderArtifactService(base_dir=str(artifact_dir))
        except ImportError:
            logger.warning(
                "adk-extra-services not installed; "
                "falling back to InMemoryArtifactService"
            )
            return InMemoryArtifactService()

    # Default: in-memory (good for quick experiments)
    logger.info("Initializing InMemoryArtifactService")
    return InMemoryArtifactService()


# ── Memory Service ───────────────────────────────────────────────────────────


def create_memory_service() -> InMemoryMemoryService:
    """
    Memory service for long-term agent memory.

    Default is in-memory. Swap for a persistent implementation
    (e.g. VertexAiRagMemoryService) when needed.
    """
    logger.info("Initializing InMemoryMemoryService")
    return InMemoryMemoryService()
