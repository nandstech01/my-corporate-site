"""Publisher node: Save to Supabase + Slack notification."""

from __future__ import annotations

from blog_worker.db import get_supabase, update_job_status
from blog_worker.pipeline.state import BlogPipelineState
from blog_worker.slack.notifier import notify_complete


async def publish_node(state: BlogPipelineState) -> BlogPipelineState:
    """Publish the generated blog post.

    - Update post content in Supabase
    - Update blog_jobs with final status
    - Send Slack completion notification
    """
    db = get_supabase()
    content = state.get("generated_content", {})
    post_id = state.get("post_id")

    if post_id:
        # Update post with enhanced content
        db.table("posts").update({
            "content": content.get("content", ""),
            "published": True,
        }).eq("id", post_id).execute()

    return {**state}
