#!/usr/bin/env ts-node

/**
 * Phase 5: JSON-LD生成ヘルパースクリプト
 *
 * @version 2.0.0
 * @date 2026-01-20
 *
 * 使用方法:
 *   npx ts-node scripts/phase5-generate-jsonld.ts --url https://nands.tech/ai-agents
 *   npx ts-node scripts/phase5-generate-jsonld.ts --url https://nands.tech/ai-agents --config nands
 *
 * 機能:
 * 1. URLからコンテンツをクロール
 * 2. エンティティ抽出（Organization, Service, Product, knowsAbout）
 * 3. Fragment ID付きのJSON-LD生成
 * 4. テナント設定（sameAs, Author）の統合 ← Phase 8追加
 * 5. 既存JSON-LDとのマージ ← Phase 8追加
 * 6. Rich Results Test用の検証
 */

import { UrlCrawler } from '../lib/clavi/crawler';
import { CLAVIEntityExtractor } from '../lib/clavi/entity-extractor';
import { CLAVISchemaGenerator } from '../lib/clavi/schema-generator';
import { CLAVISchemaMerger } from '../lib/clavi/schema-merger';
import type { TenantSettings, SameAsSettings } from '../lib/clavi/types/tenant-settings';
import type { HeadingStructure, JsonLdInfo } from '../lib/clavi/types/crawler';
import * as fs from 'fs';
import * as path from 'path';

// ===================================
// 設定
// ===================================

interface CliArgs {
  url: string;
  outputDir: string;
  configName: string;
}

// プリセット設定（nands.tech用）
const PRESET_CONFIGS: Record<string, TenantSettings> = {
  nands: {
    sameAs: {
      organization: {
        twitter: 'https://x.com/NANDS_AI',
        linkedin: 'https://www.linkedin.com/company/nands-tech',
        youtube: 'https://www.youtube.com/@kenjiharada_ai_site',
        github: 'https://github.com/nands-tech',
        custom: ['https://taishoku-anshin-daiko.com/'],
      },
      author: {
        twitter: 'https://x.com/NANDS_AI',
        linkedin: 'https://www.linkedin.com/in/賢治-原田-77a4b7353/',
        youtube: 'https://www.youtube.com/@kenjiharada_ai_site',
        github: 'https://github.com/nands-tech',
      },
    },
    author: {
      name: '原田賢治',
      jobTitle: '代表取締役 / AI検索最適化コンサルタント',
      description: 'AI検索最適化（CLAVI）とレリバンスエンジニアリングの専門家。Google AIO、ChatGPT、Perplexity等のAI検索エンジン対策を手掛ける。',
      expertise: [
        'AI検索最適化',
        'レリバンスエンジニアリング',
        'AIO対策',
        'ChatGPT SEO',
        'Perplexity最適化',
        '構造化データ',
        'Schema.org',
        'JSON-LD',
        'E-E-A-T最適化',
        'Knowledge Graph',
      ],
      image: 'https://nands.tech/wp-content/uploads/2025/01/author-kenji-harada.jpg',
      sameAs: {
        twitter: 'https://x.com/NANDS_AI',
        linkedin: 'https://www.linkedin.com/in/賢治-原田-77a4b7353/',
        youtube: 'https://www.youtube.com/@kenjiharada_ai_site',
        github: 'https://github.com/nands-tech',
      },
    },
  },
};

// ===================================
// ヘルパー関数
// ===================================

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const outputDirIndex = args.indexOf('--output-dir');
  const configIndex = args.indexOf('--config');

  if (urlIndex === -1 || !args[urlIndex + 1]) {
    console.error('Error: --url is required');
    console.error('Usage: npx ts-node scripts/phase5-generate-jsonld.ts --url <URL> [--config nands]');
    console.error('');
    console.error('Options:');
    console.error('  --url <URL>         対象URL（必須）');
    console.error('  --config <name>     プリセット設定名（nands）');
    console.error('  --output-dir <dir>  出力ディレクトリ');
    process.exit(1);
  }

  const url = args[urlIndex + 1];
  const outputDir = outputDirIndex !== -1 && args[outputDirIndex + 1]
    ? args[outputDirIndex + 1]
    : 'docs/saas-product/phase5-data/jsonld-output';
  const configName = configIndex !== -1 && args[configIndex + 1]
    ? args[configIndex + 1]
    : 'nands'; // デフォルトはnands

  return { url, outputDir, configName };
}

function log(level: 'info' | 'success' | 'error' | 'warn', message: string) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };
  console.log(`${icons[level]} ${message}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

// ===================================
// メイン処理
// ===================================

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Phase 5: JSON-LD生成ヘルパースクリプト                   ║');
  console.log('║  Version: 2.0.0 (Phase 8 sameAs/Author統合)                ║');
  console.log('║  Date: 2026-01-20                                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const args = parseArgs();

  // テナント設定を取得
  const tenantSettings = PRESET_CONFIGS[args.configName || 'nands'];
  if (!tenantSettings) {
    log('error', `設定 "${args.configName}" が見つかりません`);
    log('info', `利用可能な設定: ${Object.keys(PRESET_CONFIGS).join(', ')}`);
    process.exit(1);
  }

  log('info', `対象URL: ${args.url}`);
  log('info', `出力ディレクトリ: ${args.outputDir}`);
  log('info', `設定: ${args.configName}`);
  log('info', `Author: ${tenantSettings.author?.name || 'なし'}`);
  log('info', `sameAs: ${tenantSettings.sameAs?.organization ? 'あり' : 'なし'}`);
  
  // 出力ディレクトリ作成
  if (!fs.existsSync(args.outputDir)) {
    fs.mkdirSync(args.outputDir, { recursive: true });
    log('success', '出力ディレクトリを作成しました');
  }
  
  // ===================================
  // Step 1: URLクロール
  // ===================================

  section('Step 1: URLクロール');

  const crawler = new UrlCrawler();

  log('info', 'クロール開始...');

  const crawlResult = await crawler.crawl(args.url);

  if (!crawlResult.success) {
    log('error', 'クロール失敗: ' + (crawlResult.error || 'Unknown error'));
    process.exit(1);
  }

  log('success', 'クロール完了');
  log('info', `タイトル: ${crawlResult.metadata.title}`);
  log('info', `見出し数: ${crawlResult.headings.length}`);
  log('info', `コンテンツサイズ: ${crawlResult.plainText.length} 文字`);

  // ===================================
  // Step 2: エンティティ抽出
  // ===================================

  section('Step 2: エンティティ抽出');

  const extractor = new CLAVIEntityExtractor();

  log('info', 'エンティティ抽出開始...');

  const entities = await extractor.extractEntities({
    url: args.url,
    title: crawlResult.metadata.title || '',
    description: crawlResult.metadata.description || '',
    headings: crawlResult.headings.map((h: HeadingStructure) => h.text),
    content: crawlResult.plainText,
  });

  log('success', 'エンティティ抽出完了');
  log('info', `Organization: ${entities.organization?.name || 'なし'}`);
  log('info', `Service数: ${entities.services?.length || 0}`);
  log('info', `Product数: ${entities.products?.length || 0}`);
  log('info', `knowsAbout数: ${entities.knowsAbout?.length || 0}`);

  // ===================================
  // Step 3: Fragment ID生成（模擬）
  // ===================================

  section('Step 3: Fragment ID生成（模擬）');

  log('info', 'Fragment IDを模擬的に生成します...');
  log('warn', '実際のFragment IDはWordPressプラグインが自動生成します');

  // 見出しからFragment情報を作成
  const headings = crawlResult.headings;
  const content = crawlResult.plainText;

  const fragments = headings
    .filter((h: HeadingStructure) => h.level === 2 || h.level === 3) // H2/H3のみ
    .map((h: HeadingStructure, index: number) => {
      const slug = h.text
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);

      // 模擬ハッシュ
      const hash = Math.random().toString(36).substring(2, 10);

      const fragmentId = `h${h.level}-${slug}-${hash}`;

      // 要約を生成（最初の30語）
      const nextHeadingIndex = headings.findIndex(
        (nh: HeadingStructure, i: number) => i > index && nh.level <= h.level
      );

      const contentStart = content.indexOf(h.text) + h.text.length;
      const contentEnd =
        nextHeadingIndex !== -1
          ? content.indexOf(headings[nextHeadingIndex].text)
          : contentStart + 500;

      const sectionContent = content.substring(contentStart, contentEnd).trim();
      // 50-150語のコンテンツを抽出
      const fullContent = sectionContent.split(/\s+/).slice(0, 100).join(' ') || h.text;

      return {
        fragmentId,
        title: h.text,
        fullContent,
      };
    });

  log('success', `Fragment ID ${fragments.length}個生成完了`);
  
  fragments.forEach((f: { fragmentId: string; title: string; fullContent: string }) => {
    log('info', `  - ${f.fragmentId} (${f.title})`);
  });

  // ===================================
  // Step 4: JSON-LD生成 & マージ（Phase 8）
  // ===================================

  section('Step 4: JSON-LD生成 & マージ');

  const generator = new CLAVISchemaGenerator();
  const merger = new CLAVISchemaMerger();

  log('info', 'JSON-LD生成開始...');

  // 基本スキーマ生成（テナント設定含む）
  const generatedSchema = generator.generateSchema({
    url: args.url,
    title: crawlResult.metadata.title || '',
    description: crawlResult.metadata.description || '',
    fragments,
    entities,
    tenantSettings, // Phase 8: テナント設定を渡す
  });

  // 既存JSON-LDとマージ（Phase 8）
  const existingJsonLd: JsonLdInfo[] = crawlResult.jsonLd || [];
  log('info', `既存JSON-LD: ${existingJsonLd.length}個検出`);

  const mergeResult = merger.mergeWithExisting(
    existingJsonLd,
    generatedSchema,
    tenantSettings
  );

  log('success', 'JSON-LD生成・マージ完了');
  log('info', `追加プロパティ: ${mergeResult.additions.join(', ') || 'なし'}`);
  if (mergeResult.warnings.length > 0) {
    mergeResult.warnings.forEach(w => log('warn', w));
  }

  const jsonLdString = JSON.stringify(mergeResult.merged, null, 2);
  
  // ===================================
  // Step 5: ファイル出力
  // ===================================
  
  section('Step 5: ファイル出力');
  
  const urlPath = new URL(args.url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'index';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  
  // JSON-LDファイル
  const jsonLdFilePath = path.join(args.outputDir, `${urlPath}-${timestamp}.json`);
  fs.writeFileSync(jsonLdFilePath, jsonLdString, 'utf-8');
  log('success', `JSON-LD保存: ${jsonLdFilePath}`);
  
  // 概要ファイル
  const summaryFilePath = path.join(args.outputDir, `${urlPath}-${timestamp}-summary.txt`);
  const orgSameAsCount = Object.keys(tenantSettings.sameAs?.organization || {}).filter(
    (k) => (tenantSettings.sameAs?.organization as Record<string, string | string[] | undefined>)?.[k]
  ).length;
  const authorSameAsCount = Object.keys(tenantSettings.sameAs?.author || {}).filter(
    (k) => (tenantSettings.sameAs?.author as Record<string, string | undefined>)?.[k]
  ).length;

  const summary = `
Phase 5: JSON-LD生成レポート（Phase 8 sameAs/Author統合版）
================================================================

URL: ${args.url}
生成日時: ${new Date().toISOString()}
設定: ${args.configName}

■ クロール結果
- タイトル: ${crawlResult.metadata.title}
- メタディスクリプション: ${crawlResult.metadata.description || 'なし'}
- 見出し数: ${crawlResult.headings.length}
- コンテンツサイズ: ${crawlResult.plainText.length} 文字
- 既存JSON-LD: ${existingJsonLd.length}個

■ エンティティ抽出結果
- Organization: ${entities.organization?.name || 'なし'}
- Service数: ${entities.services?.length || 0}
- Product数: ${entities.products?.length || 0}
- knowsAbout数: ${entities.knowsAbout?.length || 0}

■ テナント設定（Phase 8）
- Author: ${tenantSettings.author?.name || 'なし'}
- Author jobTitle: ${tenantSettings.author?.jobTitle || 'なし'}
- Author expertise: ${tenantSettings.author?.expertise?.length || 0}個
- Organization sameAs: ${orgSameAsCount}個
- Author sameAs: ${authorSameAsCount}個

■ マージ結果
- 追加プロパティ: ${mergeResult.additions.join(', ') || 'なし'}
- 警告: ${mergeResult.warnings.length}件
${mergeResult.warnings.map((w: string) => `  - ${w}`).join('\n')}

■ Fragment ID
- 生成数: ${fragments.length}
${fragments.map((f: { fragmentId: string; title: string }) => `  - ${f.fragmentId} (${f.title})`).join('\n')}

■ 生成された@graph要素
${mergeResult.merged['@graph'].map((item: Record<string, unknown>) => `- ${item['@type']} (${item['@id'] || 'no @id'})`).join('\n')}

■ 次のステップ
1. 生成されたJSON-LDをコピー
2. WordPress管理画面で該当ページを開く
3. カスタムフィールドまたはテーマのJSON-LD設定欄に貼り付け
4. Rich Results Testで検証: https://search.google.com/test/rich-results
5. 警告ゼロを確認

■ ファイル
- JSON-LD: ${jsonLdFilePath}
- サマリー: ${summaryFilePath}
`;
  
  fs.writeFileSync(summaryFilePath, summary.trim(), 'utf-8');
  log('success', `サマリー保存: ${summaryFilePath}`);
  
  // ===================================
  // Step 6: Rich Results Test用ガイド
  // ===================================
  
  section('Step 6: Rich Results Test');
  
  console.log('次のステップ:');
  console.log('');
  console.log('1. 生成されたJSON-LDをコピー:');
  console.log(`   cat "${jsonLdFilePath}"`);
  console.log('');
  console.log('2. WordPress管理画面で該当ページを開く');
  console.log('');
  console.log('3. JSON-LDを<head>内または<body>直後に挿入:');
  console.log('   <script type="application/ld+json">');
  console.log('   [生成されたJSON-LDを貼り付け]');
  console.log('   </script>');
  console.log('');
  console.log('4. Rich Results Testで検証:');
  console.log('   https://search.google.com/test/rich-results');
  console.log('');
  console.log('5. 警告ゼロを確認 ✅');
  console.log('');
  
  // ===================================
  // 完了
  // ===================================
  
  log('success', 'JSON-LD生成完了！');
  console.log('');
}

// 実行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

















