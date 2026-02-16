"""Synthetic baseline data generator (cold start).

Same pattern as services/linkedin-ml/linkedin_ml/model/baseline_generator.py
"""

from __future__ import annotations

import json
import random
from pathlib import Path

import numpy as np
from xgboost import XGBRegressor

from blog_worker.ml.feature_engineering import FEATURE_NAMES

MODELS_DIR = Path(__file__).parent / "models"


def _generate_synthetic_sample() -> tuple[dict[str, float], float]:
    """Generate one synthetic blog quality sample."""
    base_score = 50.0

    features = {
        "char_count": random.uniform(5000, 40000),
        "h2_count": random.uniform(3, 25),
        "h3_count": random.uniform(0, 40),
        "faq_count": random.uniform(0, 20),
        "table_count": random.uniform(0, 8),
        "checklist_count": random.uniform(0, 10),
        "case_study_count": random.uniform(0, 8),
        "avg_h2_length": random.uniform(500, 3000),
        "fragment_id_count": random.uniform(0, 30),
        "keyword_coverage": random.uniform(0.0, 1.0),
        "internal_link_count": random.uniform(0, 10),
        "image_count": random.uniform(0, 10),
        "code_block_count": random.uniform(0, 5),
        "list_count": random.uniform(0, 30),
        "min_h2_length": random.uniform(100, 2000),
        "title_has_keyword": random.choice([0.0, 1.0]),
        "title_length": random.uniform(15, 60),
        "meta_desc_length": random.uniform(50, 160),
        "meta_desc_has_keyword": random.choice([0.0, 1.0]),
        "keyword_density": random.uniform(0.5, 5.0),
        "h2_keyword_coverage": random.uniform(0.0, 1.0),
        "first_para_has_keyword": random.choice([0.0, 1.0]),
        "lsi_keyword_count": random.uniform(0, 10),
        "schema_completeness": random.uniform(0.0, 1.0),
        "entity_relation_count": random.uniform(0, 10),
        "has_faq_schema": random.choice([0.0, 1.0]),
        "haspart_count": random.uniform(0, 30),
        "ai_search_readiness": random.uniform(0.0, 1.0),
        "category_avg_clicks": random.uniform(0, 100),
        "category_avg_ctr": random.uniform(0.0, 0.1),
        "category_avg_position": random.uniform(1, 50),
        "similar_topic_max_clicks": random.uniform(0, 200),
        "similar_topic_best_position": random.uniform(1, 50),
        "site_7day_trend": random.uniform(-0.5, 0.5),
    }

    score = base_score

    # Rule-based multipliers
    if features["faq_count"] >= 3:
        score *= 1.3
    if features["keyword_coverage"] > 0.7:
        score *= 1.25
    if features["h2_count"] >= 8:
        score *= 1.2
    if features["char_count"] >= 20000:
        score *= 1.15
    if features["fragment_id_count"] >= 10:
        score *= 1.1
    if features["title_has_keyword"] > 0:
        score *= 1.05
    if features["internal_link_count"] >= 3:
        score *= 1.1
    if features["has_faq_schema"] > 0:
        score *= 1.15
    if features["schema_completeness"] > 0.5:
        score *= 1.1
    if features["char_count"] < 10000:
        score *= 0.7
    if features["h2_count"] < 5:
        score *= 0.8

    score += random.gauss(0, 3)
    score = max(10.0, min(100.0, score))

    return features, score


def generate_baseline_model() -> str:
    """Generate baseline XGBoost model from 500 synthetic samples."""
    random.seed(42)
    n_samples = 500

    samples = [_generate_synthetic_sample() for _ in range(n_samples)]
    feature_dicts, targets = zip(*samples)

    x = np.array([[d[name] for name in FEATURE_NAMES] for d in feature_dicts])
    y = np.array(targets)

    model = XGBRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(x, y)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / "xgboost_seo.json"
    model.save_model(str(model_path))

    importances = dict(zip(FEATURE_NAMES, model.feature_importances_.tolist()))
    meta = {
        "version": "baseline",
        "training_size": n_samples,
        "feature_names": FEATURE_NAMES,
        "feature_importances": importances,
    }

    meta_path = MODELS_DIR / "baseline_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))

    return str(model_path)
