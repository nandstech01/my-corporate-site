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
                f"{i+1}. **{r.get('title', '')}** ({r.get('source', '')})\n"
                f"   URL: {r.get('url', '')}\n"
                f"   {str(r.get('content', ''))[:300]}..."
                for i, r in enumerate(results_list[:10])
            )
            sections.append(f"### ディープリサーチ結果\n{items}")

    youtube = state.get("youtube_rag_data", [])
    if youtube:
        items = "\n\n".join(
            f"{i+1}. 「{y.get('video_title', '')}」（{y.get('channel_name', '')}）\n"
            f"   {str(y.get('content', ''))[:400]}...\n"
            f"   URL: {y.get('video_url', '')}"
            for i, y in enumerate(youtube[:5])
        )
        sections.append(f"### 海外教育コンテンツ（YouTube）\n{items}")

    return "\n\n".join(sections)


def _format_scraped_keywords(keywords: dict) -> str:
    if not keywords or not isinstance(keywords, dict):
        return "（データなし）"

    # Collect top-10 keywords across all sources for natural placement
    all_kw: list[str] = []
    for key in ("h1", "h2", "h3", "body"):
        all_kw.extend(keywords.get(key, []))

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for kw in all_kw:
        lower = kw.lower()
        if lower not in seen:
            seen.add(lower)
            unique.append(kw)

    top10 = unique[:10]
    if not top10:
        return "（データなし）"

    return (
        f"【重要キーワードTop10】本文中に自然に散りばめること（見出しには無理に入れない）:\n"
        f"{', '.join(top10)}"
    )


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
        f"{i+1}. **{r.get('title', '')}** ({r.get('source', '')})\n"
        f"   URL: {r.get('url', '')}\n"
        f"   {str(r.get('content', ''))[:300]}..."
        for i, r in enumerate(results[:10])
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

    return f"""あなたは{analysis['authorRole']}として、読者の検索意図に直接応える高品質な記事を執筆します。

## 記事生成指示
- **トピック**: {topic}
- **ターゲットキーワード**: {target_keyword}
- **カテゴリ**: {category_slug}
- **目標文字数**: {target_length}文字（{min_length}〜{target_length}文字）

## トピック分析結果
{analysis['guidance']}

## 読者の検索意図
{analysis['readerNeeds']}

## 記事構成（この流れで書く）
共感（読者の悩みに寄り添う）→ 結論（答えを先に提示）→ 根拠（データ・一次情報で裏付け）→ 方法（実践ステップ）→ 体験談（Before/After）→ まとめ（アクションアイテム）

## 見出しルール
- **自然な日本語**で書く（「Claude Codeの料金プランと選び方」○ / 「claude code 料金 比較 選び方」×）
- Fragment IDは書かない（後処理で自動付与するのでプレーンな見出しのみ）
- H2は**8〜12個**（内容密度を優先、水増ししない）
- H3は必要に応じて各H2内に2〜4個

## 引用ルール（最低5箇所の一次情報引用を含めること）
- ディープリサーチ結果は「[出典名](URL)によると〜」で引用
- YouTube RAGは「海外の専門家（チャンネル名）の解説では〜」で引用
- 公式サイト（Anthropic, OpenAI等）は直接リンク
- cited_sourcesフィールドに引用元をまとめること

## 体験談ルール
- リサーチで得た具体的操作手順を「実際に試してみると〜」視点で書く
- Before/After形式（導入前→導入後の変化）を含める
- 具体的な作業時間・工数の比較があると良い
- 推測の場合は「推測ですが〜」「一般的に〜」と明示（嘘の回避）

## 自社RAG・パーソナルRAGの活用
- 自社情報（company_vectors）やパーソナルストーリーが提供された場合、記事の冒頭や体験談セクションに**さりげなく1箇所だけ**織り込む
- 例:「nands.techでの導入事例では〜」「筆者自身のAI開発経験から〜」
- 量は少なくてよい（全体の1%程度）が、E-E-AT Experienceの差別化になる
- 自社RAGデータがない場合は無理に挿入しない

## キーワード配置
- スクレイピングTop10キーワードは**本文中に自然に散りばめる**
- 見出しには無理に入れない（自然なら入れてOK）
- キーワード密度1.5〜2.5%（過剰回避）

## FAQセクション
- **5〜8問**（本当に読者が検索しそうな質問のみ）
- 各回答は200〜400文字で的確に
- 「### Q: 質問内容」形式

## 【絶対禁止】
- 「A社」「B社」などの匿名表記（具体名がなければ触れない）
- RAGにない数字の捏造
- 同じ趣旨の繰り返し（重複セクション）
- 「〜について解説します」「いかがでしたか」的な空文
- Fragment ID（{{#xxx}}）の記述（後処理で付与）
- XXX、TBD、TODO、PLACEHOLDERなどのプレースホルダ

## 出力形式【最重要】

**絶対に以下のJSON形式のみを出力してください。説明文や前置きは一切不要です。**

```json
{{
  "title": "自然な日本語タイトル（32文字以内）",
  "meta_description": "160文字以内、読者の検索意図に直接応える要約",
  "content": "Markdown本文（見出しにFragment IDなし）",
  "seo_keywords": ["メインKW", "関連1", "関連2", "関連3", "関連4"],
  "excerpt": "200文字以内の記事要約",
  "cited_sources": [
    {{"name": "出典名", "url": "https://..."}}
  ]
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
    target_length = state.get("target_length", 12000)

    # Build prompt
    system_prompt = _build_system_prompt(topic, target_keyword, category_slug, target_length)
    rag_summary = _build_rag_summary(state)
    scraped_kw = _format_scraped_keywords(state.get("scraped_keywords", {}))

    research = state.get("research_results", {})
    research_text = _format_research_results(research)

    full_prompt = f"""{system_prompt}

## RAG参考データ（引用元として活用すること）
{rag_summary}

## スクレイピングキーワード
{scraped_kw}

## ディープリサーチ結果（URLを[出典名](URL)形式で本文中に引用すること）
{research_text}

---

品質チェックリスト（出力前に確認）:
- [ ] 一次情報引用が5箇所以上（[出典名](URL)形式）
- [ ] H2見出しが8〜12個で自然な日本語
- [ ] FAQが5〜8問で読者の実際の疑問に回答
- [ ] Fragment ID（{{#xxx}}）を書いていないこと
- [ ] プレースホルダ（XXX, TBD等）が残っていないこと
- [ ] 同じ趣旨の重複セクションがないこと
- [ ] キーワードが本文に自然に配置されていること"""

    # Model fallback chain: GPT-5.2 (primary) -> GPT-5-mini -> DeepSeek -> GPT-4o-mini
    models_to_try: list[tuple[str | None, str, dict]] = []

    if settings.openai_api_key:
        models_to_try.extend([
            (None, "gpt-5.2", {"api_key": settings.openai_api_key}),
            (None, "gpt-5-mini", {"api_key": settings.openai_api_key}),
        ])

    if settings.deepseek_api_key:
        models_to_try.append((
            "https://api.deepseek.com",
            "deepseek-chat",
            {"api_key": settings.deepseek_api_key, "base_url": "https://api.deepseek.com"},
        ))

    if settings.openai_api_key:
        models_to_try.append(
            (None, "gpt-4o-mini", {"api_key": settings.openai_api_key}),
        )

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
                    max_completion_tokens=65536,
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
