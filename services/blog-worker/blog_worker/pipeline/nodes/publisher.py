"""Publisher node: Publish post + Slack notification."""

from __future__ import annotations

import sys
from datetime import datetime, timezone

from blog_worker.db import get_supabase, update_job_status
from blog_worker.pipeline.state import BlogPipelineState
from blog_worker.slack.notifier import notify_complete


async def publish_node(state: BlogPipelineState) -> BlogPipelineState:
    """Publish the generated blog post.

    - Mark post as published in Supabase
    - Update blog_jobs with final status
    - Send Slack completion notification
    """
    db = get_supabase()
    post_id = state.get("post_id")
    slug = state.get("slug", "")

    if post_id:
        db.table("posts").update({
            "status": "published",
            "published_at": datetime.now(tz=timezone.utc).isoformat(),
        }).eq("id", post_id).execute()
        sys.stdout.write(f"Published post: id={post_id}, slug={slug}\n")

    # Update job status
    job_id = state.get("job_id", "")
    if job_id:
        await update_job_status(
            job_id,
            status="completed",
            progress_pct=100,
            current_step="publish",
            post_id=post_id,
        )

    # Slack notification
    topic = state.get("topic", "")
    ml_score = state.get("ml_score", 0)
    post_url = f"https://nands.tech/posts/{slug}" if slug else ""
    try:
        await notify_complete(topic=topic, post_url=post_url, ml_score=ml_score)
    except Exception as e:
        sys.stdout.write(f"Slack notification failed (non-fatal): {e}\n")

    return {**state}
