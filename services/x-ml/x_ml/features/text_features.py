"""テキスト構造・感情に関する特徴量抽出"""

import re

POSITIVE_WORDS = [
    "素晴らしい", "最高", "嬉しい", "楽しい", "便利", "効果的", "革新的",
    "画期的", "成功", "成長", "向上", "改善", "実現", "達成", "可能性",
    "チャンス", "メリット", "おすすめ", "期待", "感動", "興味深い",
]

NEGATIVE_WORDS = [
    "問題", "課題", "困難", "失敗", "リスク", "注意", "懸念", "不安",
    "危険", "デメリット", "欠点", "限界", "障壁",
]

CONTRAST_MARKERS = [
    "しかし", "一方で", "ただし", "とはいえ", "反面", "逆に", "むしろ",
    "それでも", "けれども", "だが",
]


def extract_text_features(text: str) -> dict[str, float]:
    sentences = [s.strip() for s in re.split(r"[。！!]", text) if s.strip()]
    sentence_count = max(len(sentences), 1)
    total_chars = max(len(text), 1)
    words_approx = total_chars

    positive_count = sum(1 for w in POSITIVE_WORDS if w in text)
    negative_count = sum(1 for w in NEGATIVE_WORDS if w in text)
    contrast_count = sum(1 for m in CONTRAST_MARKERS if m in text)

    lines = text.split("\n")
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    first_line = lines[0] if lines else ""

    question_count = text.count("?") + text.count("\uff1f")

    list_pattern = re.compile(r"^[\s]*[-*\u2022\u30fb]|^[\s]*\d+[.)\uff0e]", re.MULTILINE)
    list_items = len(list_pattern.findall(text))

    return {
        "sentiment_positive_ratio": positive_count / words_approx * 100,
        "sentiment_negative_ratio": negative_count / words_approx * 100,
        "controversy_score": contrast_count / sentence_count,
        "avg_sentence_length": total_chars / sentence_count,
        "paragraph_count": float(len(paragraphs)),
        "sentence_count": float(sentence_count),
        "question_count": float(question_count),
        "list_item_count": float(list_items),
        "hook_ratio": len(first_line) / total_chars,
        "total_length": float(total_chars),
        "line_count": float(len(lines)),
        "exclamation_count": float(text.count("!") + text.count("\uff01")),
    }
