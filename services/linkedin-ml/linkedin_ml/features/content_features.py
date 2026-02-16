"""コンテンツ特徴量抽出（絵文字、リンク、ハッシュタグ、CTA）"""

import re

from linkedin_ml.config import CTA_PATTERNS, SOURCE_ATTRIBUTION_KEYWORDS

EMOJI_PATTERN = re.compile(
    "[\U0001f600-\U0001f64f\U0001f300-\U0001f5ff\U0001f680-\U0001f6ff"
    "\U0001f1e0-\U0001f1ff\U00002702-\U000027b0\U0001f900-\U0001f9ff"
    "\U0001fa00-\U0001fa6f\U0001fa70-\U0001faff\U00002600-\U000026ff"
    "\U0000fe00-\U0000fe0f\U0000200d]+",
    re.UNICODE,
)

URL_PATTERN = re.compile(r"https?://\S+")
HASHTAG_PATTERN = re.compile(r"#\w+")


def extract_content_features(text: str) -> dict[str, float]:
    emoji_count = len(EMOJI_PATTERN.findall(text))
    link_count = len(URL_PATTERN.findall(text))
    hashtag_count = len(HASHTAG_PATTERN.findall(text))

    has_cta = 1.0 if any(p in text for p in CTA_PATTERNS) else 0.0

    source_attribution = 1.0 if any(
        kw in text for kw in SOURCE_ATTRIBUTION_KEYWORDS
    ) else 0.0

    return {
        "emoji_count": float(emoji_count),
        "link_count": float(link_count),
        "hashtag_count": float(hashtag_count),
        "has_cta": has_cta,
        "source_attribution": source_attribution,
    }
