"""GSC-derived features for ML scoring."""

from __future__ import annotations

from blog_worker.db import get_supabase


async def get_gsc_features(category_slug: str, topic: str) -> dict[str, float]:
    """Fetch GSC-derived features for a category/topic."""
    db = get_supabase()

    # Category average metrics
    result = db.table("gsc_page_metrics").select(
        "clicks, impressions, ctr, position"
    ).like("page_path", f"/posts/{category_slug}%").execute()

    rows = result.data or []
    if not rows:
        return {
            "category_avg_clicks": 0,
            "category_avg_ctr": 0,
            "category_avg_position": 50,
            "similar_topic_max_clicks": 0,
            "similar_topic_best_position": 50,
            "site_7day_trend": 0,
        }

    avg_clicks = sum(r["clicks"] for r in rows) / len(rows)
    avg_ctr = sum(r["ctr"] for r in rows) / len(rows)
    avg_position = sum(r["position"] for r in rows) / len(rows)

    return {
        "category_avg_clicks": avg_clicks,
        "category_avg_ctr": avg_ctr,
        "category_avg_position": avg_position,
        "similar_topic_max_clicks": max((r["clicks"] for r in rows), default=0),
        "similar_topic_best_position": min((r["position"] for r in rows), default=50),
        "site_7day_trend": 0,
    }
