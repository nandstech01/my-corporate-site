"""Generator node: Article generation with DeepSeek/GPT-5.2."""

from __future__ import annotations

import json
import re

from openai import AsyncOpenAI

from blog_worker.config import settings
from blog_worker.pipeline.state import BlogPipelineState


# ============================================
# Topic entity analysis (port of analyzeTopicEntity)
# ============================================

def _analyze_topic_entity(topic: str, target_keyword: str) -> dict[str, str]:
    lower_topic = (topic + " " + target_keyword).lower()

    if re.search(r"ホームページ|web制作|hp制作|サイト制作", lower_topic) and re.search(
        r"県|市|東京|大阪|名古屋|福岡|札幌|地域", lower_topic
    ):
        return {
            "authorRole": "地域のWeb制作に詳しい専門家",
            "guidance": "【地域密着型サービス紹介記事】\n- 読者は「どの会社に頼めばいいか」を知りたい\n- 具体的な会社名、費用相場、選び方のポイントを重視\n- AIやテクノロジーの話は最小限に\n- 地元の会社の特徴、実績を具体的に紹介",
            "readerNeeds": "信頼できる地元の制作会社を見つけたい、費用相場を知りたい、失敗しない選び方を知りたい",
        }

    if re.search(r"おすすめ|選|比較|ランキング|ベスト", lower_topic):
        return {
            "authorRole": "実際にツール・サービスを使用した専門家",
            "guidance": "【比較・おすすめ記事】\n- 読者は「どれを選べばいいか」の答えを求めている\n- 各選択肢の具体的なメリット・デメリットを明記\n- 価格、機能、使いやすさで比較表を作成\n- 「こんな人にはこれがおすすめ」という明確な結論",
            "readerNeeds": "自分に合った選択肢を見つけたい、比較検討の時間を節約したい",
        }

    if re.search(r"転職|キャリア|エージェント|求人|就職", lower_topic):
        return {
            "authorRole": "キャリアアドバイザー・転職経験者",
            "guidance": "【転職・キャリア支援記事】\n- 読者は不安を抱えながら情報収集している\n- 具体的なエージェント名、サービスの特徴を紹介\n- 成功事例、失敗談を交えて親身なアドバイス\n- 年齢・業界別のおすすめを明確に",
            "readerNeeds": "転職を成功させたい、自分に合ったエージェントを見つけたい",
        }

    if re.search(r"ai|chatgpt|生成ai|rag|mcp|llm", lower_topic):
        return {
            "authorRole": 'AIアーキテクト「原田賢治」',
            "guidance": "【AI技術解説記事】\n- 読者は技術の実践的な使い方を知りたい\n- 概念説明→具体的な活用方法→コード例の流れ\n- 専門用語は必要に応じて使用（ただし解説付き）\n- 実際のプロジェクト経験を交えて信頼性を高める",
            "readerNeeds": "AIを実務に活用したい、最新動向を把握したい",
        }

    if re.search(r"seo|マーケティング|集客|広告|コンテンツ", lower_topic):
        return {
            "authorRole": "Webマーケティングの専門家",
            "guidance": "【SEO・マーケティング記事】\n- 読者は具体的な成果を出す方法を知りたい\n- 施策の優先順位、費用対効果を明確に\n- 具体的な事例（Before/After）を含める\n- ツールや手法の具体名を出す",
            "readerNeeds": "集客を増やしたい、費用対効果の高い施策を知りたい",
        }

    return {
        "authorRole": "業界の専門家",
        "guidance": "【一般的な解説記事】\n- 読者の疑問に直接答える構成\n- 具体例、数字を豊富に使用\n- 専門用語は必要最小限に",
        "readerNeeds": "このトピックについて詳しく知りたい、実践的な情報が欲しい",
    }


# ============================================
# RAG summary builder
# ============================================

def _build_rag_summary(state: BlogPipelineState) -> str:
    sections: list[str] = []

    company = state.get("company_vectors", [])
    if company:
        items = "\n\n".join(
            f"{i+1}. {v.get('section_title', '自社コンテンツ')}\n   {str(v.get('content_chunk', ''))[:300]}..."
            for i, v in enumerate(company[:5])
        )
        sections.append(f"### 自社情報（company_vectors）\n{items}")

    personal = state.get("personal_story_data", [])
    if personal:
        items = "\n\n".join(
            f"{i+1}. {p.get('story_title', 'ストーリー')}\n   {str(p.get('story_content', ''))[:300]}..."
            for i, p in enumerate(personal[:3])
        )
        sections.append(f"### パーソナルストーリー（一次情報）\n{items}")

    kenji = state.get("kenji_thought_data", [])
    if kenji:
        items = "\n\n".join(
            f"{i+1}. 【{k.get('thought_title', '')}】\n   {str(k.get('thought_content', ''))[:400]}..."
            for i, k in enumerate(kenji[:5])
        )
        sections.append(f"### AIアーキテクト思想（原田賢治の視点）\n{items}")

    research = state.get("research_results", {})
    if isinstance(research, dict):
        results_list = research.get("results", [])
        if results_list:
            items = "\n\n".join(
                f"{i+1}. {r.get('title', '')}\n   {str(r.get('content', ''))[:300]}..."
                for i, r in enumerate(results_list[:5])
            )
            sections.append(f"### ディープリサーチ結果\n{items}")

    return "\n\n".join(sections)


def _format_scraped_keywords(keywords: dict) -> str:
    if not keywords or not isinstance(keywords, dict):
        return "（データなし）"

    parts: list[str] = []
    if keywords.get("h1"):
        parts.append(f"【H1キーワード】全て記事に含めること:\n{', '.join(keywords['h1'][:30])}")
    if keywords.get("h2"):
        parts.append(f"【H2キーワード】見出しに使用すること:\n{', '.join(keywords['h2'][:50])}")
    if keywords.get("h3"):
        parts.append(f"【H3キーワード】サブ見出しに使用すること:\n{', '.join(keywords['h3'][:50])}")
    if keywords.get("body"):
        parts.append(f"【本文キーワード】本文に自然に散りばめること:\n{', '.join(keywords['body'][:100])}")

    return "\n\n".join(parts) if parts else "（データなし）"


def _format_research_results(research: dict) -> str:
    if not research or not isinstance(research, dict):
        return "（データなし）"

    results = research.get("results", [])
    if not results:
        findings = research.get("keyFindings", [])
        if findings:
            return "\n".join(f"{i+1}. {f}" for i, f in enumerate(findings[:10]))
        return "（データなし）"

    return "\n\n".join(
        f"{i+1}. **{r.get('title', '')}**\n   {str(r.get('content', ''))[:200]}..."
        for i, r in enumerate(results[:5])
    )


# ============================================
# System prompt builder (port of buildHybridSystemPrompt)
# ============================================

def _build_system_prompt(
    topic: str,
    target_keyword: str,
    category_slug: str,
    target_length: int,
) -> str:
    analysis = _analyze_topic_entity(topic, target_keyword)
    min_length = int(target_length * 0.8)

    return f"""あなたは{analysis['authorRole']}として記事を執筆します。

## 記事生成指示
- **トピック**: {topic}
- **ターゲットキーワード**: {target_keyword}
- **カテゴリ**: {category_slug}
- **目標文字数**: {target_length}文字（必須）

## トピック分析結果（これを踏まえて執筆）
{analysis['guidance']}

## 記事品質要件

### 1. ユーザーファースト（最重要）
- **読者が本当に知りたいこと**: {analysis['readerNeeds']}
- 結論を最初に提示（共感→結論→根拠→方法→体験談→まとめ）
- 実践的なアクションアイテムを含める

### 2. 具体性の徹底
- **必須**: スクレイピングで取得した会社名・サービス名を具体的に記載
- 「A社」「B社」などの抽象的な表現は絶対禁止
- 費用相場は具体的な数字で示す（ただしRAGデータにある情報のみ）

### 3. E-E-A-T（経験・専門性・権威性・信頼性）
- 一次情報（実体験）は補助的に使用
- 読者の悩みへの具体的解決策を優先

### 4. SEO・AIO最適化
- Fragment ID付き見出し（例：## はじめに {{#introduction}}）
- 適切なキーワード密度（2-3%）
- FAQセクション必須（**12問以上**、各{{#faq-1}}～{{#faq-12}}）

### 5. 構造化
- H1→H2→H3の論理的な見出し構造
- 段落は3-4行以内
- 比較表、チェックリストを効果的に使用

### 6. 【絶対条件】文字数要件（最重要）
- **目標文字数: {target_length}文字**（最低{min_length}文字以上）
- H2セクションは最低**20個以上**
- 各H2セクションは**最低2000文字**
- FAQは**15問以上**（各300文字以上）
- 比較表は**3つ以上**
- 具体的事例は**5つ以上**
- スクレイピングキーワードを**全て**記事内に含める

## 【絶対禁止】
- 「A社」「B社」などの匿名表記（具体名を使う）
- RAGにない数字の捏造
- 読者が求めていないAI技術の深堀り

## 出力形式【最重要】

**絶対に以下のJSON形式のみを出力してください。説明文や前置きは一切不要です。**

```json
{{
  "title": "魅力的なブログタイトル（32文字以内、キーワードを含む）",
  "meta_description": "160文字以内のメタディスクリプション",
  "content": "記事本文（Markdown形式、{target_length}文字以上）",
  "seo_keywords": ["メインキーワード", "関連キーワード1", "関連キーワード2"],
  "excerpt": "200文字以内の記事要約",
  "estimated_reading_time": 30,
  "word_count": {target_length}
}}
```

JSONの前後に説明文を追加しないでください。JSONのみを出力してください。"""


# ============================================
# JSON parser (port of parseGeneratedContent)
# ============================================

def _parse_generated_content(content: str) -> dict:
    # Direct JSON parse
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Markdown code block pattern
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

    # Fallback: treat as plain markdown
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "生成された記事"
    paragraphs = [p for p in content.split("\n\n") if p.strip() and not p.startswith("#")]
    meta_desc = paragraphs[0][:160] if paragraphs else content[:160]

    return {
        "title": title,
        "content": content,
        "meta_description": meta_desc,
        "seo_keywords": ["AI", "テクノロジー", "ビジネス"],
        "excerpt": meta_desc,
        "estimated_reading_time": max(1, len(content) // 500),
        "word_count": len(content),
    }


# ============================================
# Generator node
# ============================================

async def generate_node(state: BlogPipelineState) -> BlogPipelineState:
    """Generate blog article using LLM.

    Uses DeepSeek with fallback to GPT-5.2 and GPT-5 mini.
    Replicates the exact prompts from generate-hybrid-blog/route.ts.
    """
    topic = state.get("topic", "")
    target_keyword = state.get("target_keyword", "")
    category_slug = state.get("category_slug", "ai-technology")
    target_length = state.get("target_length", 30000)

    # Build prompt
    system_prompt = _build_system_prompt(topic, target_keyword, category_slug, target_length)
    rag_summary = _build_rag_summary(state)
    scraped_kw = _format_scraped_keywords(state.get("scraped_keywords", {}))

    research = state.get("research_results", {})
    research_text = _format_research_results(research)

    full_prompt = f"""{system_prompt}

## RAG参考データ
{rag_summary}

## スクレイピングキーワード（網羅的に活用）
{scraped_kw}

## ディープリサーチ結果
{research_text}

---

【絶対条件】文字数要件（これを満たさない記事は不合格）

目標文字数: {target_length}文字（最低でも{int(target_length * 0.8)}文字以上）

### 記事構成の必須要件:
1. H2セクション数: 最低20個以上
2. 各H2セクションの文字数: 最低2000文字以上
3. FAQセクション: 15問以上（各回答300文字以上）
4. 比較表: 最低3つ以上
5. チェックリスト: 最低2つ以上
6. 具体的な事例: 最低5つ以上

### キーワード網羅の必須要件:
- スクレイピングで取得したH1キーワード: 全て見出しに使用
- スクレイピングで取得したH2キーワード: 全て見出しに使用
- スクレイピングで取得した本文キーワード: 全て本文に散りばめる"""

    # Model fallback chain: DeepSeek -> GPT-5.2 -> GPT-5 mini -> GPT-4o-mini
    models_to_try: list[tuple[str, str, dict]] = []

    if settings.deepseek_api_key:
        models_to_try.append((
            "https://api.deepseek.com",
            "deepseek-chat",
            {"api_key": settings.deepseek_api_key, "base_url": "https://api.deepseek.com"},
        ))

    if settings.openai_api_key:
        models_to_try.extend([
            (None, "gpt-5.2", {"api_key": settings.openai_api_key}),
            (None, "gpt-5-mini", {"api_key": settings.openai_api_key}),
            (None, "gpt-4o-mini", {"api_key": settings.openai_api_key}),
        ])

    generated_content: str | None = None
    generation_model: str = "unknown"

    for base_url, model_name, client_kwargs in models_to_try:
        try:
            client = AsyncOpenAI(**client_kwargs)

            # DeepSeek uses max_completion_tokens, OpenAI reasoning models too
            if "deepseek" in model_name:
                completion = await client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": full_prompt}],
                    max_completion_tokens=8000,
                    temperature=0.8,
                )
            elif model_name.startswith("gpt-5"):
                # GPT-5 series are reasoning models - no temperature param
                completion = await client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": full_prompt}],
                    max_completion_tokens=40000,
                )
            else:
                completion = await client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": full_prompt}],
                    max_tokens=16000,
                    temperature=0.8,
                )

            content = completion.choices[0].message.content
            if content:
                generated_content = content
                generation_model = model_name
                break

        except Exception:
            continue

    if not generated_content:
        return {**state, "generated_content": {"error": "All models failed"}}

    # Parse the generated content
    blog_data = _parse_generated_content(generated_content)
    blog_data["generation_model"] = generation_model

    return {**state, "generated_content": blog_data}
