/**
 * X自動投稿スクリプト（記事モード + 調査モード）
 *
 * 記事モード: ブログ記事をSupabaseから取得 → OpenAIで長文要約 → X投稿
 * 調査モード: Brave Searchで最新情報収集 → OpenAIで280文字投稿 → X投稿
 *
 * 実行: npx tsx scripts/post-to-x.ts
 * 環境変数: MODE, SLUG, TOPIC, URL, DRY_RUN
 */

import { appendFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { postTweet, isTwitterConfigured } from '../lib/x-api/client';
import { X_TWITTER_RULES } from '../lib/prompts/sns/x-twitter';
import { TONE_GUIDELINES } from '../lib/x-post-generation/pattern-templates';

// ============================================================
// 型定義
// ============================================================

interface Article {
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  category_tags: string[] | null;
}

interface SearchResult {
  title: string;
  description: string;
  url: string;
}

interface ResearchData {
  topic: string;
  searchResults: SearchResult[];
  urlContent: string | null;
}

// ============================================================
// 環境変数パース
// ============================================================

function parseArgs() {
  const mode = process.env.MODE;
  const slug = process.env.SLUG || '';
  const topic = process.env.TOPIC || '';
  const url = process.env.URL || '';
  const dryRun = process.env.DRY_RUN === 'true';

  if (!mode || !['article', 'research'].includes(mode)) {
    throw new Error('MODE must be "article" or "research"');
  }

  if (mode === 'article' && !slug) {
    throw new Error('SLUG is required for article mode');
  }

  if (mode === 'research' && !topic && !url) {
    throw new Error('TOPIC or URL is required for research mode');
  }

  return { mode: mode as 'article' | 'research', slug, topic, url, dryRun };
}

// ============================================================
// Supabase: 記事取得
// ============================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return createClient(supabaseUrl, supabaseKey);
}

async function fetchArticle(slug: string): Promise<Article> {
  const supabase = getSupabaseClient();

  // postsテーブルから検索
  const { data: newPost, error: newError } = await supabase
    .from('posts')
    .select('title, slug, content, meta_description, category_tags')
    .eq('status', 'published')
    .eq('slug', slug)
    .single();

  if (newPost) {
    return newPost as Article;
  }

  if (newError && newError.code !== 'PGRST116') {
    console.error('postsテーブル検索エラー:', newError);
  }

  // chatgpt_postsテーブルにフォールバック
  const { data: oldPost, error: oldError } = await supabase
    .from('chatgpt_posts')
    .select('title, slug, content, meta_description, category_tags')
    .eq('status', 'published')
    .eq('slug', slug)
    .single();

  if (oldPost) {
    return oldPost as Article;
  }

  if (oldError && oldError.code !== 'PGRST116') {
    console.error('chatgpt_postsテーブル検索エラー:', oldError);
  }

  throw new Error(`Article not found: ${slug}`);
}

// ============================================================
// Brave Search: 最新情報収集
// ============================================================

async function searchBrave(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY is required for research mode');
  }

  const params = new URLSearchParams({
    q: query,
    count: '10',
    freshness: 'pw',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': apiKey,
        },
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const results: SearchResult[] = (data.web?.results || [])
    .slice(0, 5)
    .map((r: { title: string; description: string; url: string }) => ({
      title: r.title,
      description: r.description,
      url: r.url,
    }));

  return results;
}

async function fetchUrlContent(url: string): Promise<string> {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are supported');
  }
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '[::1]'];
  if (blockedHosts.some((h) => parsed.hostname === h) || parsed.hostname.endsWith('.internal')) {
    throw new Error('Internal/private URLs are not allowed');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NandsTechBot/1.0)',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`URL fetch error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // script, style除去 → テキスト抽出
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.slice(0, 3000);
}

async function researchTopic(topic: string, url?: string): Promise<ResearchData> {
  const searchResults = topic ? await searchBrave(topic) : [];
  const urlContent = url ? await fetchUrlContent(url) : null;

  return { topic: topic || url || '', searchResults, urlContent };
}

// ============================================================
// OpenAI: 投稿文生成
// ============================================================

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }
  return new OpenAI({ apiKey });
}

function formatToneGuidelines(): string {
  return [
    '【口調ガイドライン】',
    `推奨表現: ${TONE_GUIDELINES.good_expressions.join('、')}`,
    `避ける表現: ${TONE_GUIDELINES.avoid_expressions.join('、')}`,
    `基本方針: ${TONE_GUIDELINES.principles.join('、')}`,
  ].join('\n');
}

async function generateLongPost(article: Article): Promise<string> {
  const openai = getOpenAIClient();
  const articleUrl = `https://nands.tech/posts/${article.slug}`;
  const toneText = formatToneGuidelines();

  const systemPrompt = `あなたはAI技術に精通した@nands_techのテックライターです。
ブログ記事を読み、Xの長文投稿（1000-2000文字）として要約してください。

要件:
- 記事の核心的な価値を凝縮
- 具体的な数字やデータは記事にあるもののみ使用
- 読者が「この記事読みたい」と思う構成
- 構成: 衝撃的な導入 → 3-5つの重要ポイント → 実務への示唆 → 記事リンク
- ハッシュタグ2-3個
- 記事URL: ${articleUrl}
- ※長文投稿なので280文字制限は適用しない。1000-2000文字で書くこと。

${toneText}`;

  const userPrompt = `以下のブログ記事を長文X投稿として要約してください。

タイトル: ${article.title}
${article.meta_description ? `概要: ${article.meta_description}` : ''}
${article.category_tags ? `タグ: ${article.category_tags.join(', ')}` : ''}

本文:
${article.content.slice(0, 6000)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 1500,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  return text;
}

async function generateImpactPost(data: ResearchData): Promise<string> {
  const openai = getOpenAIClient();
  const toneText = formatToneGuidelines();

  const sourcesText = [
    ...data.searchResults.map(
      (r, i) => `[${i + 1}] ${r.title}\n${r.description}\n${r.url}`
    ),
    ...(data.urlContent
      ? [`[URL内容]\n${data.urlContent}`]
      : []),
  ].join('\n\n');

  const systemPrompt = `あなたはAIツールを日常的に使いこなすエンジニアです。
以下の最新情報をもとに、まるで自分が実際に使った一次体験のように
280文字以内のX投稿を作成してください。

重要ルール:
- 「〜らしい」「〜のようだ」は絶対NG。「〜だった」「〜できた」と断定
- 具体的な機能名や数字を含める（情報源にあるもののみ）
- 使用感を匂わせる表現:「試したら」「使ってみたら」「導入したら」
- 嘘は書かない。情報源にある事実のみ使用
- 感動や驚きのリアルな感情表現
- ハッシュタグ2-3個含む
- 280文字以内厳守

${X_TWITTER_RULES}

${toneText}`;

  const userPrompt = `トピック: ${data.topic}

情報源:
${sourcesText}

上記をもとに、280文字以内のインパクトあるX投稿を3候補作成してください。
各候補は「---」で区切ってください。
最も良い候補を1つ選び、最後に「【選定】」の後に番号（1/2/3）を記載してください。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.8,
    max_tokens: 800,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const responseText = response.choices[0]?.message?.content?.trim();
  if (!responseText) {
    throw new Error('OpenAI returned empty response');
  }

  // 3候補から選定された1つを抽出
  const selectionMatch = responseText.match(/【選定】\s*(\d)/);
  const selectedIndex = selectionMatch ? parseInt(selectionMatch[1], 10) - 1 : 0;
  const candidates = responseText.split('---').map((c) => c.trim()).filter(Boolean);

  // 選定マーカー行を除去した候補リスト
  const cleanCandidates = candidates
    .map((c) => c.replace(/【選定】.*$/m, '').trim())
    .filter((c) => c.length > 0 && c.length <= 280);

  if (cleanCandidates.length === 0) {
    // フォールバック: 全テキストから選定マーカーを除去
    const fallback = responseText.replace(/【選定】.*$/m, '').trim();
    if (fallback.length <= 280) {
      return fallback;
    }
    throw new Error('Generated posts all exceed 280 characters');
  }

  const chosen = cleanCandidates[selectedIndex] || cleanCandidates[0];
  return chosen;
}

// ============================================================
// GitHub Actions Step Summary
// ============================================================

function writeSummary(content: string) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    appendFileSync(summaryFile, content + '\n');
  }
}

// ============================================================
// メイン処理
// ============================================================

async function main() {
  const args = parseArgs();
  console.log(`Mode: ${args.mode}, DryRun: ${args.dryRun}`);

  if (args.mode === 'article') {
    // === 記事モード ===
    console.log(`Fetching article: ${args.slug}`);
    const article = await fetchArticle(args.slug);
    console.log(`Article found: ${article.title}`);

    console.log('Generating long-form post...');
    const postText = await generateLongPost(article);
    console.log(`Generated post (${postText.length} chars)`);

    writeSummary(`## 記事モード\n\n**記事:** ${article.title}\n\n**生成テキスト (${postText.length}文字):**\n\n\`\`\`\n${postText}\n\`\`\``);

    if (args.dryRun) {
      console.log('=== DRY RUN ===');
      console.log(postText);
      console.log('=== END DRY RUN ===');
      return;
    }

    if (!isTwitterConfigured()) {
      throw new Error('Twitter API credentials not configured');
    }

    const result = await postTweet(postText, { longForm: true });
    if (!result.success) {
      throw new Error(`Post failed: ${result.error}`);
    }

    console.log(`Posted! ${result.tweetUrl}`);
    writeSummary(`\n**投稿URL:** ${result.tweetUrl}`);

  } else {
    // === 調査モード ===
    console.log(`Researching: ${args.topic || args.url}`);
    const data = await researchTopic(args.topic, args.url || undefined);
    console.log(`Found ${data.searchResults.length} search results`);

    if (data.urlContent) {
      console.log(`URL content: ${data.urlContent.length} chars`);
    }

    console.log('Generating impact post...');
    const postText = await generateImpactPost(data);
    console.log(`Generated post (${postText.length} chars)`);

    const sourcesMarkdown = data.searchResults
      .map((r) => `- [${r.title}](${r.url})`)
      .join('\n');

    writeSummary(`## 調査モード\n\n**トピック:** ${data.topic}\n\n**情報源:**\n${sourcesMarkdown}\n\n**生成テキスト (${postText.length}文字):**\n\n\`\`\`\n${postText}\n\`\`\``);

    if (args.dryRun) {
      console.log('=== DRY RUN ===');
      console.log(postText);
      console.log('=== END DRY RUN ===');
      return;
    }

    if (!isTwitterConfigured()) {
      throw new Error('Twitter API credentials not configured');
    }

    const result = await postTweet(postText);
    if (!result.success) {
      throw new Error(`Post failed: ${result.error}`);
    }

    console.log(`Posted! ${result.tweetUrl}`);
    writeSummary(`\n**投稿URL:** ${result.tweetUrl}`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
