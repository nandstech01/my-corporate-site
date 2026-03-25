"""Supabase 実データによる XGBoost 再学習"""

import json
from datetime import datetime
from pathlib import Path

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

from x_ml.config import MODELS_DIR, MIN_TRAINING_SAMPLES
from x_ml.features.extractor import FEATURE_NAMES

TRAINED_MODEL_PATH = MODELS_DIR / "trained.json"
TRAINED_META_PATH = MODELS_DIR / "trained_meta.json"


def fetch_training_data(
    supabase_url: str,
    supabase_key: str,
) -> list[dict]:
    """Supabase から ml_features が保存済み & impressions >= 10 のレコードを取得"""
    from supabase import create_client

    client = create_client(supabase_url, supabase_key)

    response = (
        client.table("x_post_analytics")
        .select("ml_features, likes, retweets, replies, impressions")
        .not_.is_("ml_features", "null")
        .gte("impressions", 10)
        .execute()
    )

    return response.data or []


def train_model(
    supabase_url: str,
    supabase_key: str,
) -> dict:
    """実データで XGBoost を再学習。データ不足時はスキップ。"""
    rows = fetch_training_data(supabase_url, supabase_key)

    if len(rows) < MIN_TRAINING_SAMPLES:
        return {
            "success": False,
            "skipped": True,
            "reason": f"Insufficient data: {len(rows)} < {MIN_TRAINING_SAMPLES}",
            "model_version": "baseline",
            "training_size": len(rows),
            "mae": 0.0,
            "rmse": 0.0,
        }

    # Build feature matrix and target vector
    X = []
    y = []
    for row in rows:
        features = row["ml_features"]
        feature_vector = [features.get(name, 0.0) for name in FEATURE_NAMES]
        # X engagement formula: likes + retweets*20 + replies*13.5
        engagement = (
            (row.get("likes") or 0)
            + (row.get("retweets") or 0) * 20
            + (row.get("replies") or 0) * 13.5
        )
        X.append(feature_vector)
        y.append(float(engagement))

    X_arr = np.array(X)
    y_arr = np.array(y)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_arr, y_arr, test_size=0.2, random_state=42,
    )

    model = XGBRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))

    # Save model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(TRAINED_MODEL_PATH))

    version = f"trained_{datetime.utcnow().strftime('%Y%m%d_%H%M')}"
    meta = {
        "version": version,
        "training_size": len(rows),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "trained_at": datetime.utcnow().isoformat(),
    }
    TRAINED_META_PATH.write_text(json.dumps(meta, ensure_ascii=False))

    return {
        "success": True,
        "skipped": False,
        "model_version": version,
        "training_size": len(rows),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
    }
