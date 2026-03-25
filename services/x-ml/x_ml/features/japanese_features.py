"""日本語NLP特徴量抽出（fugashi/MeCab）"""

import re
import unicodedata

from x_ml.config import TECH_KEYWORDS

_tagger = None


def _get_tagger():
    global _tagger
    if _tagger is None:
        import fugashi
        _tagger = fugashi.Tagger()
    return _tagger


def extract_japanese_features(text: str) -> dict[str, float]:
    total_chars = max(len(text), 1)

    katakana_count = sum(
        1 for ch in text if unicodedata.name(ch, "").startswith("KATAKANA")
    )

    tech_count = sum(
        len(re.findall(re.escape(kw), text, re.IGNORECASE))
        for kw in TECH_KEYWORDS
    )

    sentences = [s.strip() for s in re.split(r"[。！!]", text) if s.strip()]
    desu_masu_count = sum(
        1 for s in sentences
        if re.search(r"(です|ます|ました|でした|ません|でしょう)\s*$", s)
    )
    desu_masu_ratio = desu_masu_count / max(len(sentences), 1)

    try:
        tagger = _get_tagger()
        tokens = tagger(text)
        total_tokens = max(len(tokens), 1)

        noun_count = sum(1 for t in tokens if t.feature.pos1 == "名詞")
        verb_count = sum(1 for t in tokens if t.feature.pos1 == "動詞")
        adj_count = sum(1 for t in tokens if t.feature.pos1 == "形容詞")

        return {
            "noun_density": noun_count / total_tokens,
            "verb_density": verb_count / total_tokens,
            "adj_density": adj_count / total_tokens,
            "katakana_ratio": katakana_count / total_chars,
            "tech_mention_count": float(tech_count),
            "desu_masu_ratio": desu_masu_ratio,
            "token_count": float(total_tokens),
        }
    except (ImportError, OSError, RuntimeError) as e:
        import sys
        print(f"fugashi/MeCab unavailable, using fallback: {e}", file=sys.stderr)
        return {
            "noun_density": 0.3,
            "verb_density": 0.15,
            "adj_density": 0.05,
            "katakana_ratio": katakana_count / total_chars,
            "tech_mention_count": float(tech_count),
            "desu_masu_ratio": desu_masu_ratio,
            "token_count": float(total_chars / 2),
        }
