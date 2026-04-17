"""
Agent registry.

Import and register all agents here. The `AGENTS` dict is consumed by the
FastAPI application to create runners for each agent.
"""

from myapp_ai.agents.hello import AGENT_NAME as hello_name
from myapp_ai.agents.hello import agent as hello_agent

# ── Registry ─────────────────────────────────────────────────────────────────
# Add new agents here: "agent-name" → agent instance
AGENTS = {
    hello_name: hello_agent,
}
