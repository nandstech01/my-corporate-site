"""ML model retraining logic (weekly)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from blog_worker.config import settings
from blog_worker.db import get_supabase
from blog_worker.ml.feature_engineering import FEATURE_NAMES
from blog_worker.ml.model import MODELS_DIR
from blog_worker.slack.notifier import notify_ml_retrain


async def retrain_models() -> None:
    """Retrain ML models if sufficient data (50+ samples).

    - 20% holdout validation
    - MAE/RMSE/R2 evaluation
    - 5% improvement threshold for model update
    - MLflow experiment logging
    - Slack notification
    """
    db = get_supabase()

    # Check training data size
    result = db.table("blog_ml_training_data").select("*").execute()
    training_data = result.data or []
    count = len(training_data)

    if count < 50:
        print(f"Insufficient training data: {count}/50. Skipping retrain.")
        return

    print(f"Retraining with {count} samples...")

    # Prepare feature matrix and targets
    X = []
    y_seo = []
    y_aio = []

    for row in training_data:
        features = row.get("features", {})
        feature_vec = [float(features.get(name, 0.0)) for name in FEATURE_NAMES]
        X.append(feature_vec)
        y_seo.append(float(row.get("seo_score", 50.0)))
        y_aio.append(float(row.get("aio_score", 50.0)))

    X_arr = np.array(X)
    y_seo_arr = np.array(y_seo)
    y_aio_arr = np.array(y_aio)

    # Train/test split (20% holdout)
    from sklearn.model_selection import train_test_split

    X_train, X_test, y_seo_train, y_seo_test = train_test_split(
        X_arr, y_seo_arr, test_size=0.2, random_state=42
    )
    _, _, y_aio_train, y_aio_test = train_test_split(
        X_arr, y_aio_arr, test_size=0.2, random_state=42
    )

    # Load current model metrics for comparison
    current_models = (
        db.table("blog_ml_models")
        .select("model_type, mae")
        .eq("is_active", True)
        .execute()
    )
    current_mae: dict[str, float] = {}
    for m in (current_models.data or []):
        current_mae[m["model_type"]] = m.get("mae", float("inf"))

    results: dict[str, dict] = {}

    # Train XGBoost (SEO)
    try:
        from xgboost import XGBRegressor
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

        xgb = XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
        )
        xgb.fit(X_train, y_seo_train)
        y_pred = xgb.predict(X_test)

        mae = float(mean_absolute_error(y_seo_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_seo_test, y_pred)))
        r2 = float(r2_score(y_seo_test, y_pred))

        # Feature importance
        importance = dict(zip(FEATURE_NAMES, [float(v) for v in xgb.feature_importances_]))
        top_features = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10])

        results["xgboost_seo"] = {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "feature_importance": top_features,
        }

        # Check 5% improvement threshold
        prev_mae = current_mae.get("xgboost_seo", float("inf"))
        if mae < prev_mae * 0.95 or prev_mae == float("inf"):
            # Save model
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            model_path = MODELS_DIR / "xgboost_seo.json"
            xgb.save_model(str(model_path))

            # Deactivate old models
            db.table("blog_ml_models").update(
                {"is_active": False}
            ).eq("model_type", "xgboost_seo").eq("is_active", True).execute()

            # Register new model
            version = f"v{count}_{int(mae*100)}"
            db.table("blog_ml_models").insert(
                {
                    "model_type": "xgboost_seo",
                    "model_version": version,
                    "training_size": count,
                    "mae": mae,
                    "rmse": rmse,
                    "r2_score": r2,
                    "feature_importance": top_features,
                    "is_active": True,
                }
            ).execute()

            results["xgboost_seo"]["updated"] = True
            results["xgboost_seo"]["version"] = version
        else:
            results["xgboost_seo"]["updated"] = False

    except ImportError:
        print("XGBoost not installed. Skipping SEO model training.")
    except Exception as e:
        print(f"XGBoost training error: {e}")

    # Train LightGBM (AIO)
    try:
        import lightgbm as lgb
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

        lgb_model = lgb.LGBMRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            verbose=-1,
        )
        lgb_model.fit(X_train, y_aio_train)
        y_pred = lgb_model.predict(X_test)

        mae = float(mean_absolute_error(y_aio_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_aio_test, y_pred)))
        r2 = float(r2_score(y_aio_test, y_pred))

        importance = dict(zip(FEATURE_NAMES, [float(v) for v in lgb_model.feature_importances_]))
        top_features = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10])

        results["lightgbm_aio"] = {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "feature_importance": top_features,
        }

        prev_mae = current_mae.get("lightgbm_aio", float("inf"))
        if mae < prev_mae * 0.95 or prev_mae == float("inf"):
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            model_path = MODELS_DIR / "lightgbm_aio.txt"
            lgb_model.booster_.save_model(str(model_path))

            db.table("blog_ml_models").update(
                {"is_active": False}
            ).eq("model_type", "lightgbm_aio").eq("is_active", True).execute()

            version = f"v{count}_{int(mae*100)}"
            db.table("blog_ml_models").insert(
                {
                    "model_type": "lightgbm_aio",
                    "model_version": version,
                    "training_size": count,
                    "mae": mae,
                    "rmse": rmse,
                    "r2_score": r2,
                    "feature_importance": top_features,
                    "is_active": True,
                }
            ).execute()

            results["lightgbm_aio"]["updated"] = True
            results["lightgbm_aio"]["version"] = version
        else:
            results["lightgbm_aio"]["updated"] = False

    except ImportError:
        print("LightGBM not installed. Skipping AIO model training.")
    except Exception as e:
        print(f"LightGBM training error: {e}")

    # MLflow logging (best-effort)
    try:
        import mlflow

        mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
        mlflow.set_experiment("blog-quality-prediction")

        with mlflow.start_run(run_name=f"retrain_{count}_samples"):
            mlflow.log_param("training_size", count)
            mlflow.log_param("feature_count", len(FEATURE_NAMES))

            for model_type, metrics in results.items():
                mlflow.log_metric(f"{model_type}_mae", metrics.get("mae", 0))
                mlflow.log_metric(f"{model_type}_rmse", metrics.get("rmse", 0))
                mlflow.log_metric(f"{model_type}_r2", metrics.get("r2", 0))

    except Exception:
        pass  # MLflow logging is best-effort

    # Slack notification
    await notify_ml_retrain(count, results)

    print(f"Retraining complete. Results: {json.dumps(results, default=str)}")
