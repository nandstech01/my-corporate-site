"""Fixer node: GPT-5.2 targeted article correction based on review issues."""

from __future__ import annotations

import logging
import re

from openai import AsyncOpenAI

from blog_worker.config import settings
from blog_worker.pipeline.nodes.generator import _format_research_results
from blog_worker.pipeline.state import BlogPipelineState

logger = logging.getLogger(__name__)

FIX_PROMPT_TEMPLATE = """あなたは編集者です。以下のレビュー結果に基づいてブログ記事を修正してください。

## 修正ルール
- レビューで指摘された問題のみを修正すること
- 問題のない部分は一切変更しないこと
- リサーチ結果に基づいて正確な情報に差し替えること
- 記事全体の文体と構成は維持すること
- Fragment IDは書かないこと（後処理で自動付与）

## リサーチ結果（事実の根拠）
{research_facts}

## レビューで指摘された問題
{formatted_issues}

## 修正対象の記事
{content}

修正した記事全文をMarkdownで出力してください。Markdown本文のみを出力し、前置きや説明は不要です。"""


def _format_issues(issues: list[dict]) -> str:
    """Format review issues into a readable list for the fixer prompt."""
    if not issues:
        return "（指摘なし）"

    parts: list[str] = []
    for i, issue in enumerate(issues, 1):
        severity = issue.get("severity", "medium")
        issue_type = issue.get("type", "unknown")
        location = issue.get("location", "不明")
        current_text = issue.get("current_text", "")
        correct_info = issue.get("correct_info", "")
        fix_instruction = issue.get("fix_instruction", "")

        parts.append(
            f"### 問題{i} [{severity.upper()}] ({issue_type})\n"
            f"- **場所**: {location}\n"
            f"- **現在の記述**: {current_text}\n"
            f"- **正しい情報**: {correct_info}\n"
            f"- **修正指示**: {fix_instruction}"
        )

    return "\n\n".join(parts)


async def fix_node(state: BlogPipelineState) -> BlogPipelineState:
    """Fix article issues detected by the reviewer.

    Only applies targeted fixes — does not regenerate the entire article.
    Skips fixing if review_score >= 80 and no critical/high issues exist.
    """
    review_issues = state.get("review_issues", [])
    review_score = state.get("review_score", 100)

    # Skip if quality is already acceptable
    critical_high = [
        i for i in review_issues if i.get("severity") in ("critical", "high")
    ]
    if review_score >= 80 and not critical_high:
        logger.info(
            "Fix skipped: score=%s, critical/high issues=%d",
            review_score,
            len(critical_high),
        )
        return {**state}

    generated = state.get("generated_content", {})
    if not generated or "error" in generated:
        return {**state}

    content = generated.get("content", "")
    if not content:
        return {**state}

    research = state.get("research_results", {})
    research_facts = _format_research_results(research)
    formatted_issues = _format_issues(review_issues)

    prompt = FIX_PROMPT_TEMPLATE.format(
        research_facts=research_facts,
        formatted_issues=formatted_issues,
        content=content,
    )

    if not settings.openai_api_key:
        logger.warning("No OpenAI API key — skipping fix")
        return {**state}

    try:
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        completion = await client.chat.completions.create(
            model="gpt-5.2",
            messages=[{"role": "user", "content": prompt}],
            max_completion_tokens=40000,
        )

        fixed_content = completion.choices[0].message.content or ""
        if not fixed_content.strip():
            logger.warning("Fixer returned empty content — keeping original")
            return {**state}

        # Strip markdown code block wrapper if present
        stripped = re.sub(r"^```(?:markdown)?\s*\n?", "", fixed_content.strip())
        stripped = re.sub(r"\n?```\s*$", "", stripped)

        # Update generated_content immutably with fixed content
        updated_content = {
            **generated,
            "content": stripped,
            "fixed": True,
            "fix_issues_count": len(review_issues),
        }

        logger.info(
            "Fix applied: %d issues addressed (score was %s)",
            len(review_issues),
            review_score,
        )

        return {**state, "generated_content": updated_content}

    except Exception as exc:
        logger.error("Fix node failed: %s", exc)
        return {**state}
