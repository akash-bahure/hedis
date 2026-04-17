"""
Hello Agent — Example ADK Agent.

This is a starter agent that demonstrates the core ADK patterns:
- LlmAgent definition with model, instruction, and tools
- Function tools with type hints and docstrings
- How to register the agent in the agents package

To create a new agent:
1. Copy this directory to `agents/your_agent/`
2. Update the agent definition below
3. Register it in `agents/__init__.py`
"""

from __future__ import annotations

from google.adk.agents import LlmAgent

from myapp_ai.settings import settings

AGENT_NAME = "hello-agent"


# ── Tools ────────────────────────────────────────────────────────────────────


def greet(name: str) -> str:
    """Greet a user by name.

    Args:
        name: The name of the person to greet.

    Returns:
        A friendly greeting message.
    """
    return f"Hello, {name}! Welcome to {settings.app_name}."


def get_current_time() -> str:
    """Get the current server time.

    Returns:
        The current date and time as an ISO 8601 string.
    """
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


# ── Agent Definition ─────────────────────────────────────────────────────────

agent = LlmAgent(
    name=AGENT_NAME,
    model=settings.default_model,
    instruction=(
        "You are a helpful assistant. You can greet users by name and "
        "tell them the current time. Be friendly and concise."
    ),
    tools=[greet, get_current_time],
)
