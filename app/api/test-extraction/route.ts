import { NextRequest, NextResponse } from 'next/server';
import { ContentExtractor } from '@/lib/vector/content-extractor';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 コンテンツ抽出システムのテスト開始...');
    
    const extractor = new ContentExtractor();
    
    // 全コンテンツを抽出
    const contents = await extractor.extractAllContent();
    
    console.log(`✅ 総コンテンツ数: ${contents.length}`);
    
    // タイプ別にカウント
    const typeCount = contents.reduce((acc, content) => {
      acc[content.metadata.type] = (acc[content.metadata.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 タイプ別コンテンツ数:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    // レリバンスエンジニアリング関連ファイルを確認
    const structuredDataContents = contents.filter(c => c.metadata.type === 'structured-data');
    console.log('\n🔧 レリバンスエンジニアリング関連ファイル:');
    structuredDataContents.forEach(content => {
      console.log(`  ✓ ${content.title}`);
      console.log(`    URL: ${content.url}`);
      console.log(`    技術概念: ${content.metadata.technicalConcepts?.join(', ')}`);
      console.log(`    文字数: ${content.metadata.wordCount}`);
      console.log('');
    });
    
    // サービスページを確認
    const serviceContents = contents.filter(c => c.metadata.type === 'service');
    console.log('\n🚀 サービスページ:');
    serviceContents.forEach(content => {
      console.log(`  ✓ ${content.title}`);
      console.log(`    URL: ${content.url}`);
      console.log(`    サービスタイプ: ${content.metadata.serviceType}`);
      console.log('');
    });
    
    // 企業情報ページを確認
    const corporateContents = contents.filter(c => c.metadata.type === 'corporate');
    console.log('\n🏢 企業情報ページ:');
    corporateContents.forEach(content => {
      console.log(`  ✓ ${content.title}`);
      console.log(`    URL: ${content.url}`);
      console.log(`    カテゴリ: ${content.metadata.category}`);
      console.log('');
    });
    
    console.log('\n✨ コンテンツ抽出完了！');
    
    return NextResponse.json({
      success: true,
      summary: {
        totalContents: contents.length,
        typeCount,
        structuredDataFiles: structuredDataContents.length,
        servicePages: serviceContents.length,
        corporatePages: corporateContents.length,
      },
      contents: contents.map(content => ({
        url: content.url,
        title: content.title,
        type: content.metadata.type,
        category: content.metadata.category,
        serviceType: content.metadata.serviceType,
        wordCount: content.metadata.wordCount,
        technicalConcepts: content.metadata.technicalConcepts?.slice(0, 5) // 最初の5つだけ
      }))
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