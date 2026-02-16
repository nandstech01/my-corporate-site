"""Entry point: CLI for Cloud Run Job + FastAPI for local dev."""

import asyncio
import sys

import click


@click.group()
def cli() -> None:
    """Blog Worker CLI."""


@cli.command()
@click.option("--job-id", required=True, help="blog_jobs UUID")
def run_pipeline(job_id: str) -> None:
    """Run the full blog generation pipeline."""
    from blog_worker.pipeline.graph import run_blog_pipeline

    asyncio.run(run_blog_pipeline(job_id))


@cli.command()
def collect_gsc() -> None:
    """Collect daily GSC metrics."""
    from blog_worker.gsc.collector import collect_gsc_data

    asyncio.run(collect_gsc_data())


@cli.command()
def label_posts() -> None:
    """Label posts with 14-day GSC performance."""
    from blog_worker.gsc.labeler import label_published_posts

    asyncio.run(label_published_posts())


@cli.command()
def retrain_ml() -> None:
    """Retrain ML models with latest data."""
    from blog_worker.ml.training import retrain_models

    asyncio.run(retrain_models())


@cli.command()
@click.option("--port", default=8001, help="Port for local dev server")
def serve(port: int) -> None:
    """Start FastAPI dev server."""
    import uvicorn
    from fastapi import FastAPI

    app = FastAPI(title="Blog Worker Dev")

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok", "service": "blog-worker"}

    uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    cli()
