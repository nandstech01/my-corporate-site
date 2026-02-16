"""XGBoost/LightGBM model management."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from blog_worker.ml.feature_engineering import FEATURE_NAMES

MODELS_DIR = Path(__file__).parent / "models"


class BlogQualityModel:
    """Ensemble model: XGBoost (SEO) + LightGBM (AIO)."""

    def __init__(self) -> None:
        self._xgb_model = None
        self._lgbm_model = None
        self._xgb_weight = 0.6
        self._lgbm_weight = 0.4

    def load(self) -> None:
        """Load active models from disk or Supabase."""
        xgb_path = MODELS_DIR / "xgboost_seo.json"
        lgbm_path = MODELS_DIR / "lightgbm_aio.txt"

        if xgb_path.exists():
            from xgboost import XGBRegressor
            self._xgb_model = XGBRegressor()
            self._xgb_model.load_model(str(xgb_path))

        if lgbm_path.exists():
            import lightgbm as lgb
            self._lgbm_model = lgb.Booster(model_file=str(lgbm_path))

    def predict(self, features: dict[str, float]) -> tuple[float, dict]:
        """Predict quality score (0-100) and return breakdown."""
        x = np.array([[features.get(name, 0.0) for name in FEATURE_NAMES]])

        scores: dict[str, float] = {}

        if self._xgb_model is not None:
            seo_score = float(self._xgb_model.predict(x)[0])
            scores["seo_score"] = seo_score
        else:
            seo_score = self._rule_based_score(features)
            scores["seo_score"] = seo_score

        if self._lgbm_model is not None:
            aio_score = float(self._lgbm_model.predict(x)[0])
            scores["aio_score"] = aio_score
        else:
            aio_score = self._rule_based_aio_score(features)
            scores["aio_score"] = aio_score

        combined = seo_score * self._xgb_weight + aio_score * self._lgbm_weight
        combined = max(0.0, min(100.0, combined))
        scores["combined"] = combined

        return combined, scores

    @staticmethod
    def _rule_based_score(features: dict[str, float]) -> float:
        """Fallback rule-based SEO score."""
        score = 30.0
        if features.get("char_count", 0) >= 20000:
            score += 15
        if features.get("h2_count", 0) >= 10:
            score += 10
        if features.get("faq_count", 0) >= 3:
            score += 10
        if features.get("keyword_coverage", 0) > 0.7:
            score += 10
        if features.get("title_has_keyword", 0) > 0:
            score += 5
        if features.get("internal_link_count", 0) >= 3:
            score += 5
        return min(100.0, score)

    @staticmethod
    def _rule_based_aio_score(features: dict[str, float]) -> float:
        """Fallback rule-based AIO score."""
        score = 30.0
        if features.get("fragment_id_count", 0) >= 10:
            score += 15
        if features.get("has_faq_schema", 0) > 0:
            score += 15
        if features.get("schema_completeness", 0) > 0.5:
            score += 10
        if features.get("entity_relation_count", 0) >= 3:
            score += 10
        return min(100.0, score)
