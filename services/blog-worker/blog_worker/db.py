"""Supabase client wrapper."""

from supabase import create_client, Client

from blog_worker.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _client


async def update_job_status(
    job_id: str,
    *,
    status: str | None = None,
    current_step: str | None = None,
    progress_pct: int | None = None,
    error_message: str | None = None,
    ml_score: float | None = None,
    ml_breakdown: dict | None = None,
    post_id: int | None = None,
) -> None:
    updates: dict = {}
    if status is not None:
        updates["status"] = status
    if current_step is not None:
        updates["current_step"] = current_step
    if progress_pct is not None:
        updates["progress_pct"] = progress_pct
    if error_message is not None:
        updates["error_message"] = error_message
    if ml_score is not None:
        updates["ml_score"] = ml_score
    if ml_breakdown is not None:
        updates["ml_breakdown"] = ml_breakdown
    if post_id is not None:
        updates["post_id"] = post_id

    if updates:
        get_supabase().table("blog_jobs").update(updates).eq("id", job_id).execute()
