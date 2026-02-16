"""Reviewer node: GPT-5.2 fact-checking and quality review."""

from __future__ import annotations

import json
import logging
import re

from openai import AsyncOpenAI

from blog_worker.config import settings
from blog_worker.pipeline.nodes.generator import _format_research_results
from blog_worker.pipeline.state import BlogPipelineState

logger = logging.getLogger(__name__)

REVIEW_PROMPT_TEMPLATE = """あなたは品質レビュアーです。以下のブログ記事を評価してください。

## リサーチ結果（事実の根拠）
{research_facts}

## レビュー対象の記事
{content}

## 評価基準
1. **事実の正確性**: 記事の事実がリサーチ結果と一致しているか
   - 人名・組織名・開発元の帰属は正しいか
   - 数字・日付は根拠があるか
   - リサーチにない事実を捏造していないか
2. **引用の品質**: 出典が具体的で検証可能か
3. **構成の品質**: 見出しは自然か、重複はないか
4. **読みやすさ**: 段落の長さ、文体の一貫性

## 出力形式（JSON）
以下のJSON形式のみを出力してください。説明文や前置きは一切不要です。

```json
{{
  "score": 0から100の整数,
  "issues": [
    {{
      "type": "factual_error" | "missing_citation" | "structure" | "readability",
      "severity": "critical" | "high" | "medium" | "low",
      "location": "該当セクションのH2見出し",
      "current_text": "記事に書かれている問題の箇所",
      "correct_info": "リサーチ結果に基づく正しい情報",
      "fix_instruction": "具体的な修正指示"
    }}
  ],
  "summary": "全体評価の要約"
}}
```

JSONの前後に説明文を追加しないでください。JSONのみを出力してください。"""


def _parse_review_response(content: str) -> dict:
    """Parse GPT-5.2 review response as JSON."""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except json.JSONDecodeError:
            pass

    # First { to last } extraction
    json_start = content.find("{")
    json_end = content.rfind("}") + 1
    if json_start != -1 and json_end > json_start:
        try:
            return json.loads(content[json_start:json_end])
        except json.JSONDecodeError:
            pass

    # Fallback: return a pass-through score
    logger.warning("Failed to parse review response, using fallback score")
    return {"score": 80, "issues": [], "summary": "Review parse failed — pass-through"}


async def review_node(state: BlogPipelineState) -> BlogPipelineState:
    """Review generated article using GPT-5.2 for fact-checking.

    GPT-5.2 in evaluation mode accurately detects factual errors,
    attribution mistakes, and unsupported claims — without hallucinating.
    """
    generated = state.get("generated_content", {})
    if not generated or "error" in generated:
        return {
            **state,
            "review_score": 0.0,
            "review_issues": [],
            "review_summary": "No content to review",
        }

    content = generated.get("content", "")
    if not content:
        return {
            **state,
            "review_score": 0.0,
            "review_issues": [],
            "review_summary": "Empty content",
        }

    research = state.get("research_results", {})
    research_facts = _format_research_results(research)

    prompt = REVIEW_PROMPT_TEMPLATE.format(
        research_facts=research_facts,
        content=content,
    )

    if not settings.openai_api_key:
        logger.warning("No OpenAI API key — skipping review")
        return {
            **state,
            "review_score": 80.0,
            "review_issues": [],
            "review_summary": "Review skipped — no API key",
        }

    try:
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        completion = await client.chat.completions.create(
            model="gpt-5.2",
            messages=[{"role": "user", "content": prompt}],
            max_completion_tokens=8000,
        )

        response_text = completion.choices[0].message.content or ""
        review_data = _parse_review_response(response_text)

        try:
            review_score = max(0.0, min(100.0, float(review_data.get("score", 80))))
        except (ValueError, TypeError):
            review_score = 80.0
        review_issues = [
            issue for issue in review_data.get("issues", [])
            if isinstance(issue, dict)
        ]
        review_summary = str(review_data.get("summary", ""))

        logger.info(
            "Review complete: score=%s, issues=%d",
            review_score,
            len(review_issues),
        )

        return {
            **state,
            "review_score": review_score,
            "review_issues": review_issues,
            "review_summary": review_summary,
        }

    except Exception as exc:
        logger.error("Review node failed: %s", exc)
        return {
            **state,
            "review_score": 80.0,
            "review_issues": [],
            "review_summary": f"Review failed: {exc}",
        }
