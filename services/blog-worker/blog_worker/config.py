"""Environment configuration using pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # APIs
    openai_api_key: str = ""
    deepseek_api_key: str = ""
    brave_api_key: str = ""
    tavily_api_key: str = ""
    google_ai_api_key: str = ""

    # Slack
    slack_bot_token: str = ""
    slack_default_channel: str = ""

    # GSC
    gsc_site_url: str = "https://nands.tech"
    gsc_credentials_json: str = ""

    # Vercel post-processing bridge
    vercel_api_base: str = "https://nands.tech"
    blog_worker_api_secret: str = ""

    # MLflow
    mlflow_tracking_uri: str = "http://mlflow:5000"

    # Pipeline
    default_target_length: int = 30000
    ml_quality_threshold: int = 40
    max_retries: int = 2

    model_config = {"env_prefix": "", "case_sensitive": False}


settings = Settings()
