"""XGBoost エンゲージメント予測"""

import json
from pathlib import Path

import numpy as np
from xgboost import XGBRegressor

from linkedin_ml.config import BASELINE_MODEL_PATH, MODELS_DIR
from linkedin_ml.features.extractor import FEATURE_NAMES, extract_all_features
from linkedin_ml.model.baseline_generator import generate_baseline_model

TRAINED_MODEL_PATH = MODELS_DIR / "trained.json"


class EngagementPredictor:
    MAX_MODEL_SIZE = 50 * 1024 * 1024  # 50MB

    def __init__(self, model_path: str | None = None):
        self._model = XGBRegressor()
        self._model_version = "unknown"
        self._training_size = 0

        if model_path:
            resolved_path = Path(model_path)
        elif TRAINED_MODEL_PATH.exists():
            resolved_path = TRAINED_MODEL_PATH
        else:
            resolved_path = BASELINE_MODEL_PATH

        if not resolved_path.exists():
            generate_baseline_model()

        self._load_model(resolved_path)

    def _load_model(self, model_path: Path) -> None:
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        file_size = model_path.stat().st_size
        if file_size > self.MAX_MODEL_SIZE:
            raise ValueError(
                f"Model file too large: {file_size} bytes (max {self.MAX_MODEL_SIZE})"
            )

        self._model.load_model(str(model_path))

        meta_path = model_path.parent / f"{model_path.stem}_meta.json"
        if meta_path.exists():
            meta = json.loads(meta_path.read_text())
            self._model_version = meta.get("version", "unknown")
            self._training_size = meta.get("training_size", 0)

    def predict(self, features: dict[str, float]) -> dict:
        feature_vector = np.array(
            [[features.get(name, 0.0) for name in FEATURE_NAMES]]
        )

        predicted = float(self._model.predict(feature_vector)[0])
        predicted = max(0.0, predicted)

        importances = self._model.feature_importances_
        top_indices = np.argsort(importances)[::-1][:5]
        top_features = [
            {
                "name": FEATURE_NAMES[i],
                "importance": round(float(importances[i]), 4),
            }
            for i in top_indices
        ]

        confidence = self._calculate_confidence(features)

        return {
            "predicted_engagement": round(predicted, 2),
            "confidence": round(confidence, 2),
            "top_features": top_features,
            "model_version": self._model_version,
        }

    def predict_from_text(
        self,
        text: str,
        day_of_week: int = 0,
        hour_jst: int = 10,
    ) -> dict:
        features = extract_all_features(text, day_of_week, hour_jst)
        result = self.predict(features)
        return {**result, "features": features}

    def get_insights(self) -> dict:
        importances = self._model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]

        all_features = [
            {
                "name": FEATURE_NAMES[i],
                "importance": round(float(importances[i]), 4),
            }
            for i in sorted_indices
            if importances[i] > 0.01
        ]

        return {
            "top_features": all_features,
            "model_version": self._model_version,
            "training_size": self._training_size,
        }

    def _calculate_confidence(self, features: dict[str, float]) -> float:
        confidence = 0.4 if self._model_version == "baseline" else 0.7

        total_length = features.get("total_length", 0)
        if 800 <= total_length <= 2000:
            confidence += 0.1

        if self._training_size >= 100:
            confidence += 0.15
        elif self._training_size >= 50:
            confidence += 0.1

        return min(confidence, 0.95)
