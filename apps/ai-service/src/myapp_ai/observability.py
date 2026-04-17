"""
OpenTelemetry + Arize Phoenix observability setup.

Configures tracing that is sent to a Phoenix collector via OTLP/gRPC.
Gracefully no-ops if Phoenix is disabled or the collector is unreachable.
"""

from __future__ import annotations

import logging

from myapp_ai.settings import settings

logger = logging.getLogger(__name__)


def init_observability() -> None:
    """
    Register the OpenTelemetry tracer provider and instrument Google ADK.

    Call this once at application startup (inside the FastAPI lifespan).
    """
    if not settings.phoenix_enabled:
        logger.info("Phoenix observability is disabled — skipping init")
        return

    try:
        from phoenix.otel import register

        tracer_provider = register(
            project_name=settings.phoenix_project_name,
            endpoint=settings.phoenix_collector_endpoint,
            batch=True,
        )
        logger.info(
            "Phoenix tracer registered → %s (project=%s)",
            settings.phoenix_collector_endpoint,
            settings.phoenix_project_name,
        )

        # Instrument Google ADK so all agent calls are traced
        try:
            from openinference.instrumentation.google_adk import (
                GoogleADKInstrumentor,
            )

            GoogleADKInstrumentor().instrument(tracer_provider=tracer_provider)
            logger.info("Google ADK instrumentation enabled")
        except ImportError:
            logger.warning(
                "openinference-instrumentation-google-adk not installed — "
                "ADK traces will not be captured"
            )

    except Exception:
        logger.exception(
            "Failed to initialize Phoenix observability — "
            "the service will continue without tracing"
        )
