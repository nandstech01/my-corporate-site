#!/usr/bin/env npx tsx
/**
 * ASO分析スクリプト（nands.tech用）
 *
 * Phase 5: 既存システムに影響を与えずにASO分析を実行
 * 結果はaso.client_analysesテーブルに保存
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local を読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

// 環境変数
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 分析対象URL（nands.techの記事）
const TARGET_URLS = [
  'https://nands.tech/posts/chatgpt-145963',
  'https://nands.tech/posts/ai-gtp-52-rolling-out2025-419321',
  'https://nands.tech/posts/crewai-510028',
];

// テナントID（既存のテストテナント）
const TENANT_ID = '2dec3290-5427-4874-a525-6265da5aa8f3'; // Test Tenant - ASO SaaS Phase 1

async function main() {
  console.log('🚀 ASO分析開始（nands.tech）');
  console.log('='.repeat(50));

  // Supabase クライアント（service_role）
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 動的import（ESM対応）
  const { crawlUrl } = await import('../lib/aso/crawler');
  const { HasPartSchemaSystem } = await import('../lib/structured-data/haspart-schema-system');

  for (const url of TARGET_URLS) {
    console.log(`\n📄 分析中: ${url}`);

    try {
      // 1. URLクロール
      console.log('  - クロール中...');
      const crawlResult = await crawlUrl(url, { timeout: 30000, maxRetries: 2 });

      if (!crawlResult.success) {
        console.log(`  ❌ クロール失敗: ${crawlResult.error}`);
        continue;
      }

      console.log(`  ✅ クロール成功: ${crawlResult.metadata?.title || 'No title'}`);
      console.log(`  - 見出し数: ${crawlResult.headings?.length || 0}`);

      // 2. Fragment ID生成
      const fragmentIds = (crawlResult.headings || []).map((heading: any, index: number) => {
        const text = heading.text.trim();
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);

        if (hasJapanese) {
          const encoded = encodeURIComponent(text.replace(/\s+/g, '-').substring(0, 30));
          return `h${heading.level}-${encoded}-${index + 1}`;
        }

        const asciiOnly = text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);

        return `h${heading.level}-${asciiOnly || 'section'}-${index + 1}`;
      });

      console.log(`  - Fragment ID生成: ${fragmentIds.length}件`);

      // 3. HasPartSchema生成
      const hasPartSystem = new HasPartSchemaSystem({ baseUrl: url });
      const { fragmentSchemas } = hasPartSystem.generateFragmentBasedSchema(
        fragmentIds,
        url,
        crawlResult.metadata?.title || 'Untitled',
        undefined
      );

      // 4. AI構造化スコア計算（簡易版）
      let score = 50; // ベーススコア
      if (crawlResult.headings && crawlResult.headings.length > 0) score += 10;
      if (crawlResult.metadata?.title) score += 10;
      if (crawlResult.metadata?.description) score += 10;
      if (crawlResult.jsonLd && crawlResult.jsonLd.length > 0) score += 20;
      score = Math.min(100, score);

      // 5. 分析データ構築
      const analysisData = {
        crawl: {
          status_code: crawlResult.statusCode,
          final_url: crawlResult.finalUrl,
          crawled_at: crawlResult.crawledAt,
          processing_time: crawlResult.processingTime,
        },
        metadata: crawlResult.metadata,
        content: {
          plain_text: crawlResult.plainText?.substring(0, 10000) || '',
          stats: crawlResult.stats,
        },
        headings: (crawlResult.headings || []).map((h: any) => ({
          level: h.level,
          text: h.text,
          id: h.id,
        })),
        links: (crawlResult.links || []).slice(0, 100),
        images: (crawlResult.images || []).slice(0, 50),
        jsonLd: crawlResult.jsonLd || [],
        entities: (crawlResult.entities || []).slice(0, 20),
        fragment_ids: fragmentSchemas.map((f: any) => f['@id']),
        fragment_schemas: fragmentSchemas,
      };

      // 6. DBに保存（RPC使用）
      console.log('  - DBに保存中...');
      const { data, error } = await supabase.rpc('insert_client_analysis', {
        p_tenant_id: TENANT_ID,
        p_url: url,
        p_pipeline_version: 'v1-phase5',
        p_company_name: '株式会社エヌアンドエス',
        p_analysis_data: analysisData,
        p_ai_structure_score: score,
        p_status: 'completed',
      });

      if (error) {
        // 冪等性チェック（既存分析がある場合）
        if (error.code === '23505') {
          console.log('  ⚠️ 既存分析あり（スキップ）');
        } else {
          console.log(`  ❌ 保存エラー: ${error.message}`);
        }
      } else {
        console.log(`  ✅ 保存完了: ${data?.id || 'unknown'}`);
        console.log(`  - スコア: ${score}/100`);
        console.log(`  - Fragment ID: ${fragmentIds.length}件`);
      }

    } catch (err) {
      console.log(`  ❌ エラー: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 ASO分析完了');
}

main().catch(console.error);
