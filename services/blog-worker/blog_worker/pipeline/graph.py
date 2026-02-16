"""LangGraph StateGraph definition for blog generation pipeline."""

from __future__ import annotations

import traceback

from langgraph.graph import END, StateGraph

from blog_worker.db import get_supabase, update_job_status
from blog_worker.pipeline.edges.quality_gate import quality_gate
from blog_worker.pipeline.nodes.fixer import fix_node
from blog_worker.pipeline.nodes.generator import generate_node
from blog_worker.pipeline.nodes.ml_scorer import ml_score_node
from blog_worker.pipeline.nodes.post_processor import post_process_node
from blog_worker.pipeline.nodes.publisher import publish_node
from blog_worker.pipeline.nodes.rag_query import rag_query_node
from blog_worker.pipeline.nodes.researcher import research_node
from blog_worker.pipeline.nodes.reviewer import review_node
from blog_worker.pipeline.nodes.scraper import scrape_node
from blog_worker.pipeline.state import BlogPipelineState
from blog_worker.slack.notifier import notify_error


# ============================================================
# Progress-tracking wrapper nodes
# ============================================================

async def _scrape_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="scrape", progress_pct=5)
    return await scrape_node(state)


async def _research_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="research", progress_pct=15)
    return await research_node(state)


async def _rag_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="rag", progress_pct=40)
    return await rag_query_node(state)


async def _generate_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="generate", progress_pct=50)
    return await generate_node(state)


async def _review_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="review", progress_pct=60)
    return await review_node(state)


async def _fix_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="fix", progress_pct=65)
    return await fix_node(state)


async def _ml_score_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="ml_score", progress_pct=70)
    result = await ml_score_node(state)
    await update_job_status(
        job_id,
        ml_score=result.get("ml_score"),
        ml_breakdown=result.get("ml_breakdown"),
    )
    return result


async def _post_process_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="post_process", progress_pct=80)
    return await post_process_node(state)


async def _publish_with_progress(state: BlogPipelineState) -> BlogPipelineState:
    job_id = state.get("job_id", "")
    await update_job_status(job_id, current_step="publish", progress_pct=90)
    return await publish_node(state)


# ============================================================
# Quality gate edge: retry generation or proceed
# ============================================================

def _quality_gate_edge(state: BlogPipelineState) -> str:
    decision = quality_gate(state)
    if decision == "generate":
        # Bump retry count immutably via state update in the generate node
        return "generate"
    return "post_process"


# ============================================================
# Retry counter node (increment before re-generation)
# ============================================================

async def _increment_retry(state: BlogPipelineState) -> BlogPipelineState:
    return {**state, "retry_count": state.get("retry_count", 0) + 1}


# ============================================================
# Build the LangGraph StateGraph
# ============================================================

def build_pipeline_graph() -> StateGraph:
    graph = StateGraph(BlogPipelineState)

    # Add nodes
    graph.add_node("scrape", _scrape_with_progress)
    graph.add_node("research", _research_with_progress)
    graph.add_node("rag_query", _rag_with_progress)
    graph.add_node("generate", _generate_with_progress)
    graph.add_node("review", _review_with_progress)
    graph.add_node("fix", _fix_with_progress)
    graph.add_node("ml_score", _ml_score_with_progress)
    graph.add_node("increment_retry", _increment_retry)
    graph.add_node("post_process", _post_process_with_progress)
    graph.add_node("publish", _publish_with_progress)

    # Linear edges: scrape -> research -> rag_query -> generate -> review -> fix -> ml_score
    graph.add_edge("scrape", "research")
    graph.add_edge("research", "rag_query")
    graph.add_edge("rag_query", "generate")
    graph.add_edge("generate", "review")
    graph.add_edge("review", "fix")
    graph.add_edge("fix", "ml_score")

    # Conditional edge: ml_score -> post_process OR generate (via retry)
    graph.add_conditional_edges(
        "ml_score",
        _quality_gate_edge,
        {
            "generate": "increment_retry",
            "post_process": "post_process",
        },
    )
    graph.add_edge("increment_retry", "generate")

    # Final edges
    graph.add_edge("post_process", "publish")
    graph.add_edge("publish", END)

    # Entry point
    graph.set_entry_point("scrape")

    return graph


# Compiled graph (module-level singleton)
_compiled_graph = None


def get_compiled_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_pipeline_graph().compile()
    return _compiled_graph


# ============================================================
# Public entry point
# ============================================================

async def run_blog_pipeline(job_id: str) -> None:
    """Execute the full blog generation pipeline for a given job."""
    db = get_supabase()

    # Fetch job data
    result = db.table("blog_jobs").select("*").eq("id", job_id).single().execute()
    job = result.data
    if not job:
        raise ValueError(f"Job {job_id} not found")

    await update_job_status(job_id, status="running", current_step="scrape", progress_pct=0)

    try:
        # Initialize state
        initial_state: BlogPipelineState = {
            "job_id": job_id,
            "topic": job["topic"],
            "target_keyword": job["target_keyword"],
            "category_slug": job["category_slug"],
            "business_category": job.get("business_category", "ai-technology"),
            "target_length": 12000,
            "retry_count": 0,
            "error": None,
        }

        # Run the LangGraph pipeline
        compiled = get_compiled_graph()
        final_state = await compiled.ainvoke(initial_state)

        # Final status and Slack notification are handled by publish_node

    except Exception as exc:
        error_msg = f"{exc}\n{traceback.format_exc()}"
        await update_job_status(job_id, status="failed", error_message=error_msg[:2000])
        await notify_error(job_id, error_msg)
        raise
