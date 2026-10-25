import os
import json
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_anthropic_client():
    api_key = settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        import anthropic
        return anthropic.Anthropic(api_key=api_key)
    except Exception as e:
        logger.warning(f"Could not initialize Anthropic client: {e}")
        return None

def call_claude_json(system_prompt: str, user_prompt: str, max_tokens: int = 8192) -> Optional[Dict[str, Any]]:
    client = get_anthropic_client()
    if not client:
        return None

    model_name = settings.ANTHROPIC_MODEL or os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5")
    
    # Supported fallbacks if configured model name is unavailable
    models_to_try = [
        model_name,
        "claude-haiku-5-5",
        "claude-sonnet-4-5-20250929",
        "claude-3-5-haiku-20241022",
        "claude-3-5-sonnet-20241022"
    ]
    # Deduplicate while preserving order
    seen = set()
    ordered_models = []
    for m in models_to_try:
        if m and m not in seen:
            seen.add(m)
            ordered_models.append(m)

    response = None
    last_err = None

    for m in ordered_models:
        try:
            response = client.messages.create(
                model=m,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            if response:
                break
        except Exception as e:
            last_err = e
            logger.warning(f"Claude model {m} call failed: {e}")
            continue

    if not response:
        logger.error(f"All Claude API models failed: {last_err}")
        return None

    # Concatenate all text content blocks
    raw_text = "".join(
        block.text for block in response.content if getattr(block, "type", "") == "text" or hasattr(block, "text")
    ).strip()

    # Extract JSON between outer brackets
    start_idx = raw_text.find("{")
    end_idx = raw_text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        raw_text = raw_text[start_idx : end_idx + 1]

    try:
        return json.loads(raw_text, strict=False)
    except Exception as parse_err:
        logger.error(f"Failed to parse Claude JSON response: {parse_err}. Raw text: {raw_text[:300]}")
        return None


def call_claude_text(system_prompt: str, user_prompt: str, max_tokens: int = 2048) -> Optional[str]:
    client = get_anthropic_client()
    if not client:
        return None

    model_name = settings.ANTHROPIC_MODEL or os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5")
    try:
        response = client.messages.create(
            model=model_name,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return "".join(
            block.text for block in response.content if getattr(block, "type", "") == "text" or hasattr(block, "text")
        ).strip()
    except Exception as e:
        logger.error(f"Claude text call failed: {e}")
        return None
