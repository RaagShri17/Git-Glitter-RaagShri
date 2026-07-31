"""
Shared Anthropic (Claude) API client — used by both `chatbot_interface.py`
(Flora's conversation + PDF-summary voice) and `pdf_interface.py` (structured
topic/date extraction from uploaded syllabi).

Configuration (see app/config.py / .env.example):
    ANTHROPIC_API_KEY        — required to enable real LLM calls
    STUDIORA_ANTHROPIC_MODEL — defaults to "claude-sonnet-5"

If no API key is configured, or a call fails for any reason (network,
rate limit, bad response), `call_claude` returns None. Callers are expected
to fall back to a heuristic/stub response in that case, so the rest of the
API keeps working end-to-end for demos without a key.
"""
from typing import Dict, List, Optional

from app.config import settings

try:
    import anthropic
except ImportError:  # pragma: no cover - only hit if the package isn't installed
    anthropic = None

_client = None


def is_configured() -> bool:
    """True if a real Claude backend is reachable."""
    return bool(settings.ANTHROPIC_API_KEY) and anthropic is not None


def _get_client():
    global _client
    if _client is None and is_configured():
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def call_claude(
    system: str,
    messages: List[Dict[str, str]],
    max_tokens: int = 1024,
) -> Optional[str]:
    """
    Send a system prompt + message list to Claude and return the reply text.

    `messages` follows the Anthropic Messages API shape:
        [{"role": "user"|"assistant", "content": "..."}, ...]

    Returns None (never raises) if no key is configured or the call fails,
    so callers can fall back gracefully.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        response = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
        )
        return "".join(
            block.text for block in response.content if getattr(block, "type", None) == "text"
        ).strip()
    except Exception as exc:  # noqa: BLE001 - we want *any* failure to degrade gracefully
        print(f"[llm_client] Anthropic API call failed: {exc}")
        return None
