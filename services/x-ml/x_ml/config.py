from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
BASELINE_MODEL_PATH = MODELS_DIR / "baseline.json"

MIN_TRAINING_SAMPLES = 30
ML_WEIGHT = 0.3

TECH_KEYWORDS = [
    "AI", "LLM", "GPT", "Claude", "Python", "TypeScript", "JavaScript",
    "React", "Next.js", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "API", "SaaS", "DX", "DevOps", "CI/CD", "GitHub", "OSS",
    "RAG", "エージェント", "自動化", "機械学習", "深層学習",
]

CTA_PATTERNS = [
    "いかがですか", "どう思いますか", "教えてください", "聞かせてください",
    "ご意見", "コメント", "シェア", "感想", "経験ありますか",
    "どのように", "皆さんは",
    # X-specific CTA patterns
    "リプで教えて", "RTお願い", "どう思う？", "スレッドで解説",
]

SOURCE_ATTRIBUTION_KEYWORDS = [
    "Reddit", "GitHub", "Hacker News", "HN", "Dev.to", "Stack Overflow",
    "arXiv", "論文", "調査", "レポート", "発表",
]

# X-specific: post type encoding
POST_TYPE_ENCODING = {
    "original": 0,
    "quote": 1,
    "thread": 2,
    "reply": 3,
    "repost": 4,
    "article": 5,
}
