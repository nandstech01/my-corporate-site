"""34-feature extraction for blog quality prediction."""

from __future__ import annotations

import re

FEATURE_NAMES: list[str] = [
    # Content (15)
    "char_count",
    "h2_count",
    "h3_count",
    "faq_count",
    "table_count",
    "checklist_count",
    "case_study_count",
    "avg_h2_length",
    "fragment_id_count",
    "keyword_coverage",
    "internal_link_count",
    "image_count",
    "code_block_count",
    "list_count",
    "min_h2_length",
    # SEO (8)
    "title_has_keyword",
    "title_length",
    "meta_desc_length",
    "meta_desc_has_keyword",
    "keyword_density",
    "h2_keyword_coverage",
    "first_para_has_keyword",
    "lsi_keyword_count",
    # AIO (5)
    "schema_completeness",
    "entity_relation_count",
    "has_faq_schema",
    "haspart_count",
    "ai_search_readiness",
    # GSC history (6)
    "category_avg_clicks",
    "category_avg_ctr",
    "category_avg_position",
    "similar_topic_max_clicks",
    "similar_topic_best_position",
    "site_7day_trend",
]


def extract_features(
    content: str,
    title: str,
    meta_description: str,
    target_keyword: str,
    seo_keywords: list[str],
    gsc_features: dict | None = None,
) -> dict[str, float]:
    """Extract 34 features from blog content."""
    features: dict[str, float] = {}

    # Content features
    features["char_count"] = float(len(content))
    features["h2_count"] = float(len(re.findall(r"^## ", content, re.MULTILINE)))
    features["h3_count"] = float(len(re.findall(r"^### ", content, re.MULTILINE)))
    features["faq_count"] = float(len(re.findall(r"### Q:", content)))
    features["table_count"] = float(len(re.findall(r"\|.*\|.*\|", content)))
    features["checklist_count"] = float(len(re.findall(r"- \[[ x]\]", content)))
    features["case_study_count"] = float(content.lower().count("事例") + content.lower().count("ケーススタディ"))
    features["fragment_id_count"] = float(len(re.findall(r"\{#[^}]+\}", content)))
    features["internal_link_count"] = float(len(re.findall(r"\[.*?\]\(https://nands\.tech", content)))
    features["image_count"] = float(len(re.findall(r"!\[.*?\]\(", content)))
    features["code_block_count"] = float(len(re.findall(r"```", content)) // 2)
    features["list_count"] = float(len(re.findall(r"^[-*] ", content, re.MULTILINE)))

    # H2 section lengths
    h2_sections = re.split(r"^## ", content, flags=re.MULTILINE)[1:]
    h2_lengths = [len(s) for s in h2_sections] if h2_sections else [0]
    features["avg_h2_length"] = float(sum(h2_lengths) / max(len(h2_lengths), 1))
    features["min_h2_length"] = float(min(h2_lengths) if h2_lengths else 0)

    # Keyword coverage
    keyword_lower = target_keyword.lower()
    kw_parts = keyword_lower.split()
    content_lower = content.lower()
    features["keyword_coverage"] = float(
        sum(1 for kw in kw_parts if kw in content_lower) / max(len(kw_parts), 1)
    )

    # SEO features
    features["title_has_keyword"] = 1.0 if keyword_lower in title.lower() else 0.0
    features["title_length"] = float(len(title))
    features["meta_desc_length"] = float(len(meta_description))
    features["meta_desc_has_keyword"] = 1.0 if keyword_lower in meta_description.lower() else 0.0
    features["keyword_density"] = float(
        content_lower.count(keyword_lower) / max(len(content) / 100, 1)
    )
    h2_texts = " ".join(re.findall(r"^## (.+)$", content, re.MULTILINE)).lower()
    features["h2_keyword_coverage"] = float(
        sum(1 for kw in kw_parts if kw in h2_texts) / max(len(kw_parts), 1)
    )
    first_para = content.split("\n\n")[0] if content else ""
    features["first_para_has_keyword"] = 1.0 if keyword_lower in first_para.lower() else 0.0
    features["lsi_keyword_count"] = float(
        sum(1 for kw in seo_keywords if kw.lower() in content_lower)
    )

    # AIO features
    features["schema_completeness"] = min(1.0, features["fragment_id_count"] / 20.0)
    features["entity_relation_count"] = float(content.count("nands.tech"))
    features["has_faq_schema"] = 1.0 if features["faq_count"] >= 3 else 0.0
    features["haspart_count"] = features["fragment_id_count"]
    features["ai_search_readiness"] = min(
        1.0,
        (features["has_faq_schema"] * 0.3
         + features["schema_completeness"] * 0.4
         + (1.0 if features["fragment_id_count"] > 10 else 0.0) * 0.3),
    )

    # GSC features (default zeros if not available)
    gsc = gsc_features or {}
    features["category_avg_clicks"] = float(gsc.get("category_avg_clicks", 0))
    features["category_avg_ctr"] = float(gsc.get("category_avg_ctr", 0))
    features["category_avg_position"] = float(gsc.get("category_avg_position", 50))
    features["similar_topic_max_clicks"] = float(gsc.get("similar_topic_max_clicks", 0))
    features["similar_topic_best_position"] = float(gsc.get("similar_topic_best_position", 50))
    features["site_7day_trend"] = float(gsc.get("site_7day_trend", 0))

    return features
