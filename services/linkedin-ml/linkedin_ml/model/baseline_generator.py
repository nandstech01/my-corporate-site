"""ドメイン知識ベースの合成データで初期XGBoostモデルを生成"""

import json
import random

import numpy as np
from xgboost import XGBRegressor

from linkedin_ml.config import BASELINE_MODEL_PATH, MODELS_DIR
from linkedin_ml.features.extractor import FEATURE_NAMES


def _generate_synthetic_sample() -> tuple[dict[str, float], float]:
    base_engagement = 10.0

    features = {
        "sentiment_positive_ratio": random.uniform(0.0, 0.5),
        "sentiment_negative_ratio": random.uniform(0.0, 0.2),
        "controversy_score": random.uniform(0.0, 0.5),
        "avg_sentence_length": random.uniform(20, 80),
        "paragraph_count": random.uniform(2, 8),
        "sentence_count": random.uniform(3, 20),
        "question_count": random.randint(0, 4),
        "list_item_count": random.randint(0, 8),
        "hook_length": random.uniform(10, 80),
        "total_length": random.uniform(400, 2000),
        "line_count": random.uniform(5, 30),
        "exclamation_count": random.randint(0, 5),
        "noun_density": random.uniform(0.2, 0.5),
        "verb_density": random.uniform(0.1, 0.25),
        "adj_density": random.uniform(0.02, 0.1),
        "katakana_ratio": random.uniform(0.0, 0.15),
        "tech_mention_count": random.randint(0, 6),
        "desu_masu_ratio": random.uniform(0.5, 1.0),
        "token_count": random.uniform(100, 600),
        "emoji_count": random.randint(0, 5),
        "link_count": random.randint(0, 3),
        "hashtag_count": random.randint(0, 5),
        "has_cta": random.choice([0.0, 1.0]),
        "source_attribution": random.choice([0.0, 1.0]),
        "day_of_week": random.randint(0, 6),
        "hour_jst": random.randint(7, 22),
    }

    engagement = base_engagement
    if features["question_count"] >= 1:
        engagement *= 1.3
    if 1000 <= features["total_length"] <= 1500:
        engagement *= 1.2
    elif features["total_length"] < 600 or features["total_length"] > 2000:
        engagement *= 0.7
    if features["list_item_count"] >= 3:
        engagement *= 1.15
    if features["source_attribution"] > 0:
        engagement *= 1.1
    if features["has_cta"] > 0:
        engagement *= 1.2
    if features["controversy_score"] > 0.2:
        engagement *= 1.1
    if features["tech_mention_count"] >= 2:
        engagement *= 1.1
    if features["day_of_week"] in (1, 2, 3):
        engagement *= 1.05
    if 9 <= features["hour_jst"] <= 11:
        engagement *= 1.1

    engagement += random.gauss(0, 1.5)
    engagement = max(1.0, engagement)

    return features, engagement


def generate_baseline_model() -> str:
    random.seed(42)
    n_samples = 200

    samples = [_generate_synthetic_sample() for _ in range(n_samples)]
    feature_dicts, targets = zip(*samples)

    x = np.array([[d[name] for name in FEATURE_NAMES] for d in feature_dicts])
    y = np.array(targets)

    model = XGBRegressor(
        n_estimators=50,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(x, y)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(BASELINE_MODEL_PATH))

    importances = dict(zip(FEATURE_NAMES, model.feature_importances_.tolist()))
    meta = {
        "version": "baseline",
        "training_size": n_samples,
        "feature_names": FEATURE_NAMES,
        "feature_importances": importances,
    }

    meta_path = MODELS_DIR / "baseline_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))

    return str(BASELINE_MODEL_PATH)
