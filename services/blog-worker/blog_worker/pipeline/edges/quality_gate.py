"""Quality gate: ML score conditional edge."""

from __future__ import annotations

from blog_worker.config import settings
from blog_worker.pipeline.state import BlogPipelineState


def quality_gate(state: BlogPipelineState) -> str:
    """Decide whether to proceed or retry generation.

    Returns:
        "generate" if score < threshold and retries < max
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

    if score < settings.ml_quality_threshold and retries < settings.max_retries:
        return "generate"

    return "post_process"
