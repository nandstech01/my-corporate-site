"""Scraper node: Brave Search + BeautifulSoup keyword extraction."""

from __future__ import annotations

import asyncio
import re
from collections import Counter
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from blog_worker.config import settings
from blog_worker.db import update_job_status
from blog_worker.pipeline.state import BlogPipelineState

# Excluded domains (EC sites, SNS, aggregators, etc.)
EXCLUDED_DOMAINS = frozenset([
    "amazon.co.jp", "amazon.com", "rakuten.co.jp", "shopping.yahoo.co.jp",
    "kakaku.com", "biccamera.com", "yodobashi.com",
    "news.yahoo.co.jp", "news.google.com", "smartnews.com",
    "prtimes.jp", "dreamnews.jp", "value-press.com", "atpress.ne.jp",
    "twitter.com", "x.com", "facebook.com", "instagram.com", "tiktok.com",
    "livedoor.com", "ameblo.jp", "note.com", "qiita.com",
    "wikipedia.org", "weblio.jp",
    "indeed.com", "doda.jp", "rikunabi.com", "mynavi.jp",
    "youtube.com", "nicovideo.jp",
])

EXCLUDED_PATTERNS = [
    re.compile(r"/ad/", re.I),
    re.compile(r"/sponsor", re.I),
    re.compile(r"/pr/", re.I),
    re.compile(r"affiliate", re.I),
    re.compile(r"\.pdf$", re.I),
]

STOP_WORDS = frozenset([
    "です", "ます", "した", "する", "ある", "いる", "なる", "できる",
    "この", "その", "あの", "どの", "これ", "それ", "あれ", "どれ",
    "こと", "もの", "ため", "ほど", "など", "まで", "から", "より",
    "として", "について", "において", "による", "によって",
    "こちら", "そちら", "あちら", "こっち", "そっち",
    "the", "and", "for", "are", "but", "not", "you", "all", "can",
    "www", "com", "http", "https", "html", "php", "asp",
])

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _extract_domain(url: str) -> str:
    try:
        return urlparse(url).hostname.replace("www.", "") if urlparse(url).hostname else ""
    except Exception:
        return ""


def _is_excluded(url: str) -> bool:
    domain = _extract_domain(url)
    if any(d in domain for d in EXCLUDED_DOMAINS):
        return True
    if any(p.search(url) for p in EXCLUDED_PATTERNS):
        return True
    return False


def _extract_keywords_from_text(text: str, *, is_body: bool = False) -> list[str]:
    if not text or len(text) < 3:
        return []

    cleaned = re.sub(r"[\n\r\t]+", " ", text)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"[「」『』【】（）\(\)［］\[\]｛｝\{\}]", " ", cleaned)
    cleaned = re.sub(r"[!！?？。、,，.:：;；]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Japanese keywords (2+ characters)
    japanese = re.findall(r"[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,}", cleaned)
    # English keywords (2+ characters)
    english = re.findall(r"[A-Za-z0-9][A-Za-z0-9\-]{1,}[A-Za-z0-9]", cleaned)
    # Compound keywords (e.g. AI活用)
    compound = re.findall(r"[A-Za-z0-9]+[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+", cleaned)

    all_words = list(dict.fromkeys(japanese + english + compound))  # dedupe preserving order
    all_words = [
        w for w in all_words
        if w.lower() not in STOP_WORDS and not re.match(r"^\d+$", w) and len(w) >= 2
    ]

    if is_body:
        freq = Counter(all_words)
        return [w for w, _ in freq.most_common(100)]

    return all_words


async def _fetch_top_urls(client: httpx.AsyncClient, query: str, max_sites: int = 5) -> list[str]:
    if not settings.brave_api_key:
        return []

    resp = await client.get(
        "https://api.search.brave.com/res/v1/web/search",
        params={"q": query, "count": str(min(max_sites + 10, 20)), "country": "JP", "search_lang": "jp"},
        headers={"Accept": "application/json", "X-Subscription-Token": settings.brave_api_key},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    results = data.get("web", {}).get("results", [])

    urls: list[str] = []
    for r in results:
        url = r.get("url", "")
        if r.get("is_ad"):
            continue
        if _is_excluded(url):
            continue
        urls.append(url)
        if len(urls) >= max_sites:
            break

    return urls


async def _scrape_keywords_from_url(client: httpx.AsyncClient, url: str) -> dict[str, list[str]]:
    keywords: dict[str, list[str]] = {"h1": [], "h2": [], "h3": [], "body": []}

    try:
        resp = await client.get(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html", "Accept-Language": "ja,en-US;q=0.7"},
            timeout=15,
            follow_redirects=True,
        )
        if resp.status_code != 200:
            return keywords

        soup = BeautifulSoup(resp.text, "html.parser")

        for tag_name, key in [("h1", "h1"), ("h2", "h2"), ("h3", "h3")]:
            for tag in soup.find_all(tag_name):
                text = tag.get_text(strip=True)
                keywords[key].extend(_extract_keywords_from_text(text))

        # Body text from main content areas
        main_content = ""
        for selector in ["main", "article", ".content", ".post", ".entry", "#content", "#main"]:
            el = soup.select_one(selector)
            if el:
                main_content = el.get_text()
                break

        if not main_content:
            for tag in soup.find_all(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()
            body = soup.find("body")
            main_content = body.get_text() if body else ""

        keywords["body"] = _extract_keywords_from_text(main_content, is_body=True)

    except Exception:
        pass

    return keywords


def _consolidate_keywords(all_kw: list[dict[str, list[str]]]) -> dict[str, list[str]]:
    consolidated: dict[str, Counter] = {"h1": Counter(), "h2": Counter(), "h3": Counter(), "body": Counter()}
    for kw_dict in all_kw:
        for ktype in ("h1", "h2", "h3", "body"):
            for word in kw_dict.get(ktype, []):
                consolidated[ktype][word.lower()] += 1

    return {
        ktype: [w for w, _ in counter.most_common()] for ktype, counter in consolidated.items()
    }


async def _run_scrape_query(client: httpx.AsyncClient, query: str) -> dict[str, list[str]]:
    if not query:
        return {"h1": [], "h2": [], "h3": [], "body": []}

    urls = await _fetch_top_urls(client, query, max_sites=5)
    if not urls:
        return {"h1": [], "h2": [], "h3": [], "body": []}

    tasks = [_scrape_keywords_from_url(client, url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    valid_results = [r for r in results if isinstance(r, dict)]
    return _consolidate_keywords(valid_results)


async def scrape_node(state: BlogPipelineState) -> BlogPipelineState:
    """Scrape top search results for keyword extraction.

    Brave Search API -> top 5 sites x 2 queries.
    BeautifulSoup -> H1/H2/H3/body keyword extraction.
    """
    topic = state.get("topic", "")
    target_keyword = state.get("target_keyword", "")

    # Generate 2 search queries
    query1 = f"{target_keyword} おすすめ 2025"
    query2 = f"{topic} 比較 選び方"

    async with httpx.AsyncClient() as client:
        kw1, kw2 = await asyncio.gather(
            _run_scrape_query(client, query1),
            _run_scrape_query(client, query2),
        )

    # Merge keywords from both queries
    merged: dict[str, list[str]] = {}
    for ktype in ("h1", "h2", "h3", "body"):
        seen: set[str] = set()
        merged_list: list[str] = []
        for word in kw1.get(ktype, []) + kw2.get(ktype, []):
            low = word.lower()
            if low not in seen:
                seen.add(low)
                merged_list.append(word)
        merged[ktype] = merged_list

    return {
        **state,
        "scraped_keywords": merged,
        "scrape_query1": query1,
        "scrape_query2": query2,
    }
