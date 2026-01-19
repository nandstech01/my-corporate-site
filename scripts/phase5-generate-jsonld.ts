#!/usr/bin/env ts-node

/**
 * Phase 5: JSON-LD生成ヘルパースクリプト
 * 
 * @version 1.0.0
 * @date 2026-01-12
 * 
 * 使用方法:
 *   npx ts-node scripts/phase5-generate-jsonld.ts --url https://nands.tech/ai-agents
 * 
 * 機能:
 * 1. URLからコンテンツをクロール
 * 2. エンティティ抽出（Organization, Service, Product, knowsAbout）
 * 3. Fragment ID付きのJSON-LD生成
 * 4. Rich Results Test用の検証
 */

import { ASOCrawler } from '../lib/aso/crawler';
import { ASOEntityExtractor } from '../lib/aso/entity-extractor';
import { ASOSchemaGenerator } from '../lib/aso/schema-generator';
import * as fs from 'fs';
import * as path from 'path';

// ===================================
// 設定
// ===================================

interface CliArgs {
  url: string;
  outputDir?: string;
}

// ===================================
// ヘルパー関数
// ===================================

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const outputDirIndex = args.indexOf('--output-dir');
  
  if (urlIndex === -1 || !args[urlIndex + 1]) {
    console.error('Error: --url is required');
    console.error('Usage: npx ts-node scripts/phase5-generate-jsonld.ts --url <URL>');
    process.exit(1);
  }
  
  const url = args[urlIndex + 1];
  const outputDir = outputDirIndex !== -1 && args[outputDirIndex + 1]
    ? args[outputDirIndex + 1]
    : 'docs/saas-product/phase5-data/jsonld-output';
  
  return { url, outputDir };
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
  console.log('║  Version: 1.0.0                                            ║');
  console.log('║  Date: 2026-01-12                                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  const args = parseArgs();
  
  log('info', `対象URL: ${args.url}`);
  log('info', `出力ディレクトリ: ${args.outputDir}`);
  
  // 出力ディレクトリ作成
  if (!fs.existsSync(args.outputDir)) {
    fs.mkdirSync(args.outputDir, { recursive: true });
    log('success', '出力ディレクトリを作成しました');
  }
  
  // ===================================
  // Step 1: URLクロール
  // ===================================
  
  section('Step 1: URLクロール');
  
  const crawler = new ASOCrawler();
  
  log('info', 'クロール開始...');
  
  const crawlResult = await crawler.crawl(args.url);
  
  if (!crawlResult.success || !crawlResult.data) {
    log('error', 'クロール失敗: ' + (crawlResult.error || 'Unknown error'));
    process.exit(1);
  }
  
  log('success', 'クロール完了');
  log('info', `タイトル: ${crawlResult.data.title}`);
  log('info', `見出し数: ${crawlResult.data.headings.length}`);
  log('info', `コンテンツサイズ: ${crawlResult.data.content.length} 文字`);
  
  // ===================================
  // Step 2: エンティティ抽出
  // ===================================
  
  section('Step 2: エンティティ抽出');
  
  const extractor = new ASOEntityExtractor();
  
  log('info', 'エンティティ抽出開始...');
  
  const entities = await extractor.extractEntities({
    url: args.url,
    title: crawlResult.data.title,
    description: crawlResult.data.metaDescription || '',
    headings: crawlResult.data.headings.map(h => h.text),
    content: crawlResult.data.content
  });
  
  log('success', 'エンティティ抽出完了');
  log('info', `Organization: ${entities.organization?.name || 'なし'}`);
  log('info', `Service数: ${entities.services.length}`);
  log('info', `Product数: ${entities.products.length}`);
  log('info', `knowsAbout数: ${entities.knowsAbout.length}`);
  
  // ===================================
  // Step 3: Fragment ID生成（模擬）
  // ===================================
  
  section('Step 3: Fragment ID生成（模擬）');
  
  log('info', 'Fragment IDを模擬的に生成します...');
  log('warn', '実際のFragment IDはWordPressプラグインが自動生成します');
  
  // 見出しからFragment情報を作成
  const fragments = crawlResult.data.headings
    .filter(h => h.level === 2 || h.level === 3) // H2/H3のみ
    .map((h, index) => {
      const slug = h.text
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);
      
      // 模擬ハッシュ
      const hash = Math.random().toString(36).substring(2, 10);
      
      const fragmentId = `h${h.level}-${slug}-${hash}`;
      
      // 要約を生成（最初の30語）
      const nextHeadingIndex = crawlResult.data!.headings.findIndex(
        (_, i) => i > index && (crawlResult.data!.headings[i].level <= h.level)
      );
      
      const contentStart = crawlResult.data!.content.indexOf(h.text) + h.text.length;
      const contentEnd = nextHeadingIndex !== -1
        ? crawlResult.data!.content.indexOf(crawlResult.data!.headings[nextHeadingIndex].text)
        : contentStart + 500;
      
      const sectionContent = crawlResult.data!.content.substring(contentStart, contentEnd).trim();
      const summary = sectionContent.split(/\s+/).slice(0, 30).join(' ');
      
      return {
        fragmentId,
        title: h.text,
        summary: summary || h.text
      };
    });
  
  log('success', `Fragment ID ${fragments.length}個生成完了`);
  
  fragments.forEach(f => {
    log('info', `  - ${f.fragmentId} (${f.title})`);
  });
  
  // ===================================
  // Step 4: JSON-LD生成
  // ===================================
  
  section('Step 4: JSON-LD生成');
  
  const generator = new ASOSchemaGenerator();
  
  log('info', 'JSON-LD生成開始...');
  
  const schema = generator.generateSchema({
    url: args.url,
    title: crawlResult.data.title,
    description: crawlResult.data.metaDescription || '',
    fragments,
    entities
  });
  
  const jsonLdString = generator.formatSchema(schema);
  
  log('success', 'JSON-LD生成完了');
  
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
  const summary = `
Phase 5: JSON-LD生成レポート
========================================

URL: ${args.url}
生成日時: ${new Date().toISOString()}

■ クロール結果
- タイトル: ${crawlResult.data.title}
- メタディスクリプション: ${crawlResult.data.metaDescription || 'なし'}
- 見出し数: ${crawlResult.data.headings.length}
- コンテンツサイズ: ${crawlResult.data.content.length} 文字

■ エンティティ抽出結果
- Organization: ${entities.organization?.name || 'なし'}
- Service数: ${entities.services.length}
- Product数: ${entities.products.length}
- knowsAbout数: ${entities.knowsAbout.length}

■ Fragment ID
- 生成数: ${fragments.length}
${fragments.map(f => `  - ${f.fragmentId} (${f.title})`).join('\n')}

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











