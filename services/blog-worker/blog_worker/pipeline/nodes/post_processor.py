"""Post-processor node: HTTP bridge to Vercel /api/blog-post-process."""

from __future__ import annotations

import httpx

from blog_worker.config import settings
from blog_worker.pipeline.state import BlogPipelineState


async def post_process_node(state: BlogPipelineState) -> BlogPipelineState:
    """Call Vercel post-processing API.

    HTTP POST to https://nands.tech/api/blog-post-process with:
    - postId, content, slug, categorySlug, topic, targetKeyword, seoKeywords
    - enableH2Diagrams flag
    Timeout: 300s (Vercel Pro limit, post-processing takes ~120s)
    """
    content = state.get("generated_content", {})
    payload = {
        "postId": state.get("post_id"),
        "content": content.get("content", ""),
        "slug": state.get("slug", ""),
        "categorySlug": state["category_slug"],
        "topic": state["topic"],
        "targetKeyword": state["target_keyword"],
        "seoKeywords": content.get("seo_keywords", []),
        "enableH2Diagrams": True,
    }

    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.post(
            f"{settings.vercel_api_base}/api/blog-post-process",
            json=payload,
            headers={"Authorization": f"Bearer {settings.vercel_api_secret}"},
        )
        resp.raise_for_status()
        result = resp.json()

    return {
        **state,
        "fragment_ids": result.get("fragmentIds", []),
        "structured_data": result.get("structuredData", {}),
        "ai_enhanced_data": result.get("aiEnhancedData", {}),
    }
