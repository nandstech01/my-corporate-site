import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface TestResults {
  timestamp: string;
  environment_check: {
    [key: string]: string;
  };
  structured_data_files: Array<{
    filename?: string;
    lines?: number;
    words?: number;
    size_kb?: number;
    type?: string;
    error?: string;
  }>;
  service_pages: Array<{
    service: string;
    status: string;
    lines?: number;
    size_kb?: number;
    error?: string;
  }>;
  summary: {
    structured_data_files_count?: number;
    service_pages_found?: number;
    service_pages_total?: number;
    environment_ready?: boolean;
    vectorization_ready?: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 コンテンツ抽出システムのテスト開始...');
    
    const results: TestResults = {
      timestamp: new Date().toISOString(),
      environment_check: {},
      structured_data_files: [],
      service_pages: [],
      summary: {}
    };

    // 1. 環境変数の確認
    results.environment_check = {
      openai_key: process.env.OPENAI_API_KEY ? 'OK (設定済み)' : 'NG (未設定)',
      database_url: process.env.DATABASE_URL ? 'OK (設定済み)' : 'NG (未設定)',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK (設定済み)' : 'NG (未設定)',
      supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK (設定済み)' : 'NG (未設定)'
    };

    // 2. レリバンスエンジニアリング関連ファイルの確認
    const structuredDataPath = join(process.cwd(), 'lib/structured-data');
    
    try {
      const files = readdirSync(structuredDataPath);
      
      for (const file of files) {
        if (file.endsWith('.ts')) {
          const filePath = join(structuredDataPath, file);
          const content = readFileSync(filePath, 'utf-8');
          const lines = content.split('\n').length;
          const words = content.split(/\s+/).length;
          
          results.structured_data_files.push({
            filename: file,
            lines: lines,
            words: words,
            size_kb: Math.round((content.length / 1024) * 100) / 100,
            type: 'structured-data'
          });
        }
      }
    } catch (error) {
      results.structured_data_files.push({
        error: `レリバンスエンジニアリング関連ファイルの読み込みエラー: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // 3. サービスページの確認
    const serviceDirectories = [
      'ai-agents', 'chatbot-development', 'vector-rag', 'aio-seo',
      'video-generation', 'hr-solutions', 'system-development',
      'sns-automation', 'mcp-servers'
    ];
    
    for (const serviceDir of serviceDirectories) {
      const servicePath = join(process.cwd(), 'app', serviceDir);
      const pageFile = join(servicePath, 'page.tsx');
      
      try {
        const content = readFileSync(pageFile, 'utf-8');
        const lines = content.split('\n').length;
        
        results.service_pages.push({
          service: serviceDir,
          status: 'OK',
          lines: lines,
          size_kb: Math.round((content.length / 1024) * 100) / 100
        });
      } catch (error) {
        results.service_pages.push({
          service: serviceDir,
          status: 'NG',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 4. サマリーの生成
    results.summary = {
      structured_data_files_count: results.structured_data_files.length,
      service_pages_found: results.service_pages.filter(p => p.status === 'OK').length,
      service_pages_total: serviceDirectories.length,
      environment_ready: Object.values(results.environment_check).every(status => status.includes('OK')),
      vectorization_ready: false // 後で実装
    };

    console.log(`✅ テスト完了:`);
    console.log(`  - レリバンスエンジニアリング関連ファイル: ${results.summary.structured_data_files_count}件`);
    console.log(`  - サービスページ: ${results.summary.service_pages_found}/${results.summary.service_pages_total}件`);
    console.log(`  - 環境変数: ${results.summary.environment_ready ? 'OK' : 'NG'}`);

    return NextResponse.json({
      success: true,
      message: 'コンテンツ抽出システムのテスト完了',
      data: results
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 