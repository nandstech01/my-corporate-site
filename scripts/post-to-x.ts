/**
 * X自動投稿スクリプト（記事モード + 調査モード）
 *
 * 記事モード: ブログ記事をSupabaseから取得 → LangGraphパイプラインで長文生成 → X投稿
 * 調査モード: Brave Searchで最新情報収集 → LangGraphパイプラインで280文字生成 → X投稿
 *
 * 実行: npx tsx scripts/post-to-x.ts
 * 環境変数: MODE, SLUG, TOPIC, URL, DRY_RUN
 */

import { appendFileSync } from 'fs';
import { postTweet, isTwitterConfigured } from '../lib/x-api/client';
import { fetchArticle, researchTopic } from '../lib/x-post-generation/data-fetchers';
import { generateXPost } from '../lib/x-post-generation/post-graph';

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

    console.log('Generating long-form post via LangGraph...');
    const result = await generateXPost({
      mode: 'article',
      content: article.content,
      title: article.title,
      slug: article.slug,
      tags: article.category_tags ?? undefined,
    });
    const postText = result.finalPost;
    console.log(`Generated post (${postText.length} chars, pattern: ${result.patternUsed})`);
    console.log(`Tokens: prompt=${result.promptTokens}, completion=${result.completionTokens}`);

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

    const tweetResult = await postTweet(postText, { longForm: true });
    if (!tweetResult.success) {
      throw new Error(`Post failed: ${tweetResult.error}`);
    }

    console.log(`Posted! ${tweetResult.tweetUrl}`);
    writeSummary(`\n**投稿URL:** ${tweetResult.tweetUrl}`);

  } else {
    // === 調査モード ===
    console.log(`Researching: ${args.topic || args.url}`);
    const data = await researchTopic(args.topic, args.url || undefined);
    console.log(`Found ${data.searchResults.length} search results`);

    if (data.urlContent) {
      console.log(`URL content: ${data.urlContent.length} chars`);
    }

    const contentParts = [
      ...data.searchResults.map(
        (r, i) => `[${i + 1}] ${r.title}\n${r.description}\n${r.url}`
      ),
      ...(data.urlContent ? [`[URL内容]\n${data.urlContent}`] : []),
    ];

    console.log('Generating impact post via LangGraph...');
    const result = await generateXPost({
      mode: 'research',
      content: contentParts.join('\n\n'),
      topic: data.topic,
    });
    const postText = result.finalPost;
    console.log(`Generated post (${postText.length} chars, pattern: ${result.patternUsed})`);
    console.log(`Tokens: prompt=${result.promptTokens}, completion=${result.completionTokens}`);

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

    const tweetResult = await postTweet(postText);
    if (!tweetResult.success) {
      throw new Error(`Post failed: ${tweetResult.error}`);
    }

    console.log(`Posted! ${tweetResult.tweetUrl}`);
    writeSummary(`\n**投稿URL:** ${tweetResult.tweetUrl}`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
