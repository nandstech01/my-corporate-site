"""ドメイン知識ベースの合成データで初期XGBoostモデルを生成"""

import json
import random

import numpy as np
from xgboost import XGBRegressor

from x_ml.config import BASELINE_MODEL_PATH, MODELS_DIR, POST_TYPE_ENCODING
from x_ml.features.extractor import FEATURE_NAMES


def _generate_synthetic_sample() -> tuple[dict[str, float], float]:
    base_engagement = 10.0

    post_type = random.choice(list(POST_TYPE_ENCODING.keys()))
    post_type_encoded = float(POST_TYPE_ENCODING[post_type])
    has_media = random.choice([0.0, 1.0])

    features = {
        "sentiment_positive_ratio": random.uniform(0.0, 0.5),
        "sentiment_negative_ratio": random.uniform(0.0, 0.2),
        "controversy_score": random.uniform(0.0, 0.5),
        "avg_sentence_length": random.uniform(10, 60),
        "paragraph_count": random.uniform(1, 4),
        "sentence_count": random.uniform(1, 8),
        "question_count": random.randint(0, 3),
        "list_item_count": random.randint(0, 4),
        "hook_ratio": random.uniform(0.3, 1.0),
        "total_length": random.uniform(50, 400),
        "line_count": random.uniform(1, 10),
        "exclamation_count": random.randint(0, 3),
        "noun_density": random.uniform(0.2, 0.5),
        "verb_density": random.uniform(0.1, 0.25),
        "adj_density": random.uniform(0.02, 0.1),
        "katakana_ratio": random.uniform(0.0, 0.15),
        "tech_mention_count": random.randint(0, 4),
        "desu_masu_ratio": random.uniform(0.0, 1.0),
        "token_count": random.uniform(20, 200),
        "emoji_count": random.randint(0, 3),
        "link_count": random.randint(0, 2),
        "hashtag_count": random.randint(0, 3),
        "has_cta": random.choice([0.0, 1.0]),
        "source_attribution": random.choice([0.0, 1.0]),
        "post_type_encoded": post_type_encoded,
        "has_media": has_media,
        "day_of_week": random.randint(0, 6),
        "hour_jst": random.randint(7, 22),
    }

    engagement = base_engagement

    # X-specific heuristics
    # Optimal length 120-200 chars
    if 120 <= features["total_length"] <= 200:
        engagement *= 1.25
    elif features["total_length"] < 80:
        engagement *= 0.7

    # Questions drive replies on X
    if features["question_count"] >= 1:
        engagement *= 1.4

    # Media boost
    if has_media > 0:
        engagement *= 1.3

    # Thread boost
    if post_type == "thread":
        engagement *= 1.2

    # Quote tweet boost
    if post_type == "quote":
        engagement *= 1.15

    # CTA
    if features["has_cta"] > 0:
        engagement *= 1.2

    # Source attribution
    if features["source_attribution"] > 0:
        engagement *= 1.1

    # Controversy
    if features["controversy_score"] > 0.2:
        engagement *= 1.1

    # Tech mentions
    if features["tech_mention_count"] >= 2:
        engagement *= 1.1

    # Evening JST 18-21 golden hour
    if 18 <= features["hour_jst"] <= 21:
        engagement *= 1.15

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
