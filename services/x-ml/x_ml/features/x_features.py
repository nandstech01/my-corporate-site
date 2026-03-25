"""X固有特徴量抽出（投稿タイプ、メディア有無）"""

from x_ml.config import POST_TYPE_ENCODING


def extract_x_features(
    post_type: str = "original",
    has_media: bool = False,
) -> dict[str, float]:
    return {
        "post_type_encoded": float(POST_TYPE_ENCODING.get(post_type, 0)),
        "has_media": 1.0 if has_media else 0.0,
    }
