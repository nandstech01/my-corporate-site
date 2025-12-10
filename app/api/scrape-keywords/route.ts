import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

// Supabase Service Role Client (RLS bypass)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * スクレイピングキーワード抽出API
 * 
 * 機能:
 * 1. Brave Search APIで上位10サイトのURL取得
 * 2. 除外フィルター（広告、個人ブログ、大手EC等）
 * 3. 各サイトからH1/H2/H3/本文キーワード抽出
 * 4. hybrid_scraped_keywords RAGテーブルに保存
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      searchQuery,      // 検索クエリ（例: "AIリスキリング おすすめ"）
      maxSites = 10,    // 取得サイト数
      saveToRag = true  // RAGに保存するか
    } = await request.json();

    if (!searchQuery) {
      return NextResponse.json(
        { error: '検索クエリが必要です' },
        { status: 400 }
      );
    }

    console.log(`\n🔍 スクレイピング開始: "${searchQuery}"`);
    console.log('='.repeat(60));

    // ステップ1: Brave Search APIで上位サイトURL取得
    const urls = await fetchTopUrls(searchQuery, maxSites);
    console.log(`📊 取得URL数: ${urls.length}件`);

    if (urls.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'URLが取得できませんでした',
        searchQuery,
        timestamp: new Date().toISOString()
      });
    }

    // ステップ2: 各サイトからキーワード抽出
    const allKeywords: ScrapedKeyword[] = [];
    
    for (const url of urls) {
      try {
        console.log(`\n📄 スクレイピング: ${url}`);
        const keywords = await scrapeKeywordsFromUrl(url);
        
        // 検索クエリとURL情報を追加
        keywords.forEach(kw => {
          kw.searchQuery = searchQuery;
          kw.sourceUrls = [url];
        });
        
        allKeywords.push(...keywords);
        console.log(`  → ${keywords.length}件のキーワード抽出`);
      } catch (error) {
        console.error(`  ❌ スクレイピングエラー: ${error}`);
      }
    }

    // ステップ3: キーワード重複統合と頻度カウント
    const consolidatedKeywords = consolidateKeywords(allKeywords);
    console.log(`\n📊 統合後キーワード数: ${consolidatedKeywords.length}件`);

    // ステップ4: RAGテーブルに保存
    let savedCount = 0;
    if (saveToRag && consolidatedKeywords.length > 0) {
      console.log('\n💾 RAGテーブルに保存中...');
      savedCount = await saveKeywordsToRag(consolidatedKeywords, searchQuery);
      console.log(`✅ ${savedCount}件のキーワードを保存完了`);
    }

    // キーワードをタイプ別に整理
    const keywordsByType = {
      h1: consolidatedKeywords.filter(k => k.keywordType === 'h1'),
      h2: consolidatedKeywords.filter(k => k.keywordType === 'h2'),
      h3: consolidatedKeywords.filter(k => k.keywordType === 'h3'),
      body: consolidatedKeywords.filter(k => k.keywordType === 'body')
    };

    return NextResponse.json({
      success: true,
      searchQuery,
      totalKeywords: consolidatedKeywords.length,
      savedToRag: savedCount,
      keywordsByType: {
        h1: keywordsByType.h1.length,
        h2: keywordsByType.h2.length,
        h3: keywordsByType.h3.length,
        body: keywordsByType.body.length
      },
      keywords: {
        h1: keywordsByType.h1.slice(0, 30).map(k => k.keyword),
        h2: keywordsByType.h2.slice(0, 50).map(k => k.keyword),
        h3: keywordsByType.h3.slice(0, 50).map(k => k.keyword),
        body: keywordsByType.body.slice(0, 100).map(k => k.keyword)
      },
      sourceUrls: urls,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('スクレイピングエラー:', error);
    return NextResponse.json(
      { error: 'スクレイピングでエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================
// 型定義
// ============================================

interface ScrapedKeyword {
  keyword: string;
  keywordType: 'h1' | 'h2' | 'h3' | 'body';
  frequency: number;
  searchQuery?: string;
  sourceUrls: string[];
}

// ============================================
// 除外ドメインリスト
// ============================================

const EXCLUDED_DOMAINS = [
  // 大手ECサイト
  'amazon.co.jp', 'amazon.com', 'rakuten.co.jp', 'shopping.yahoo.co.jp',
  'kakaku.com', 'biccamera.com', 'yodobashi.com',
  
  // ニュースアグリゲーター
  'news.yahoo.co.jp', 'news.google.com', 'smartnews.com',
  
  // プレスリリース
  'prtimes.jp', 'dreamnews.jp', 'value-press.com', 'atpress.ne.jp',
  
  // SNS
  'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'tiktok.com',
  
  // 大手ポータル
  'livedoor.com', 'ameblo.jp', 'note.com', 'qiita.com',
  
  // Wikipedia等
  'wikipedia.org', 'weblio.jp',
  
  // 求人サイト
  'indeed.com', 'doda.jp', 'rikunabi.com', 'mynavi.jp',
  
  // 動画サイト
  'youtube.com', 'nicovideo.jp'
];

const EXCLUDED_PATTERNS = [
  /\/ad\//i,           // 広告パス
  /\/sponsor/i,        // スポンサー
  /\/pr\//i,           // PR
  /affiliate/i,        // アフィリエイト
  /\.pdf$/i,           // PDFファイル
];

// ============================================
// Brave Search APIでURL取得
// ============================================

async function fetchTopUrls(query: string, maxSites: number): Promise<string[]> {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
  
  if (!BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY が設定されていません');
  }

  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?${new URLSearchParams({
      q: query,
      count: String(Math.min(maxSites + 10, 20)), // 除外を考慮して多めに取得
      country: 'JP',
      search_lang: 'jp'
    })}`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brave Search API エラー: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const results = data.web?.results || [];
  
  // フィルタリング
  const filteredUrls = results
    .filter((result: any) => {
      const url = result.url || '';
      const domain = extractDomain(url);
      
      // 除外ドメインチェック
      if (EXCLUDED_DOMAINS.some(d => domain.includes(d))) {
        console.log(`  ❌ 除外: ${domain} (除外リスト)`);
        return false;
      }
      
      // 除外パターンチェック
      if (EXCLUDED_PATTERNS.some(p => p.test(url))) {
        console.log(`  ❌ 除外: ${url} (パターンマッチ)`);
        return false;
      }
      
      // 広告フラグチェック
      if (result.is_ad) {
        console.log(`  ❌ 除外: ${url} (広告)`);
        return false;
      }
      
      console.log(`  ✅ 採用: ${domain}`);
      return true;
    })
    .slice(0, maxSites)
    .map((result: any) => result.url);

  return filteredUrls;
}

// ============================================
// ページからキーワード抽出
// ============================================

async function scrapeKeywordsFromUrl(url: string): Promise<ScrapedKeyword[]> {
  const keywords: ScrapedKeyword[] = [];
  
  // ページ取得（タイムアウト設定）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // H1キーワード抽出
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      const extracted = extractKeywordsFromText(text);
      extracted.forEach(kw => {
        keywords.push({
          keyword: kw,
          keywordType: 'h1',
          frequency: 1,
          sourceUrls: [url]
        });
      });
    });

    // H2キーワード抽出
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      const extracted = extractKeywordsFromText(text);
      extracted.forEach(kw => {
        keywords.push({
          keyword: kw,
          keywordType: 'h2',
          frequency: 1,
          sourceUrls: [url]
        });
      });
    });

    // H3キーワード抽出
    $('h3').each((_, el) => {
      const text = $(el).text().trim();
      const extracted = extractKeywordsFromText(text);
      extracted.forEach(kw => {
        keywords.push({
          keyword: kw,
          keywordType: 'h3',
          frequency: 1,
          sourceUrls: [url]
        });
      });
    });

    // 本文キーワード抽出（メインコンテンツ領域優先）
    const mainSelectors = ['main', 'article', '.content', '.post', '.entry', '#content', '#main'];
    let mainContent = '';
    
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContent = element.text();
        break;
      }
    }
    
    // メインコンテンツがなければbodyから取得
    if (!mainContent) {
      // 不要な要素を除去
      $('script, style, nav, header, footer, aside, .sidebar, .navigation, .menu, .ad, .advertisement').remove();
      mainContent = $('body').text();
    }

    // 本文からキーワード抽出
    const bodyKeywords = extractKeywordsFromText(mainContent, true);
    bodyKeywords.forEach(kw => {
      keywords.push({
        keyword: kw,
        keywordType: 'body',
        frequency: 1,
        sourceUrls: [url]
      });
    });

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }

  return keywords;
}

// ============================================
// テキストからキーワード抽出
// ============================================

function extractKeywordsFromText(text: string, isBody = false): string[] {
  if (!text || text.length < 2) return [];

  // クリーンアップ
  let cleaned = text
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 短すぎる場合は除外
  if (cleaned.length < 3) return [];

  // 不要な文字除去
  cleaned = cleaned
    .replace(/[「」『』【】（）\(\)［］\[\]｛｝\{\}]/g, ' ')
    .replace(/[!！?？。、,，.:：;；]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 日本語キーワード抽出（2文字以上の意味のある単語）
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,}/g;
  const japaneseWords = cleaned.match(japanesePattern) || [];

  // 英数字キーワード抽出（AI、SEO、GPTなど）
  const englishPattern = /[A-Za-z0-9][A-Za-z0-9\-]{1,}[A-Za-z0-9]/g;
  const englishWords = cleaned.match(englishPattern) || [];

  // 複合キーワード（例：AI活用、SEO対策）
  const compoundPattern = /[A-Za-z0-9]+[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  const compoundWords = cleaned.match(compoundPattern) || [];

  // 結合して重複除去
  let allWords = Array.from(new Set([...japaneseWords, ...englishWords, ...compoundWords]));

  // 除外ワード
  const stopWords = [
    'です', 'ます', 'した', 'する', 'ある', 'いる', 'なる', 'できる',
    'この', 'その', 'あの', 'どの', 'これ', 'それ', 'あれ', 'どれ',
    'こと', 'もの', 'ため', 'ほど', 'など', 'まで', 'から', 'より',
    'として', 'について', 'において', 'による', 'によって',
    'こちら', 'そちら', 'あちら', 'こっち', 'そっち',
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
    'www', 'com', 'http', 'https', 'html', 'php', 'asp'
  ];

  allWords = allWords.filter(word => {
    // 除外ワードチェック
    if (stopWords.includes(word.toLowerCase())) return false;
    // 数字だけは除外
    if (/^\d+$/.test(word)) return false;
    // 1文字は除外
    if (word.length < 2) return false;
    return true;
  });

  // 本文の場合は頻度でフィルタリング（あまりに一般的なものを除外）
  if (isBody) {
    // 頻度の高いトップ100を返す
    const wordFreq: { [key: string]: number } = {};
    allWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const sorted = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([word]) => word);
    
    return sorted;
  }

  return allWords;
}

// ============================================
// キーワード統合
// ============================================

function consolidateKeywords(keywords: ScrapedKeyword[]): ScrapedKeyword[] {
  const consolidated: { [key: string]: ScrapedKeyword } = {};

  keywords.forEach(kw => {
    const key = `${kw.keywordType}:${kw.keyword.toLowerCase()}`;
    
    if (consolidated[key]) {
      consolidated[key].frequency += 1;
      // URL統合（重複除去）
      kw.sourceUrls.forEach(url => {
        if (!consolidated[key].sourceUrls.includes(url)) {
          consolidated[key].sourceUrls.push(url);
        }
      });
    } else {
      consolidated[key] = { ...kw };
    }
  });

  // 頻度でソート
  return Object.values(consolidated).sort((a, b) => b.frequency - a.frequency);
}

// ============================================
// RAGテーブルに保存
// ============================================

async function saveKeywordsToRag(
  keywords: ScrapedKeyword[],
  searchQuery: string
): Promise<number> {
  const embeddings = new OpenAIEmbeddings();
  let savedCount = 0;

  // バッチ処理（50件ずつ）
  const batchSize = 50;
  const batches = [];
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    batches.push(keywords.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const insertData = [];

    for (const kw of batch) {
      try {
        // ベクトル化用コンテンツ
        const content = `${kw.keywordType.toUpperCase()}キーワード: ${kw.keyword}
検索クエリ: ${searchQuery}
出現頻度: ${kw.frequency}回
出現サイト数: ${kw.sourceUrls.length}サイト`;

        // Embedding生成
        const embedding = await embeddings.embedSingle(content, 1536);

        insertData.push({
          search_query: searchQuery,
          keyword: kw.keyword,
          keyword_type: kw.keywordType,
          frequency: kw.frequency,
          source_urls: kw.sourceUrls,
          source_count: kw.sourceUrls.length,
          content: content,
          embedding: embedding,
          metadata: {
            scraped_at: new Date().toISOString(),
            original_frequency: kw.frequency
          },
          semantic_category: detectSemanticCategory(kw.keyword),
          is_active: true
        });
      } catch (error) {
        console.error(`キーワード "${kw.keyword}" のベクトル化エラー:`, error);
      }
    }

    // バッチ挿入
    if (insertData.length > 0) {
      const { data, error } = await supabaseServiceRole
        .from('hybrid_scraped_keywords')
        .insert(insertData);

      if (error) {
        console.error('RAG保存エラー:', error);
      } else {
        savedCount += insertData.length;
      }
    }
  }

  return savedCount;
}

// ============================================
// セマンティックカテゴリ検出
// ============================================

function detectSemanticCategory(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();

  const categories: { [key: string]: string[] } = {
    'AI・機械学習': ['ai', 'gpt', 'claude', 'gemini', 'llm', '機械学習', '深層学習', 'ディープラーニング', '生成ai', 'chatgpt', 'rag'],
    'SEO・マーケティング': ['seo', 'aio', 'マーケティング', '集客', 'コンバージョン', 'cv', 'ctr', '広告', 'リスティング'],
    'Web制作': ['ホームページ', 'webサイト', 'ウェブサイト', 'lp', 'ランディングページ', 'デザイン', 'ui', 'ux', 'コーディング'],
    'ビジネス・経営': ['ビジネス', '経営', '戦略', 'マネジメント', '効率化', '自動化', 'dx', 'デジタルトランスフォーメーション'],
    'キャリア・教育': ['リスキリング', 'キャリア', '転職', '副業', 'スキル', '資格', '学習', '教育'],
    'ツール・サービス': ['ツール', 'サービス', 'アプリ', 'ソフト', 'プラットフォーム', 'システム'],
    '地域': ['滋賀', '大津', '東京', '大阪', '名古屋', '福岡', '札幌', '関東', '関西']
  };

  for (const [category, patterns] of Object.entries(categories)) {
    if (patterns.some(p => lowerKeyword.includes(p))) {
      return category;
    }
  }

  return 'その他';
}

// ============================================
// ドメイン抽出
// ============================================

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
}

