"""Quality gate: ML score + hard-fail conditional edge."""

from __future__ import annotations

from blog_worker.config import settings
from blog_worker.pipeline.state import BlogPipelineState


def quality_gate(state: BlogPipelineState) -> str:
    """Decide whether to proceed or retry generation.

    Two-stage check:
    1. Hard-fail conditions (force retry regardless of score)
    2. Soft conditions (score-based)

    Returns:
        "generate" if quality check fails and retries < max
        "post_process" otherwise (including on error)
    """
    # Skip retries if upstream error exists
    if state.get("error"):
        return "post_process"

    generated = state.get("generated_content", {})
    if isinstance(generated, dict) and "error" in generated:
        return "post_process"

    score = state.get("ml_score", 0)
    retries = state.get("retry_count", 0)
    max_retries = settings.max_retries
    features = state.get("ml_breakdown", {})

    # Hard-fail conditions: force retry regardless of score
    if retries < max_retries:
        if features.get("placeholder_count", 0) > 0:
            return "generate"
        if features.get("citation_count", 0) < 2:
            return "generate"
        if features.get("duplicate_ratio", 0) > 0.3:
            return "generate"

    # Soft condition: score-based
    if score < settings.ml_quality_threshold and retries < max_retries:
        return "generate"

    return "post_process"
