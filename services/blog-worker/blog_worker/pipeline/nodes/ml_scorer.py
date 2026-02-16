"""ML scorer node: XGBoost + LightGBM ensemble quality scoring."""

from __future__ import annotations

from blog_worker.db import update_job_status
from blog_worker.ml.feature_engineering import extract_features
from blog_worker.ml.gsc_features import get_gsc_features
from blog_worker.ml.model import BlogQualityModel
from blog_worker.pipeline.state import BlogPipelineState

# Singleton model instance
_model: BlogQualityModel | None = None


def _get_model() -> BlogQualityModel:
    global _model
    if _model is None:
        _model = BlogQualityModel()
        _model.load()
    return _model


async def ml_score_node(state: BlogPipelineState) -> BlogPipelineState:
    """Score article quality using ML ensemble.

    - Extract 39 features from generated content
    - XGBoost (SEO, weight 0.6) + LightGBM (AIO, weight 0.4)
    - Returns score 0-100 and breakdown
    """
    generated = state.get("generated_content", {})
    if not generated or "error" in generated:
        return {**state, "ml_score": 0.0, "ml_breakdown": {"error": "no content"}}

    content = generated.get("content", "")
    title = generated.get("title", "")
    meta_description = generated.get("meta_description", "")
    target_keyword = state.get("target_keyword", "")
    category_slug = state.get("category_slug", "ai-technology")
    seo_keywords = generated.get("seo_keywords", [])

    if not content:
        return {**state, "ml_score": 0.0, "ml_breakdown": {"error": "empty content"}}

    # Get GSC features for category context
    gsc_features = await get_gsc_features(
        category_slug,
        state.get("topic", ""),
    )

    # Extract 39 features
    features = extract_features(
        content=content,
        title=title,
        meta_description=meta_description,
        target_keyword=target_keyword,
        seo_keywords=seo_keywords,
        gsc_features=gsc_features,
    )

    # Run model prediction
    model = _get_model()
    score, breakdown = model.predict(features)

    # Add feature summary to breakdown
    breakdown["char_count"] = features.get("char_count", 0)
    breakdown["h2_count"] = features.get("h2_count", 0)
    breakdown["faq_count"] = features.get("faq_count", 0)
    breakdown["keyword_coverage"] = features.get("keyword_coverage", 0)
    breakdown["fragment_id_count"] = features.get("fragment_id_count", 0)
    breakdown["generation_model"] = generated.get("generation_model", "unknown")
    # Quality features (used by quality gate hard-fail conditions)
    breakdown["citation_count"] = features.get("citation_count", 0)
    breakdown["placeholder_count"] = features.get("placeholder_count", 0)
    breakdown["duplicate_ratio"] = features.get("duplicate_ratio", 0)
    breakdown["heading_naturalness"] = features.get("heading_naturalness", 0)
    breakdown["avg_paragraph_length"] = features.get("avg_paragraph_length", 0)
    # Review results (from GPT-5.2 fact-checking)
    breakdown["review_score"] = state.get("review_score", 0)
    breakdown["review_issues_count"] = len(state.get("review_issues", []))

    # Update job with ML score
    job_id = state.get("job_id", "")
    if job_id:
        await update_job_status(
            job_id,
            ml_score=score,
            ml_breakdown=breakdown,
        )

    return {**state, "ml_score": score, "ml_breakdown": breakdown}
