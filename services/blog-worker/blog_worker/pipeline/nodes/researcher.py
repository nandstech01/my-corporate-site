"""Researcher node: Tavily + DeepSeek iterative deep research."""

from __future__ import annotations

import asyncio
import json
import re
from urllib.parse import urlparse

import httpx
from openai import AsyncOpenAI

from blog_worker.config import settings
from blog_worker.pipeline.state import BlogPipelineState


def _extract_domain(url: str) -> str:
    try:
        host = urlparse(url).hostname
        return host.replace("www.", "") if host else "Unknown"
    except Exception:
        return "Unknown"


def _clean_json(text: str) -> str:
    """Remove trailing commas and normalise whitespace for JSON parsing."""
    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)
    text = re.sub(r"[\r\n]+", " ", text)
    return text.strip()


def _parse_json_from_response(text: str, key: str | None = None) -> list:
    """Extract a JSON array from LLM response text, with fallback to bullet extraction."""
    patterns = [
        re.compile(r"```json\s*([\s\S]*?)\s*```"),
        re.compile(r'\{[\s\S]*"' + (key or "learnings") + r'"[\s\S]*\}'),
        re.compile(r"\[[\s\S]*\]"),
    ]
    for pat in patterns:
        m = pat.search(text)
        if m:
            raw = m.group(1) if m.lastindex else m.group(0)
            try:
                parsed = json.loads(_clean_json(raw))
                if isinstance(parsed, list):
                    return parsed
                if key and key in parsed:
                    return parsed[key]
                if "learnings" in parsed:
                    return parsed["learnings"]
                if "queries" in parsed:
                    return parsed["queries"]
            except json.JSONDecodeError:
                continue

    # Fallback: bullet points
    bullets = re.findall(r"[-\u2022]\s*([^\n]+)", text)
    return [b.strip() for b in bullets[:10]] if bullets else []


async def _search_tavily(client: httpx.AsyncClient, query: str) -> list[dict]:
    """Search with Tavily API."""
    if not settings.tavily_api_key:
        return []

    try:
        resp = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": settings.tavily_api_key,
                "query": query,
                "search_depth": "advanced",
                "include_answer": True,
                "include_raw_content": False,
                "max_results": 10,
                "exclude_domains": [
                    "amazon.co.jp", "rakuten.co.jp", "twitter.com",
                    "facebook.com", "instagram.com", "youtube.com",
                    "tiktok.com", "pinterest.com",
                ],
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()

        results: list[dict] = []
        if data.get("answer"):
            results.append({
                "title": f"AI\u5206\u6790: {query}",
                "content": data["answer"],
                "url": "",
                "source": "Tavily AI",
                "score": 1.0,
            })

        for i, r in enumerate(data.get("results", [])):
            results.append({
                "title": r.get("title", ""),
                "content": r.get("content", ""),
                "url": r.get("url", ""),
                "source": _extract_domain(r.get("url", "")),
                "published_date": r.get("published_date"),
                "score": r.get("score", 1 - i * 0.05),
            })

        return results
    except Exception:
        return []


async def _analyze_with_llm(
    llm: AsyncOpenAI,
    model: str,
    topic: str,
    results: list[dict],
    existing_learnings: list[str],
) -> list[str]:
    """Analyze search results with LLM and extract learnings."""
    if not results:
        return []

    existing_text = "\n".join(f"- {l}" for l in existing_learnings[-10:]) or "\uff08\u306a\u3057\uff09"
    results_text = "\n\n".join(
        f"\u3010{r['title']}\u3011({r.get('source', '')})\n{r['content'][:500]}"
        for r in results[:5]
    )

    prompt = f"""\u3042\u306a\u305f\u306f\u5c02\u9580\u7684\u306a\u30ea\u30b5\u30fc\u30c1\u30e3\u30fc\u3067\u3059\u3002\u4ee5\u4e0b\u306e\u691c\u7d22\u7d50\u679c\u304b\u3089\u3001\u300c{topic}\u300d\u306b\u95a2\u3059\u308b\u91cd\u8981\u306a\u77e5\u8b58\u3092\u62bd\u51fa\u3057\u3066\u304f\u3060\u3055\u3044\u3002

## \u65e2\u5b58\u306e\u77e5\u8b58\uff08\u91cd\u8907\u3057\u306a\u3044\u3053\u3068\uff09
{existing_text}

## \u691c\u7d22\u7d50\u679c
{results_text}

## \u62bd\u51fa\u30eb\u30fc\u30eb
1. \u5177\u4f53\u7684\u306a\u6570\u5b57\u30fb\u7d71\u8a08\u30c7\u30fc\u30bf\u3092\u512a\u5148
2. \u4f1a\u793e\u540d\u30fb\u30b5\u30fc\u30d3\u30b9\u540d\u30fb\u4eba\u540d\u306a\u3069\u306e\u56fa\u6709\u540d\u8a5e\u3092\u542b\u3081\u308b
3. \u6700\u65b0\u306e\u30c8\u30ec\u30f3\u30c9\u3084\u5909\u5316\u3092\u7279\u5b9a
4. 1\u3064\u306e\u77e5\u8b58\u306f1-3\u6587\u3067\u7c21\u6f54\u306b
5. \u65e2\u5b58\u306e\u77e5\u8b58\u3068\u91cd\u8907\u3057\u306a\u3044\u3053\u3068

## \u51fa\u529b\u5f62\u5f0f\uff08JSON\uff09
```json
{{"learnings": ["\u77e5\u8b581", "\u77e5\u8b582", ...]}}
```"""

    try:
        completion = await llm.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.3,
        )
        text = completion.choices[0].message.content or ""
        items = _parse_json_from_response(text, "learnings")
        return [str(item) if not isinstance(item, str) else item for item in items]
    except Exception:
        return []


async def _generate_queries(
    llm: AsyncOpenAI,
    model: str,
    topic: str,
    research_type: str,
    learnings: list[str],
    count: int,
) -> list[str]:
    """Generate additional search queries based on current learnings."""
    recent = "\n".join(f"- {l}" for l in learnings[-15:])

    prompt = f"""\u3042\u306a\u305f\u306f\u5c02\u9580\u7684\u306a\u30ea\u30b5\u30fc\u30c1\u30e3\u30fc\u3067\u3059\u3002\u300c{topic}\u300d\u306b\u3064\u3044\u3066\u3088\u308a\u6df1\u304f\u8abf\u67fb\u3059\u308b\u305f\u3081\u306b\u3001\u8ffd\u52a0\u306e\u691c\u7d22\u30af\u30a8\u30ea\u3092{count}\u500b\u751f\u6210\u3057\u3066\u304f\u3060\u3055\u3044\u3002

## \u3053\u308c\u307e\u3067\u306e\u5b66\u7fd2\u5185\u5bb9
{recent}

## \u30ea\u30b5\u30fc\u30c1\u30bf\u30a4\u30d7: {research_type}

## \u30eb\u30fc\u30eb
1. \u307e\u3060\u8abf\u67fb\u3057\u3066\u3044\u306a\u3044\u89d2\u5ea6\u304b\u3089\u8cea\u554f\u3092\u751f\u6210
2. \u5177\u4f53\u7684\u3067\u691c\u7d22\u3057\u3084\u3059\u3044\u30af\u30a8\u30ea\u306b\u3059\u308b
3. \u65e5\u672c\u8a9e\u306e\u30af\u30a8\u30ea\u3092\u751f\u6210
4. \u6570\u5b57\u3084\u5177\u4f53\u7684\u306a\u6761\u4ef6\u3092\u542b\u3081\u308b

## \u51fa\u529b\u5f62\u5f0f\uff08JSON\uff09
```json
{{"queries": ["\u30af\u30a8\u30ea1", "\u30af\u30a8\u30ea2", ...]}}
```"""

    try:
        completion = await llm.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7,
        )
        text = completion.choices[0].message.content or ""
        queries = _parse_json_from_response(text, "queries")
        return [str(q) for q in queries[:count]]
    except Exception:
        return [
            f"{topic} \u6599\u91d1 \u4fa1\u683c \u8cbb\u7528\u76f8\u5834",
            f"{topic} \u5c0e\u5165\u4e8b\u4f8b \u6210\u529f\u4e8b\u4f8b",
            f"{topic} \u30e1\u30ea\u30c3\u30c8 \u30c7\u30e1\u30ea\u30c3\u30c8 \u6ce8\u610f\u70b9",
        ][:count]


async def _generate_final_report(
    llm: AsyncOpenAI,
    model: str,
    topic: str,
    research_type: str,
    learnings: list[str],
) -> dict:
    """Generate a final research report."""
    all_text = "\n".join(f"- {l}" for l in learnings)

    prompt = f"""\u3042\u306a\u305f\u306f\u5c02\u9580\u7684\u306a\u30ea\u30b5\u30fc\u30c1\u30e3\u30fc\u3067\u3059\u3002\u300c{topic}\u300d\u306b\u3064\u3044\u3066\u306e\u8abf\u67fb\u7d50\u679c\u304b\u3089\u5305\u62ec\u7684\u306a\u30ec\u30dd\u30fc\u30c8\u3092\u4f5c\u6210\u3057\u3066\u304f\u3060\u3055\u3044\u3002

## \u53ce\u96c6\u3057\u305f\u77e5\u8b58\uff08{len(learnings)}\u4ef6\uff09
{all_text}

## \u30ec\u30dd\u30fc\u30c8\u8981\u4ef6
- summary: 300-500\u6587\u5b57\u306e\u30b5\u30de\u30ea\u30fc
- keyFindings: **\u5fc5\u305a7\u500b\u4ee5\u4e0a**\u3001\u5404\u9805\u76ee\u306b\u5177\u4f53\u7684\u306a\u6570\u5b57\u3092\u542b\u3080
- recommendations: 3-5\u500b\u306e\u30a2\u30af\u30b7\u30e7\u30f3

## \u51fa\u529b\u5f62\u5f0f\uff08JSON\uff09
```json
{{
  "summary": "\u30b5\u30de\u30ea\u30fc",
  "keyFindings": ["\u767a\u898b1", "\u767a\u898b2", ...],
  "recommendations": ["\u63a8\u59681", "\u63a8\u59682", ...]
}}
```"""

    try:
        completion = await llm.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,
            temperature=0.3,
        )
        text = completion.choices[0].message.content or ""

        for pat in [
            re.compile(r"```json\s*([\s\S]*?)\s*```"),
            re.compile(r'\{[\s\S]*"summary"[\s\S]*\}'),
        ]:
            m = pat.search(text)
            if m:
                raw = m.group(1) if m.lastindex else m.group(0)
                try:
                    parsed = json.loads(_clean_json(raw))
                    # Ensure at least 7 key findings
                    findings = parsed.get("keyFindings", [])
                    if len(findings) < 7:
                        extra = [l for l in learnings if l not in findings][: 7 - len(findings)]
                        findings.extend(extra)
                        parsed["keyFindings"] = findings
                    return parsed
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass

    # Fallback
    return {
        "summary": f"{topic}\u306b\u3064\u3044\u3066\u306e\u30ea\u30b5\u30fc\u30c1\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\u3002{len(learnings)}\u4ef6\u306e\u77e5\u8b58\u3092\u53ce\u96c6\u3002",
        "keyFindings": learnings[:10],
        "recommendations": ["\u8a73\u7d30\u306a\u5206\u6790\u3092\u7d9a\u3051\u308b\u3053\u3068\u3092\u63a8\u5968"],
    }


def _generate_initial_query(topic: str, research_type: str) -> str:
    templates = {
        "trend": f"{topic} \u6700\u65b0\u52d5\u5411 2025 \u30c8\u30ec\u30f3\u30c9",
        "comparison": f"{topic} \u6bd4\u8f03 \u304a\u3059\u3059\u3081 \u30e9\u30f3\u30ad\u30f3\u30b0 2025",
        "technical": f"{topic} \u4ed5\u7d44\u307f \u6280\u8853 \u5b9f\u88c5\u65b9\u6cd5",
        "market": f"{topic} \u5e02\u5834\u898f\u6a21 \u30b7\u30a7\u30a2 \u6210\u9577\u7387",
    }
    return templates.get(research_type, templates["trend"])


async def research_node(state: BlogPipelineState) -> BlogPipelineState:
    """Deep research using Tavily API + DeepSeek/OpenAI.

    Iterative deepening: depth=2, breadth=3.
    Produces 7+ key findings with numeric data.
    """
    topic = state.get("topic", "")
    target_keyword = state.get("target_keyword", "")
    depth = 2
    breadth = 3

    # Determine research queries
    query1 = f"{topic} {target_keyword} \u6700\u65b0\u52d5\u5411 2025"
    query2 = f"{topic} \u6bd4\u8f03 \u5c0e\u5165\u4e8b\u4f8b 2025"

    # Set up LLM client
    if settings.deepseek_api_key:
        llm = AsyncOpenAI(api_key=settings.deepseek_api_key, base_url="https://api.deepseek.com")
        model = "deepseek-chat"
    elif settings.openai_api_key:
        llm = AsyncOpenAI(api_key=settings.openai_api_key)
        model = "gpt-4o-mini"
    else:
        # No LLM available - return empty results
        return {**state, "research_results": {}, "research_query1": query1, "research_query2": query2}

    all_learnings: list[str] = []
    all_results: list[dict] = []

    async with httpx.AsyncClient() as http:
        # Initial search for both queries
        for query, research_type in [(query1, "trend"), (query2, "comparison")]:
            initial_query = _generate_initial_query(
                query.split()[0] if query else topic, research_type
            )
            results = await _search_tavily(http, initial_query)
            all_results.extend(results)

            # Analyze initial results
            new_learnings = await _analyze_with_llm(llm, model, topic, results, all_learnings)
            all_learnings.extend(new_learnings)

            # Iterative deepening
            for d in range(depth):
                queries = await _generate_queries(
                    llm, model, topic, research_type, all_learnings, breadth
                )
                for q in queries:
                    search_results = await _search_tavily(http, q)
                    all_results.extend(search_results)

                    analysis = await _analyze_with_llm(
                        llm, model, topic, search_results, all_learnings
                    )
                    all_learnings.extend(analysis)

                    # Rate limit
                    await asyncio.sleep(1)

    # Generate final report
    report = await _generate_final_report(llm, model, topic, "trend", all_learnings)

    return {
        **state,
        "research_results": {
            "summary": report.get("summary", ""),
            "keyFindings": report.get("keyFindings", []),
            "recommendations": report.get("recommendations", []),
            "learnings": all_learnings[:30],
            "results": all_results[:20],
            "totalLearnings": len(all_learnings),
            "totalResults": len(all_results),
        },
        "research_query1": query1,
        "research_query2": query2,
    }
