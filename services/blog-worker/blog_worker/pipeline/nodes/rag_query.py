"""RAG query node: Supabase RPC + direct queries."""

from __future__ import annotations

from openai import OpenAI

from blog_worker.config import settings
from blog_worker.db import get_supabase
from blog_worker.pipeline.state import BlogPipelineState


def _get_embedding(text: str, dimensions: int = 1536) -> list[float]:
    """Generate embedding using OpenAI API."""
    if not settings.openai_api_key:
        return [0.0] * dimensions

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(
        model="text-embedding-3-small" if dimensions <= 1536 else "text-embedding-3-large",
        input=text,
        dimensions=dimensions,
    )
    return response.data[0].embedding


async def rag_query_node(state: BlogPipelineState) -> BlogPipelineState:
    """Query RAG sources for context enrichment.

    Sources:
    - company_vectors: Company info (hybrid search)
    - personal_story_rag: Personal stories (latest 5)
    - kenji_harada_architect_knowledge: AI architect thoughts (hybrid search)
    - Scraped keywords from state (already available)
    - Research results from state (already available)
    """
    db = get_supabase()
    topic = state.get("topic", "")
    target_keyword = state.get("target_keyword", "")
    search_query = f"{topic} {target_keyword}"

    company_vectors: list[dict] = []
    personal_story_data: list[dict] = []
    kenji_thought_data: list[dict] = []
    youtube_rag_data: list[dict] = []

    # Pre-compute embeddings (shared across searches)
    embedding: list[float] = []
    try:
        embedding = _get_embedding(search_query, 1536)
    except Exception:
        pass

    # 1. Company Vectors (hybrid search)
    try:
        if not embedding:
            raise ValueError("No embedding available")
        result = db.rpc(
            "hybrid_search_company_vectors",
            {
                "query_text": search_query,
                "query_embedding": embedding,
                "match_count": 15,
                "similarity_threshold": 0.3,
            },
        ).execute()

        if result.data:
            company_vectors = [
                {
                    "content_chunk": r.get("content_chunk", ""),
                    "section_title": r.get("section_title", ""),
                    "content_type": r.get("content_type", ""),
                    "combined_score": r.get("combined_score", 0),
                }
                for r in result.data
            ]
    except Exception:
        # Fallback: simple SELECT
        try:
            result = (
                db.table("company_vectors")
                .select("*")
                .in_("content_type", ["corporate", "service", "structured-data"])
                .limit(15)
                .execute()
            )
            company_vectors = result.data or []
        except Exception:
            pass

    # 2. Personal Story RAG (latest 5)
    try:
        result = (
            db.table("personal_story_rag")
            .select("*")
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        personal_story_data = result.data or []
    except Exception:
        pass

    # 3. Kenji Thought RAG (hybrid search with 3072 dims)
    try:
        embedding_3072 = _get_embedding(search_query, 3072)
        result = db.rpc(
            "match_kenji_thoughts",
            {
                "query_text": search_query,
                "query_embedding": embedding_3072,
                "match_count": 10,
                "similarity_threshold": 0.3,
            },
        ).execute()

        if result.data:
            kenji_thought_data = [
                {
                    "thought_title": r.get("thought_title", ""),
                    "thought_content": r.get("thought_content", r.get("content", "")),
                    "usage_context": r.get("usage_context", ""),
                    "combined_score": r.get("combined_score", 0),
                }
                for r in result.data
            ]
    except Exception:
        # Fallback: simple SELECT
        try:
            result = (
                db.table("kenji_harada_architect_knowledge")
                .select("*")
                .eq("is_active", True)
                .order("priority", desc=True)
                .limit(10)
                .execute()
            )
            kenji_thought_data = result.data or []
        except Exception:
            pass

    # 4. YouTube Vectors (hybrid search, 1536 dims — reuses embedding)
    try:
        if not embedding:
            raise ValueError("No embedding available")
        yt_result = db.rpc(
            "hybrid_search_youtube_vectors",
            {
                "query_text": search_query,
                "query_embedding": embedding,
                "match_count": 5,
                "match_threshold": 0.4,
            },
        ).execute()

        if yt_result.data:
            youtube_rag_data = [
                {
                    "video_title": r.get("video_title", ""),
                    "channel_name": (r.get("metadata") or {}).get("channel_name", ""),
                    "content": str(r.get("content", ""))[:500],
                    "video_url": (r.get("metadata") or {}).get("video_url", ""),
                    "educational_score": (r.get("metadata") or {}).get("educational_score", 0),
                }
                for r in yt_result.data
            ]
    except Exception:
        pass

    # 5 & 6: Scraped keywords and research results are already in state
    scraped_rag_data: list[dict] = []
    research_rag_data: list[dict] = []

    research = state.get("research_results", {})
    if isinstance(research, dict):
        raw_results = research.get("results", [])
        research_rag_data = raw_results[:20] if isinstance(raw_results, list) else []

    return {
        **state,
        "company_vectors": company_vectors,
        "personal_story_data": personal_story_data,
        "kenji_thought_data": kenji_thought_data,
        "youtube_rag_data": youtube_rag_data,
        "scraped_rag_data": scraped_rag_data,
        "research_rag_data": research_rag_data,
    }
