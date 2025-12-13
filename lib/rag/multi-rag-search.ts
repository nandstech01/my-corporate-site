/**
 * マルチRAG検索システム
 * 
 * AIアーキテクト・ショート台本V2専用
 * 複数のRAGソースを統合検索し、スコアベースで条件分岐
 * 
 * @created 2025-12-12
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '../vector/openai-embeddings';
import { HybridSearchSystem } from '../vector/hybrid-search';

export interface MultiRAGSearchInput {
  query: string;
  blogTitle: string;
  blogSlug: string;
  targetAudience: 'general' | 'developer' | 'architect';
}

export interface RAGSearchResult {
  source: string;
  results: any[];
  score: number; // 0.0-1.0
  count: number;
}

export interface MultiRAGSearchOutput {
  deepResearch: RAGSearchResult;
  scrapedKeywords: RAGSearchResult;
  blogFragments: RAGSearchResult;
  personalStories: RAGSearchResult;
  needsNewResearch: boolean; // スコアが0.75未満の場合true
  overallScore: number;
}

export class MultiRAGSearchSystem {
  private supabase;
  private embeddings: OpenAIEmbeddings;
  private hybridSearch: HybridSearchSystem;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.embeddings = new OpenAIEmbeddings();
    this.hybridSearch = new HybridSearchSystem();
  }

  /**
   * メイン関数：複数RAGを統合検索
   */
  async searchAll(input: MultiRAGSearchInput): Promise<MultiRAGSearchOutput> {
    console.log('\n========================================');
    console.log('🔍 マルチRAG検索開始');
    console.log(`  Query: "${input.query}"`);
    console.log(`  Blog: "${input.blogTitle}"`);
    console.log(`  Target: ${input.targetAudience}`);
    console.log('========================================\n');

    // クエリをベクトル化
    console.log('📝 クエリをベクトル化中...');
    const queryEmbedding = await this.embeddings.embedSingle(input.query, 1536);
    console.log(`✅ ベクトル化完了（1536次元）\n`);

    // 並列検索（高速化）
    const [deepResearch, scrapedKeywords, blogFragments, personalStories] = await Promise.all([
      this.searchDeepResearch(input.query, queryEmbedding),
      this.searchScrapedKeywords(input.query, queryEmbedding),
      this.searchBlogFragments(input.query, queryEmbedding, input.blogSlug),
      this.searchPersonalStories(input.query, queryEmbedding)
    ]);

    // 総合スコアを計算（ディープリサーチを重視）
    const overallScore = this.calculateOverallScore({
      deepResearch: deepResearch.score,
      scrapedKeywords: scrapedKeywords.score,
      blogFragments: blogFragments.score,
      personalStories: personalStories.score
    });

    // 新規リサーチが必要かを判定（閾値: 0.75）
    const needsNewResearch = deepResearch.score < 0.75;

    console.log('\n========================================');
    console.log('📊 マルチRAG検索結果サマリー');
    console.log('========================================');
    console.log(`🧪 ディープリサーチRAG: ${deepResearch.count}件（スコア: ${deepResearch.score.toFixed(3)}）`);
    console.log(`🌐 スクレイピングRAG: ${scrapedKeywords.count}件（スコア: ${scrapedKeywords.score.toFixed(3)}）`);
    console.log(`📄 ブログフラグメントRAG: ${blogFragments.count}件（スコア: ${blogFragments.score.toFixed(3)}）`);
    console.log(`👤 パーソナルストーリーRAG: ${personalStories.count}件（スコア: ${personalStories.score.toFixed(3)}）`);
    console.log(`📈 総合スコア: ${overallScore.toFixed(3)}`);
    console.log(`${needsNewResearch ? '⚠️  新規リサーチが必要' : '✅ 既存データで十分'}`);
    console.log('========================================\n');

    return {
      deepResearch,
      scrapedKeywords,
      blogFragments,
      personalStories,
      needsNewResearch,
      overallScore
    };
  }

  /**
   * 1. ディープリサーチRAG検索
   */
  private async searchDeepResearch(
    query: string,
    queryEmbedding: number[]
  ): Promise<RAGSearchResult> {
    console.log('🧪 1️⃣ ディープリサーチRAG検索中...');

    try {
      // hybrid_deep_researchテーブルを直接検索
      const { data, error } = await this.supabase.rpc('match_deep_research', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5
      });

      if (error) {
        console.error('❌ ディープリサーチRAG検索エラー:', error);
        return { source: 'deep_research', results: [], score: 0, count: 0 };
      }

      const results = data || [];
      const avgScore = results.length > 0
        ? results.reduce((sum: number, r: any) => sum + (r.similarity || 0), 0) / results.length
        : 0;

      console.log(`✅ ディープリサーチRAG: ${results.length}件取得（平均スコア: ${avgScore.toFixed(3)}）`);
      if (results.length > 0) {
        console.log(`   トップ結果: ${results[0].research_topic} (${results[0].similarity?.toFixed(3)})`);
      }

      return {
        source: 'deep_research',
        results,
        score: avgScore,
        count: results.length
      };
    } catch (error) {
      console.error('❌ ディープリサーチRAG検索エラー:', error);
      return { source: 'deep_research', results: [], score: 0, count: 0 };
    }
  }

  /**
   * 2. スクレイピングRAG検索
   */
  private async searchScrapedKeywords(
    query: string,
    queryEmbedding: number[]
  ): Promise<RAGSearchResult> {
    console.log('🌐 2️⃣ スクレイピングRAG検索中...');

    try {
      // hybrid_scraped_keywordsテーブルを直接検索
      const { data, error } = await this.supabase.rpc('match_scraped_keywords', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 3
      });

      if (error) {
        console.error('❌ スクレイピングRAG検索エラー:', error);
        return { source: 'scraped_keywords', results: [], score: 0, count: 0 };
      }

      const results = data || [];
      const avgScore = results.length > 0
        ? results.reduce((sum: number, r: any) => sum + (r.similarity || 0), 0) / results.length
        : 0;

      console.log(`✅ スクレイピングRAG: ${results.length}件取得（平均スコア: ${avgScore.toFixed(3)}）`);

      return {
        source: 'scraped_keywords',
        results,
        score: avgScore,
        count: results.length
      };
    } catch (error) {
      console.error('❌ スクレイピングRAG検索エラー:', error);
      return { source: 'scraped_keywords', results: [], score: 0, count: 0 };
    }
  }

  /**
   * 3. ブログフラグメントRAG検索（1%の接続用）
   */
  private async searchBlogFragments(
    query: string,
    queryEmbedding: number[],
    blogSlug?: string
  ): Promise<RAGSearchResult> {
    console.log('📄 3️⃣ ブログフラグメントRAG検索中...');

    try {
      // ハイブリッド検索システムを使用
      const results = await this.hybridSearch.search({
        query,
        source: 'fragment',
        limit: 2,
        threshold: 0.5,
        bm25Weight: 0.4,
        vectorWeight: 0.6
      });

      const avgScore = results.length > 0
        ? results.reduce((sum, r) => sum + r.vectorScore, 0) / results.length
        : 0;

      console.log(`✅ ブログフラグメントRAG: ${results.length}件取得（平均スコア: ${avgScore.toFixed(3)}）`);

      return {
        source: 'blog_fragments',
        results,
        score: avgScore,
        count: results.length
      };
    } catch (error) {
      console.error('❌ ブログフラグメントRAG検索エラー:', error);
      return { source: 'blog_fragments', results: [], score: 0, count: 0 };
    }
  }

  /**
   * 4. パーソナルストーリーRAG検索（Kenjiのトーン抽出用）
   */
  private async searchPersonalStories(
    query: string,
    queryEmbedding: number[]
  ): Promise<RAGSearchResult> {
    console.log('👤 4️⃣ パーソナルストーリーRAG検索中...');

    try {
      // text-embedding-3-large用に3072次元に変換
      const embedding3072 = await this.embeddings.embedSingle(query, 3072);
      
      const results = await this.hybridSearch.searchPersonalStoryRAG(
        query,
        embedding3072,
        1, // Kenjiのトーン抽出なので1件のみ
        0.3
      );

      const avgScore = results.length > 0
        ? results.reduce((sum, r) => sum + (r.similarity || 0), 0) / results.length
        : 0;

      console.log(`✅ パーソナルストーリーRAG: ${results.length}件取得（平均スコア: ${avgScore.toFixed(3)}）`);
      if (results.length > 0) {
        console.log(`   トップ結果: ${results[0].story_arc} - ${results[0].section_title}`);
      }

      return {
        source: 'personal_stories',
        results,
        score: avgScore,
        count: results.length
      };
    } catch (error) {
      console.error('❌ パーソナルストーリーRAG検索エラー:', error);
      return { source: 'personal_stories', results: [], score: 0, count: 0 };
    }
  }

  /**
   * 総合スコアを計算
   * ディープリサーチを重視（90%）
   */
  private calculateOverallScore(scores: {
    deepResearch: number;
    scrapedKeywords: number;
    blogFragments: number;
    personalStories: number;
  }): number {
    return (
      scores.deepResearch * 0.90 +
      scores.scrapedKeywords * 0.05 +
      scores.blogFragments * 0.01 +
      scores.personalStories * 0.04
    );
  }

  /**
   * 検索結果をマークダウン形式に整形（プロンプト用）
   */
  formatResultsForPrompt(output: MultiRAGSearchOutput): string {
    let markdown = '';

    // 1. ディープリサーチRAG（最重要：90%）
    if (output.deepResearch.count > 0) {
      markdown += '## 🧪 最新AI情報（海外ソース・高権威）\n\n';
      output.deepResearch.results.forEach((r: any, i: number) => {
        markdown += `### ${i + 1}. ${r.research_topic}\n\n`;
        markdown += `${r.summary || r.content}\n\n`;
        if (r.key_findings && r.key_findings.length > 0) {
          markdown += `**重要ポイント:**\n`;
          r.key_findings.forEach((finding: string) => {
            markdown += `- ${finding}\n`;
          });
          markdown += '\n';
        }
        if (r.source_urls && r.source_urls.length > 0) {
          markdown += `**ソース:** ${r.source_urls.slice(0, 2).join(', ')}\n\n`;
        }
        markdown += '---\n\n';
      });
    }

    // 2. スクレイピングRAG（補助：5%）
    if (output.scrapedKeywords.count > 0) {
      markdown += '## 🌐 補足情報（トレンド・業界動向）\n\n';
      output.scrapedKeywords.results.slice(0, 2).forEach((r: any, i: number) => {
        markdown += `### ${i + 1}. ${r.title || r.keyword}\n\n`;
        markdown += `${r.content?.substring(0, 300)}...\n\n`;
        markdown += '---\n\n';
      });
    }

    // 3. ブログフラグメントRAG（意味の接続：1%）
    if (output.blogFragments.count > 0) {
      markdown += '## 📄 ブログ記事との接続\n\n';
      output.blogFragments.results.forEach((r: any, i: number) => {
        markdown += `${r.content?.substring(0, 200)}...\n\n`;
      });
      markdown += '---\n\n';
    }

    // 4. パーソナルストーリーRAG（トーン：4%）
    if (output.personalStories.count > 0) {
      markdown += '## 👤 Kenjiのトーン・語り口\n\n';
      const story = output.personalStories.results[0];
      markdown += `**ストーリー:** ${story.story_arc}\n`;
      markdown += `**セクション:** ${story.section_title}\n\n`;
      markdown += `${story.content?.substring(0, 300)}...\n\n`;
      markdown += '---\n\n';
    }

    return markdown;
  }
}

/**
 * ヘルパー関数：簡易検索
 */
export async function searchMultipleRAGs(
  query: string,
  blogTitle: string,
  blogSlug: string,
  targetAudience: 'general' | 'developer' | 'architect' = 'general'
): Promise<MultiRAGSearchOutput> {
  const searcher = new MultiRAGSearchSystem();
  return await searcher.searchAll({
    query,
    blogTitle,
    blogSlug,
    targetAudience
  });
}

