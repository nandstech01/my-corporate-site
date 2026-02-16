"""14-day post labeling with GSC performance data."""

from __future__ import annotations

from datetime import datetime, timedelta

from blog_worker.db import get_supabase
from blog_worker.ml.feature_engineering import extract_features


async def label_published_posts() -> None:
    """Label posts 14 days after publication with GSC performance.

    combined_score = clicks*0.4 + impressions*0.3 + ctr*0.2 + (100-position)*0.1

    Only labels posts that haven't been labeled yet.
    """
    db = get_supabase()

    # Find posts published ~14 days ago that haven't been labeled
    target_date = (datetime.utcnow() - timedelta(days=14)).strftime("%Y-%m-%d")
    window_start = (datetime.utcnow() - timedelta(days=17)).strftime("%Y-%m-%d")

    # Get completed blog jobs in the window
    result = (
        db.table("blog_jobs")
        .select("id, post_id, topic, target_keyword, category_slug")
        .eq("status", "completed")
        .not_.is_("post_id", "null")
        .gte("completed_at", f"{window_start}T00:00:00Z")
        .lte("completed_at", f"{target_date}T23:59:59Z")
        .execute()
    )

    jobs = result.data or []
    if not jobs:
        print("No posts to label in the 14-day window.")
        return

    labeled_count = 0
    for job in jobs:
        post_id = job["post_id"]

        # Check if already labeled
        existing = (
            db.table("blog_ml_training_data")
            .select("id")
            .eq("post_id", post_id)
            .execute()
        )
        if existing.data:
            continue

        # Get the post content
        post_result = (
            db.table("posts")
            .select("title, content, slug, meta_description, meta_keywords")
            .eq("id", post_id)
            .single()
            .execute()
        )

        if not post_result.data:
            continue

        post = post_result.data
        slug = post.get("slug", "")

        # Get GSC data for this post (aggregate over 14 days)
        page_path = f"/posts/{slug}"
        gsc_result = (
            db.table("gsc_page_metrics")
            .select("clicks, impressions, ctr, position")
            .eq("page_path", page_path)
            .execute()
        )

        gsc_rows = gsc_result.data or []

        if not gsc_rows:
            # No GSC data yet - skip
            continue

        # Aggregate GSC metrics
        total_clicks = sum(r.get("clicks", 0) for r in gsc_rows)
        total_impressions = sum(r.get("impressions", 0) for r in gsc_rows)
        avg_ctr = (
            sum(r.get("ctr", 0) for r in gsc_rows) / len(gsc_rows) if gsc_rows else 0
        )
        avg_position = (
            sum(r.get("position", 0) for r in gsc_rows) / len(gsc_rows)
            if gsc_rows
            else 50
        )

        # Calculate combined score
        # Normalize: clicks max ~100, impressions max ~1000, ctr max 1.0, position 1-100
        seo_score = (
            min(total_clicks, 100) * 0.4
            + min(total_impressions / 10, 100) * 0.3
            + avg_ctr * 100 * 0.2
            + max(0, 100 - avg_position) * 0.1
        )
        seo_score = max(0, min(100, seo_score))

        # AIO score (based on structured data quality)
        aio_score = 50.0  # Default - would need AI citation tracking

        combined_score = seo_score * 0.6 + aio_score * 0.4

        # Extract features
        content = post.get("content", "")
        title = post.get("title", "")
        meta_desc = post.get("meta_description", "")
        target_keyword = job.get("target_keyword", "")
        seo_keywords = post.get("meta_keywords", []) or []

        features = extract_features(
            content=content,
            title=title,
            meta_description=meta_desc,
            target_keyword=target_keyword,
            seo_keywords=seo_keywords if isinstance(seo_keywords, list) else [],
        )

        # Insert training data
        try:
            db.table("blog_ml_training_data").insert(
                {
                    "post_id": post_id,
                    "post_slug": slug,
                    "features": features,
                    "seo_score": seo_score,
                    "aio_score": aio_score,
                    "combined_score": combined_score,
                    "labeled_at": datetime.utcnow().isoformat(),
                }
            ).execute()
            labeled_count += 1
        except Exception as e:
            print(f"Error labeling post {post_id}: {e}")

    print(f"Labeled {labeled_count} posts.")
