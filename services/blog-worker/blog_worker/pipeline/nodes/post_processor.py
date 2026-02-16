"""Post-processor node: Create post in Supabase + HTTP bridge to Vercel."""

from __future__ import annotations

import re
import sys
from datetime import datetime, timezone

import httpx

from blog_worker.config import settings
from blog_worker.db import get_supabase, update_job_status
from blog_worker.pipeline.state import BlogPipelineState

# Category auto-selection: keyword patterns -> category slug
_CATEGORY_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"python|プログラミング|コード|開発環境|IDE", re.I), "programming"),
    (re.compile(r"chatgpt|gpt-[45]|openai チャット|gpt活用", re.I), "chatgpt-usage"),
    (re.compile(r"転職|キャリア|エージェント|求人|就職|リスキリング", re.I), "career-change"),
    (re.compile(r"副業|フリーランス|稼ぐ|収入|個人", re.I), "ai-sidejob-skills"),
    (re.compile(r"ニュース|速報|発表|リリース|最新|トレンド|新機能", re.I), "ai-news"),
    (re.compile(r"ツール|アプリ|サービス|おすすめ|比較|ランキング", re.I), "ai-tools"),
    (re.compile(r"基礎|入門|初心者|始め方|わかりやすく", re.I), "ai-basics"),
    (re.compile(r"データ分析|pandas|統計|可視化|BI", re.I), "data-analysis"),
    (re.compile(r"資格|認定|試験|合格", re.I), "certifications"),
    (re.compile(r"実践|ハンズオン|作り方|構築|プロジェクト", re.I), "practical-projects"),
    (re.compile(r"seo|マーケティング|集客|広告|コンテンツ", re.I), "seo-writing"),
    (re.compile(r"動画|youtube|映像|ショート", re.I), "ai-short-video"),
    (re.compile(r"画像生成|midjourney|stable diffusion|dall-e", re.I), "image-video-generation"),
]


def _slugify(text: str) -> str:
    """Generate a URL-safe slug from heading text."""
    import hashlib

    ascii_part = re.sub(r"[^\x00-\x7F]", "", text).strip()
    slug = re.sub(r"[^\w\s-]", "", ascii_part.lower()).strip()
    slug = re.sub(r"\s+", "-", slug).strip("-")[:40]
    if not slug:
        words = re.findall(r"[A-Za-z0-9]+", text)
        slug = "-".join(words[:3]).lower() if words else ""
    if not slug:
        # Hash-based fallback for pure-Japanese headings
        slug = "s-" + hashlib.md5(text.encode()).hexdigest()[:8]
    return slug


def _add_fragment_ids(content: str) -> str:
    """Auto-add {#fragment-id} to H2/H3 headings."""
    counter = {"faq": 0}
    seen_slugs: set[str] = set()

    def replacer(match: re.Match) -> str:
        hashes = match.group(1)
        text = match.group(2).strip()
        # Skip if fragment ID already exists
        if re.search(r"\{#[^}]+\}$", text):
            return match.group(0)
        if re.search(r"Q:|質問", text):
            counter["faq"] += 1
            return f"{hashes} {text} {{#faq-{counter['faq']}}}"
        slug = _slugify(text)
        # Ensure uniqueness
        base_slug = slug
        suffix = 2
        while slug in seen_slugs:
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        seen_slugs.add(slug)
        return f"{hashes} {text} {{#{slug}}}"

    return re.sub(r"^(#{2,3})\s+(.+)$", replacer, content, flags=re.MULTILINE)


def _auto_select_category(topic: str, target_keyword: str) -> str:
    """Auto-select the best category slug based on topic and keyword."""
    text = f"{topic} {target_keyword}"
    for pattern, slug in _CATEGORY_RULES:
        if pattern.search(text):
            return slug
    # Default: AI tools for most AI-related topics
    if re.search(r"ai|claude|gemini|llm|rag|mcp|エージェント", text, re.I):
        return "ai-tools"
    return "ai-news"


def _generate_slug(title: str) -> str:
    """Generate URL-safe slug from title (same logic as generate-hybrid-blog)."""
    # Remove non-ASCII (Japanese etc.) and special chars, keep alphanumeric/hyphens
    base = re.sub(r"[^\x00-\x7F]", "", title)  # strip non-ASCII
    base = re.sub(r"[^\w\s-]", "", base.lower()).strip()
    base = re.sub(r"\s+", "-", base)[:50]
    if not base:
        # Fallback: use romanized keywords from title
        keywords = re.findall(r"[A-Za-z0-9]+", title)
        base = "-".join(keywords[:5]).lower()[:50] if keywords else "blog"
    timestamp = str(int(datetime.now(tz=timezone.utc).timestamp()))[-6:]
    return f"{base}-{timestamp}"


async def post_process_node(state: BlogPipelineState) -> BlogPipelineState:
    """Create post in Supabase, then call Vercel post-processing API.

    1. Auto-select optimal category from topic/keyword
    2. Look up category_id from categories table
    3. Insert draft post into posts table (with meta_description + meta_keywords)
    4. HTTP POST to /api/blog-post-process for Fragment IDs, structured data, etc.
    Timeout: 300s (Vercel Pro limit, post-processing takes ~120s)
    """
    db = get_supabase()
    content = state.get("generated_content", {})
    blog_title = content.get("title", state.get("topic", "Generated Blog Post"))
    blog_content = _add_fragment_ids(content.get("content", ""))
    meta_description = content.get("meta_description", "")
    seo_keywords = content.get("seo_keywords") or []
    topic = state.get("topic", "")
    target_keyword = state.get("target_keyword", "")

    # Step 1: Auto-select optimal category
    category_slug = _auto_select_category(topic, target_keyword)
    sys.stdout.write(f"Auto-selected category: {category_slug} (topic: {topic})\n")

    # Step 2: Look up category_id
    cat_resp = db.table("categories").select("id, business_id").eq("slug", category_slug).execute()
    if cat_resp.data:
        category_id = cat_resp.data[0]["id"]
        business_id = cat_resp.data[0]["business_id"]
    else:
        # Fallback to ai-news
        cat_resp2 = db.table("categories").select("id, business_id").eq("slug", "ai-news").execute()
        if cat_resp2.data:
            category_id = cat_resp2.data[0]["id"]
            business_id = cat_resp2.data[0]["business_id"]
        else:
            category_id = 40
            business_id = 2

    # Step 3: Generate slug and create draft post
    slug = _generate_slug(blog_title)
    post_data = {
        "title": blog_title,
        "content": blog_content,
        "slug": slug,
        "business_id": business_id,
        "category_id": category_id,
        "status": "draft",
        "meta_description": meta_description[:160] if meta_description else "",
        "meta_keywords": seo_keywords[:5],
    }

    post_resp = db.table("posts").insert(post_data).execute()
    if not post_resp.data:
        raise RuntimeError(f"Failed to create post in Supabase: {post_resp}")

    post_id = post_resp.data[0]["id"]
    sys.stdout.write(f"Created draft post: id={post_id}, slug={slug}, category={category_slug}\n")

    # Update job with post_id
    job_id = state.get("job_id", "")
    if job_id:
        await update_job_status(job_id, post_id=post_id)

    # Step 4: Call Vercel post-processing API
    payload = {
        "postId": post_id,
        "content": blog_content,
        "slug": slug,
        "categorySlug": category_slug,
        "topic": topic,
        "targetKeyword": target_keyword,
        "seoKeywords": seo_keywords,
        "title": blog_title,
        "metaDescription": meta_description,
        "enableH2Diagrams": True,
    }

    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.post(
            f"{settings.vercel_api_base}/api/blog-post-process",
            json=payload,
            headers={"Authorization": f"Bearer {settings.vercel_api_secret}"},
        )
        if resp.status_code != 200:
            sys.stdout.write(f"Post-process API error: {resp.status_code} {resp.text[:500]}\n")
        resp.raise_for_status()
        result = resp.json()

    return {
        **state,
        "post_id": post_id,
        "slug": slug,
        "category_slug": category_slug,
        "fragment_ids": result.get("fragmentIds", []),
        "structured_data": result.get("structuredData", {}),
        "ai_enhanced_data": result.get("aiEnhancedData", {}),
    }
