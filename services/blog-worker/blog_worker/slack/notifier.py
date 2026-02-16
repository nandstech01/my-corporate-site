"""Slack notification helpers."""

from __future__ import annotations

import httpx

from blog_worker.config import settings


async def _send_slack_message(text: str, thread_ts: str | None = None) -> None:
    """Send a message to Slack."""
    if not settings.slack_bot_token:
        print(f"[Slack disabled] {text}")
        return

    payload: dict = {
        "channel": settings.slack_default_channel,
        "text": text,
    }
    if thread_ts:
        payload["thread_ts"] = thread_ts

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://slack.com/api/chat.postMessage",
            json=payload,
            headers={"Authorization": f"Bearer {settings.slack_bot_token}"},
        )


async def notify_progress(job_id: str, step: str, pct: int) -> None:
    """Notify pipeline progress."""
    await _send_slack_message(f":gear: Blog pipeline [{pct}%] {step} (job: {job_id[:8]})")


async def notify_complete(job_id: str, state: dict) -> None:
    """Notify pipeline completion."""
    title = state.get("generated_content", {}).get("title", "Unknown")
    score = state.get("ml_score", 0)
    post_id = state.get("post_id", "N/A")
    await _send_slack_message(
        f":white_check_mark: Blog generated!\n"
        f"*{title}*\n"
        f"ML Score: {score:.1f} | Post ID: {post_id}\n"
        f"Job: {job_id[:8]}"
    )


async def notify_error(job_id: str, error: str) -> None:
    """Notify pipeline error."""
    await _send_slack_message(
        f":x: Blog pipeline failed!\n"
        f"Job: {job_id[:8]}\n"
        f"Error: {error[:500]}"
    )


async def notify_ml_retrain(sample_count: int, results: dict) -> None:
    """Notify ML retraining results."""
    await _send_slack_message(
        f":brain: ML Retrain complete\n"
        f"Samples: {sample_count}\n"
        f"Results: {results}"
    )
