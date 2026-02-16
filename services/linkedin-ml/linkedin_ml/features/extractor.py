"""全特徴量抽出オーケストレーター"""

from linkedin_ml.features.text_features import extract_text_features
from linkedin_ml.features.japanese_features import extract_japanese_features
from linkedin_ml.features.content_features import extract_content_features

FEATURE_NAMES = [
    # text features (12)
    "sentiment_positive_ratio",
    "sentiment_negative_ratio",
    "controversy_score",
    "avg_sentence_length",
    "paragraph_count",
    "sentence_count",
    "question_count",
    "list_item_count",
    "hook_length",
    "total_length",
    "line_count",
    "exclamation_count",
    # japanese features (7)
    "noun_density",
    "verb_density",
    "adj_density",
    "katakana_ratio",
    "tech_mention_count",
    "desu_masu_ratio",
    "token_count",
    # content features (5)
    "emoji_count",
    "link_count",
    "hashtag_count",
    "has_cta",
    "source_attribution",
    # temporal features (2)
    "day_of_week",
    "hour_jst",
]


def extract_all_features(
    text: str,
    day_of_week: int = 0,
    hour_jst: int = 10,
) -> dict[str, float]:
    features: dict[str, float] = {}

    features.update(extract_text_features(text))
    features.update(extract_japanese_features(text))
    features.update(extract_content_features(text))

    features["day_of_week"] = float(day_of_week)
    features["hour_jst"] = float(hour_jst)

    return {name: features.get(name, 0.0) for name in FEATURE_NAMES}
