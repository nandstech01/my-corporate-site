"""Pipeline state definition for LangGraph."""

from __future__ import annotations

from typing import TypedDict


class BlogPipelineState(TypedDict, total=False):
    # Job metadata
    job_id: str
    topic: str
    target_keyword: str
    category_slug: str
    business_category: str
    target_length: int

    # Scraper output
    scraped_keywords: dict
    scrape_query1: str
    scrape_query2: str

    # Researcher output
    research_results: dict
    research_query1: str
    research_query2: str

    # RAG output
    company_vectors: list[dict]
    personal_story_data: list[dict]
    kenji_thought_data: list[dict]
    youtube_rag_data: list[dict]
    scraped_rag_data: list[dict]
    research_rag_data: list[dict]

    # Generator output
    generated_content: dict  # {title, meta_description, content, seo_keywords, excerpt, ...}

    # Review (GPT-5.2 fact-checking)
    review_score: float          # GPT-5.2 review score (0-100)
    review_issues: list[dict]    # Detected issues list
    review_summary: str          # Review summary

    # ML scoring
    ml_score: float
    ml_breakdown: dict
    retry_count: int

    # Post-processing
    post_id: int
    slug: str
    fragment_ids: list[str]
    structured_data: dict
    ai_enhanced_data: dict

    # Error tracking
    error: str | None
