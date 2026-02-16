"""CLI エントリーポイント: predict / extract / insights / train"""

import json
import sys

import click
from pydantic import BaseModel, Field

from linkedin_ml.features.extractor import extract_all_features
from linkedin_ml.model.predictor import EngagementPredictor

MAX_TEXT_LENGTH = 10_000


class PredictionInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    day_of_week: int = Field(default=0, ge=0, le=6)
    hour: int = Field(default=10, ge=0, le=23)


def _output_json(data: dict) -> None:
    json.dump(data, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")


def _parse_and_validate(input_json: str) -> PredictionInput | None:
    try:
        raw = json.loads(input_json)
    except json.JSONDecodeError as e:
        _output_json({"error": f"Invalid JSON: {e}"})
        return None

    try:
        return PredictionInput(**raw)
    except Exception as e:
        _output_json({"error": f"Validation error: {e}"})
        return None


@click.group()
def cli() -> None:
    """LinkedIn ML - エンゲージメント予測ツール"""


@cli.command()
@click.option("--input-json", required=True, help="JSON文字列: {text, day_of_week?, hour?}")
@click.option("--model-path", default=None, help="カスタムモデルパス")
def predict(input_json: str, model_path: str | None) -> None:
    """投稿テキストのエンゲージメントを予測"""
    data = _parse_and_validate(input_json)
    if data is None:
        sys.exit(1)

    predictor = EngagementPredictor(model_path)
    result = predictor.predict_from_text(data.text, data.day_of_week, data.hour)
    _output_json(result)


@cli.command()
@click.option("--input-json", required=True, help="JSON文字列: {text}")
def extract(input_json: str) -> None:
    """テキストから特徴量を抽出"""
    data = _parse_and_validate(input_json)
    if data is None:
        sys.exit(1)

    features = extract_all_features(data.text, data.day_of_week, data.hour)
    _output_json({"features": features})


@cli.command()
@click.option("--model-path", default=None, help="カスタムモデルパス")
def insights(model_path: str | None) -> None:
    """モデルのインサイトを表示"""
    predictor = EngagementPredictor(model_path)
    result = predictor.get_insights()
    _output_json(result)


@cli.command()
@click.option("--supabase-url", required=True, help="Supabase URL")
@click.option("--supabase-key", required=True, help="Supabase service role key")
def train(supabase_url: str, supabase_key: str) -> None:
    """実データで XGBoost を再学習"""
    from linkedin_ml.model.trainer import train_model

    result = train_model(supabase_url, supabase_key)
    _output_json(result)
