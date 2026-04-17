"""
FastAPI application entry point for the AI service.

This module wires together the ADK agent runners, services, and observability.
Run with:  uvicorn src.myapp_ai.app:app --reload --port 8080
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google.adk.runners import Runner

from myapp_ai.agents import AGENTS
from myapp_ai.observability import init_observability
from myapp_ai.services import (
    create_artifact_service,
    create_memory_service,
    create_session_service,
)
from myapp_ai.settings import settings

logger = logging.getLogger(__name__)

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

# ── Global runners (initialized during lifespan) ────────────────────────────

_runners: dict[str, Runner] = {}


# ── Lifespan ─────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup / shutdown lifecycle."""
    logger.info("Starting %s (env=%s)", settings.app_name, settings.environment.value)

    # 1. Observability (Phoenix + OTEL)
    init_observability()

    # 2. Shared services
    session_service = create_session_service()
    artifact_service = create_artifact_service()
    memory_service = create_memory_service()

    # 3. Create a Runner per agent
    for agent_name, agent in AGENTS.items():
        runner = Runner(
            agent=agent,
            app_name=settings.app_name,
            session_service=session_service,
            artifact_service=artifact_service,
            memory_service=memory_service,
        )
        _runners[agent_name] = runner
        logger.info("Registered agent runner: %s", agent_name)

    logger.info(
        "%s ready — %d agent(s) loaded", settings.app_name, len(_runners)
    )

    yield  # ← application is running

    logger.info("Shutting down %s", settings.app_name)


# ── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs" if not settings.is_production else None,
    redoc_url="/api/redoc" if not settings.is_production else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not settings.is_production else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health checks ────────────────────────────────────────────────────────────


@app.get("/healthz")
async def healthz() -> dict:
    """Liveness probe."""
    return {"status": "ok"}


@app.get("/readyz")
async def readyz() -> dict:
    """Readiness probe — checks that runners are initialized."""
    if not _runners:
        raise HTTPException(status_code=503, detail="No agent runners loaded")
    return {"status": "ready", "agents": list(_runners.keys())}


# ── Agent endpoints ──────────────────────────────────────────────────────────


class RunRequest(BaseModel):
    """Request body for the /run endpoint."""

    agent_name: str = "hello-agent"
    user_id: str = "user"
    session_id: str | None = None
    message: str


class RunResponse(BaseModel):
    """Response body for the /run endpoint."""

    session_id: str
    response: str


@app.get("/agents")
async def list_agents() -> dict:
    """List all registered agents."""
    return {"agents": list(_runners.keys())}


@app.post("/run", response_model=RunResponse)
async def run_agent(req: RunRequest) -> RunResponse:
    """
    Send a message to an agent and get a response.

    If `session_id` is omitted, a new session is created automatically.
    """
    runner = _runners.get(req.agent_name)
    if runner is None:
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{req.agent_name}' not found. "
            f"Available: {list(_runners.keys())}",
        )

    # Create or reuse session
    session_service = runner.session_service
    if req.session_id:
        session = await session_service.get_session(
            app_name=settings.app_name,
            user_id=req.user_id,
            session_id=req.session_id,
        )
        if session is None:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{req.session_id}' not found",
            )
    else:
        session = await session_service.create_session(
            app_name=settings.app_name,
            user_id=req.user_id,
        )

    # Build user message content
    from google.genai import types

    user_content = types.Content(
        role="user",
        parts=[types.Part.from_text(text=req.message)],
    )

    # Run agent and collect response
    final_text_parts: list[str] = []
    async for event in runner.run_async(
        user_id=req.user_id,
        session_id=session.id,
        new_message=user_content,
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    final_text_parts.append(part.text)

    return RunResponse(
        session_id=session.id,
        response="".join(final_text_parts) if final_text_parts else "(no response)",
    )
