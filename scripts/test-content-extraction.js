const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

// 簡単なテスト: レリバンスエンジニアリング関連ファイルを確認
function testStructuredDataFiles() {
  console.log('🔧 レリバンスエンジニアリング関連ファイルのテスト...');
  
  const structuredDataPath = join(__dirname, '../lib/structured-data');
  
  try {
    const files = readdirSync(structuredDataPath);
    console.log(`✅ 発見されたファイル数: ${files.length}`);
    
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        console.log(`  ✓ ${file}`);
        const filePath = join(structuredDataPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').length;
        const words = content.split(/\s+/).length;
        console.log(`    行数: ${lines}, 単語数: ${words}`);
      }
    });
    
    console.log('\n✨ レリバンスエンジニアリング関連ファイルのテスト完了！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 簡単なテスト: サービスページを確認
function testServicePages() {
  console.log('\n🚀 サービスページのテスト...');
  
  const serviceDirectories = [
    'ai-agents', 'chatbot-development', 'vector-rag', 'aio-seo',
    'video-generation', 'hr-solutions', 'system-development',
    'sns-automation', 'mcp-servers'
  ];
  
  serviceDirectories.forEach(serviceDir => {
    const servicePath = join(__dirname, '../app', serviceDir);
    const pageFile = join(servicePath, 'page.tsx');
    
    try {
      const content = readFileSync(pageFile, 'utf-8');
      const lines = content.split('\n').length;
      console.log(`  ✓ ${serviceDir} - 行数: ${lines}`);
    } catch (error) {
      console.log(`  ❌ ${serviceDir} - ファイルが見つかりません`);
    }
  });
  
  console.log('\n✨ サービスページのテスト完了！');
}

// OpenAI API キーの確認
function testOpenAIKey() {
  console.log('\n🔑 OpenAI API キーのテスト...');
  
  const { config } = require('dotenv');
  config({ path: '.env.local' });
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey) {
    console.log(`✅ OpenAI API キーが設定されています: ${apiKey.substring(0, 20)}...`);
  } else {
    console.log('❌ OpenAI API キーが設定されていません');
  }
  
  console.log('\n✨ OpenAI API キーのテスト完了！');
}

// 全テストを実行
console.log('🚀 コンテンツ抽出システムのテスト開始...\n');

testStructuredDataFiles();
testServicePages();
testOpenAIKey();

console.log('\n🎉 全テスト完了！'); 