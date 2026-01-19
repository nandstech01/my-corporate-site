#!/usr/bin/env node

/**
 * ASO バッチ分析スクリプト
 * 
 * 目的:
 * - Phase 2最小実験用のバッチURL分析
 * - urls.txtからURL一覧を読み込み
 * - 各URLに対してPOST /api/aso/analyzeを実行
 * - 結果をJSON形式で保存
 * 
 * 使用方法:
 * $ npx tsx scripts/aso-batch-analyze.ts --input tests/phase2/urls.txt --output results.json
 * 
 * または package.json に追加:
 * "aso:batch-analyze": "tsx scripts/aso-batch-analyze.ts"
 * 
 * 注意:
 * - 認証トークンは環境変数 ASO_ACCESS_TOKEN から取得
 * - または、ブラウザのLocalStorageから手動コピー
 */

import fs from 'fs';
import path from 'path';

// ========================================
// 型定義
// ========================================

interface AnalysisResult {
  url: string;
  status: number;
  success: boolean;
  response?: any;
  error?: string;
  timestamp: string;
  duration_ms: number;
}

interface BatchResults {
  total: number;
  success: number;
  failed: number;
  results: AnalysisResult[];
  summary: {
    started_at: string;
    completed_at: string;
    total_duration_ms: number;
  };
}

interface CommandLineArgs {
  input: string;
  output: string;
  baseUrl: string;
  token?: string;
  delay: number;
  dryRun: boolean;
}

// ========================================
// コマンドライン引数パース
// ========================================

function parseArgs(): CommandLineArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<CommandLineArgs> = {
    baseUrl: 'http://localhost:3000',
    delay: 2000, // 2秒待機（デフォルト）
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        parsed.input = args[++i];
        break;
      case '--output':
      case '-o':
        parsed.output = args[++i];
        break;
      case '--base-url':
        parsed.baseUrl = args[++i];
        break;
      case '--token':
      case '-t':
        parsed.token = args[++i];
        break;
      case '--delay':
      case '-d':
        parsed.delay = parseInt(args[++i], 10);
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  // 必須パラメータのチェック
  if (!parsed.input || !parsed.output) {
    console.error('❌ エラー: --input と --output は必須です');
    printHelp();
    process.exit(1);
  }

  // トークンの取得（環境変数 or コマンドライン）
  if (!parsed.token) {
    parsed.token = process.env.ASO_ACCESS_TOKEN;
  }

  if (!parsed.token) {
    console.error('❌ エラー: 認証トークンが見つかりません');
    console.error('');
    console.error('以下のいずれかの方法でトークンを設定してください:');
    console.error('  1. 環境変数: export ASO_ACCESS_TOKEN=your_token');
    console.error('  2. コマンドライン: --token your_token');
    console.error('');
    console.error('トークンの取得方法:');
    console.error('  1. http://localhost:3000 にログイン（aso-test@nands.tech）');
    console.error('  2. ブラウザのDevToolsを開く');
    console.error('  3. Console で以下を実行:');
    console.error('     JSON.parse(localStorage.getItem("sb-xhmhzhethpwjxuwksmuv-auth-token")).access_token');
    console.error('  4. 表示されたトークンをコピー');
    process.exit(1);
  }

  return parsed as CommandLineArgs;
}

function printHelp() {
  console.log(`
ASO バッチ分析スクリプト

使用方法:
  npx tsx scripts/aso-batch-analyze.ts --input <urls.txt> --output <results.json>

オプション:
  -i, --input <file>      入力URLファイル（必須）
  -o, --output <file>     出力結果ファイル（必須）
  --base-url <url>        APIベースURL（デフォルト: http://localhost:3000）
  -t, --token <token>     認証トークン（省略時は環境変数 ASO_ACCESS_TOKEN を使用）
  -d, --delay <ms>        リクエスト間の待機時間（ミリ秒、デフォルト: 2000）
  --dry-run               実際にAPIを呼ばず、シミュレーションのみ実行
  -h, --help              このヘルプを表示

例:
  # 基本的な使い方
  npx tsx scripts/aso-batch-analyze.ts -i tests/phase2/urls.txt -o results.json

  # トークンを明示的に指定
  npx tsx scripts/aso-batch-analyze.ts -i urls.txt -o results.json --token eyJhbGc...

  # Dry Run（シミュレーション）
  npx tsx scripts/aso-batch-analyze.ts -i urls.txt -o results.json --dry-run

環境変数:
  ASO_ACCESS_TOKEN        認証トークン
`);
}

// ========================================
// URLファイル読み込み
// ========================================

function readUrls(filePath: string): string[] {
  console.log(`📖 URLファイル読み込み: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')); // 空行とコメントを除外

  console.log(`✅ ${urls.length} 件のURLを読み込みました\n`);

  return urls;
}

// ========================================
// URL分析API呼び出し
// ========================================

async function analyzeUrl(
  url: string,
  baseUrl: string,
  token: string,
  dryRun: boolean
): Promise<AnalysisResult> {
  const startTime = Date.now();

  if (dryRun) {
    // Dry Run: 実際にAPIを呼ばない
    console.log(`  🔍 [Dry Run] ${url}`);
    await sleep(100); // シミュレーション用の短い待機

    return {
      url,
      status: 200,
      success: true,
      response: { message: '[Dry Run] Skipped' },
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch(`${baseUrl}/api/aso/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    const duration_ms = Date.now() - startTime;
    const responseData = await response.json();

    if (response.ok) {
      console.log(`  ✅ [${response.status}] ${url} (${duration_ms}ms)`);
      return {
        url,
        status: response.status,
        success: true,
        response: responseData,
        timestamp: new Date().toISOString(),
        duration_ms,
      };
    } else {
      console.error(`  ❌ [${response.status}] ${url} - ${responseData.error || 'Unknown error'}`);
      return {
        url,
        status: response.status,
        success: false,
        error: responseData.error || 'Unknown error',
        response: responseData,
        timestamp: new Date().toISOString(),
        duration_ms,
      };
    }
  } catch (error: any) {
    const duration_ms = Date.now() - startTime;
    console.error(`  ❌ [Network Error] ${url} - ${error.message}`);
    return {
      url,
      status: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      duration_ms,
    };
  }
}

// ========================================
// バッチ実行
// ========================================

async function runBatchAnalysis(
  urls: string[],
  baseUrl: string,
  token: string,
  delay: number,
  dryRun: boolean
): Promise<BatchResults> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  console.log('🚀 バッチ分析開始');
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   Delay: ${delay}ms`);
  console.log(`   Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log('');

  const results: AnalysisResult[] = [];
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);

    const result = await analyzeUrl(url, baseUrl, token, dryRun);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failedCount++;
    }

    // 次のリクエストまで待機（最後のリクエスト後は不要）
    if (i < urls.length - 1) {
      await sleep(delay);
    }
  }

  const completedAt = new Date().toISOString();
  const totalDuration = Date.now() - startTime;

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 バッチ分析完了');
  console.log(`   Total: ${urls.length}`);
  console.log(`   Success: ${successCount} (${((successCount / urls.length) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${failedCount} (${((failedCount / urls.length) * 100).toFixed(1)}%)`);
  console.log(`   Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return {
    total: urls.length,
    success: successCount,
    failed: failedCount,
    results,
    summary: {
      started_at: startedAt,
      completed_at: completedAt,
      total_duration_ms: totalDuration,
    },
  };
}

// ========================================
// 結果保存
// ========================================

function saveResults(results: BatchResults, outputPath: string) {
  console.log('');
  console.log(`💾 結果保存中: ${outputPath}`);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`✅ 結果を保存しました`);
  console.log('');

  // エラーログも別ファイルに保存
  const errorResults = results.results.filter((r) => !r.success);
  if (errorResults.length > 0) {
    const errorLogPath = outputPath.replace('.json', '-errors.json');
    fs.writeFileSync(errorLogPath, JSON.stringify(errorResults, null, 2), 'utf-8');
    console.log(`⚠️  エラーログ: ${errorLogPath} (${errorResults.length} 件)`);
  }
}

// ========================================
// ユーティリティ
// ========================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========================================
// メイン処理
// ========================================

async function main() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 ASO バッチ分析スクリプト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const args = parseArgs();

  // URLs読み込み
  const urls = readUrls(args.input);

  if (urls.length === 0) {
    console.error('❌ エラー: URLが見つかりません');
    process.exit(1);
  }

  // 確認プロンプト（Dry Runでない場合）
  if (!args.dryRun) {
    console.log('⚠️  本番実行モード');
    console.log(`   ${urls.length} 件のURLを分析します`);
    console.log(`   予想時間: 約 ${Math.ceil((urls.length * args.delay) / 1000 / 60)} 分`);
    console.log('');
    console.log('   続行しますか？ (Ctrl+C で中断)');
    console.log('');

    // 5秒待機（キャンセル可能）
    await sleep(5000);
  }

  // バッチ実行
  const results = await runBatchAnalysis(urls, args.baseUrl, args.token!, args.delay, args.dryRun);

  // 結果保存
  saveResults(results, args.output);

  console.log('');
  console.log('✨ 完了！');
  console.log('');

  // 終了コード
  process.exit(results.failed > 0 ? 1 : 0);
}

// エラーハンドリング
process.on('unhandledRejection', (error: any) => {
  console.error('');
  console.error('❌ 予期しないエラーが発生しました:');
  console.error(error);
  process.exit(1);
});

// 実行
main();

