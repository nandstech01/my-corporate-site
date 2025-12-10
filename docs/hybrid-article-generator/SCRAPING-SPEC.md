# 🔍 スクレイピング仕様書

## 概要

競合上位10サイトから H1/H2/H3/本文キーワード を抽出し、網羅的な記事生成の基盤データを収集する。

---

## 🎯 スクレイピング対象

### 取得対象
- Google検索上位10サイト（広告除外）
- H1タイトル
- H2見出し（全て）
- H3見出し（全て）
- 本文中の頻出キーワード

### 除外対象（フィルタリング）

| カテゴリ | 除外対象 | 判定方法 |
|---------|---------|---------|
| 広告 | Google広告枠 | URL/位置で判定 |
| 個人ブログ | Ameba, note, はてな, Qiita（個人） | ドメイン判定 |
| 芸能人・著名人 | 公式サイト、ファンサイト | パターンマッチ |
| プレスリリース | PR TIMES, @Press, ValuePress | ドメイン判定 |
| ニュースアグリ | Yahoo!ニュース, Googleニュース | ドメイン判定 |
| EC | Amazon, 楽天, Yahoo!ショッピング | ドメイン判定 |
| SNS | Twitter, Instagram, TikTok | ドメイン判定 |
| Wiki系 | Wikipedia, Weblio | ドメイン判定 |

### 除外ドメインリスト

```javascript
const EXCLUDED_DOMAINS = [
  // EC
  'amazon.co.jp', 'amazon.com', 'rakuten.co.jp', 'shopping.yahoo.co.jp',
  // ニュース
  'news.yahoo.co.jp', 'news.google.com',
  // プレスリリース
  'prtimes.jp', 'atpress.ne.jp', 'valuepress.com',
  // 個人ブログプラットフォーム
  'ameblo.jp', 'note.com', 'hatenablog.com', 'hatenablog.jp',
  // SNS
  'twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com',
  // Wiki
  'wikipedia.org', 'weblio.jp',
  // その他
  'youtube.com', 'pinterest.com',
];
```

---

## 🔧 技術仕様

### Step 1: URL取得（Brave MCP）

```typescript
// Brave MCP で検索
const searchResults = await mcp_brave_brave_web_search({
  query: "AIリスキリング おすすめ",
  count: 20  // 除外後10件確保のため多めに取得
});

// フィルタリング
const filteredUrls = searchResults
  .filter(result => !isExcludedDomain(result.url))
  .slice(0, 10);
```

### Step 2: キーワード抽出（Puppeteer MCP）

```typescript
// 各URLにアクセスしてキーワード抽出
for (const url of filteredUrls) {
  await mcp_puppeteer_puppeteer_navigate({ url });
  
  const keywords = await mcp_puppeteer_puppeteer_evaluate({
    script: `
      (function() {
        // H1/H2/H3抽出
        const h1 = Array.from(document.querySelectorAll('h1'))
          .map(el => el.textContent.trim());
        const h2 = Array.from(document.querySelectorAll('h2'))
          .map(el => el.textContent.trim());
        const h3 = Array.from(document.querySelectorAll('h3'))
          .map(el => el.textContent.trim());
        
        // 本文抽出
        const article = document.querySelector('article, main, .content');
        const bodyText = article ? article.textContent : '';
        
        // 日本語キーワード抽出（2文字以上）
        const extractKeywords = (text) => {
          const matches = text.match(/[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF]{2,}/g) || [];
          const frequency = {};
          matches.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
          });
          return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50);
        };
        
        return {
          h1, h2, h3,
          bodyKeywords: extractKeywords(bodyText)
        };
      })();
    `
  });
}
```

### Step 3: キーワード統合

```typescript
interface ScrapingResult {
  h1Keywords: string[];      // 全サイトのH1から抽出
  h2Keywords: string[];      // 全サイトのH2から抽出
  h3Keywords: string[];      // 全サイトのH3から抽出
  bodyKeywords: Array<{      // 全サイトの本文から抽出（頻度付き）
    word: string;
    count: number;
  }>;
}
```

---

## 📊 キーワード組み合わせルール

### 基本ルール

1. **2つのキーワードを組み合わせる**（必須）
2. **セマンティックに関連するが、類似しすぎない**
3. **地域キーワードを含める**（ロングテール対策）

### 組み合わせ例

| メインキーワード | サブキーワード | 狙い |
|----------------|---------------|------|
| AIリスキリング おすすめ | ホームページ制作 | サービス横断 |
| SNS運用 | ChatGPT | ツール連携 |
| LP 値段 | 生成AI | コスト×技術 |
| リスキリング 人気 | ベクトルDB おすすめ | 技術トレンド |
| 生成AI 料金 | ホームページ制作 | 価格比較 |
| SEO対策 とは？ | ホームページ制作 滋賀県 | 地域×サービス |

### 地域キーワード（必須）

```javascript
const REGION_KEYWORDS = {
  // 必須（地元）
  primary: ['滋賀県', '大津', '大津市', '草津', '彦根'],
  
  // 主要都市
  major: ['東京', '大阪', '名古屋', '横浜', '福岡'],
  
  // 関東圏
  kanto: ['東京都', '神奈川県', '埼玉県', '千葉県', '関東'],
  
  // その他主要都市
  others: ['札幌', '仙台', '広島', '博多', '京都', '神戸'],
};
```

---

## 📤 出力フォーマット

### JSON出力例

```json
{
  "scraping_a": {
    "query": "AIリスキリング おすすめ",
    "scraped_at": "2025-12-10T12:00:00Z",
    "sites_count": 10,
    "h1_keywords": ["おすすめ", "2025年", "最新", "比較", "選び方", "..."],
    "h2_keywords": ["メリット", "デメリット", "料金", "特徴", "..."],
    "h3_keywords": ["導入事例", "口コミ", "評判", "..."],
    "body_keywords": [
      {"word": "リスキリング", "count": 45},
      {"word": "AI", "count": 38},
      {"word": "スキル", "count": 32}
    ]
  },
  "scraping_b": {
    "query": "ホームページ制作",
    "scraped_at": "2025-12-10T12:05:00Z",
    "sites_count": 10,
    "h1_keywords": ["制作", "会社", "費用", "相場", "..."],
    "h2_keywords": ["流れ", "ポイント", "選び方", "..."],
    "h3_keywords": ["デザイン", "SEO", "保守", "..."],
    "body_keywords": [
      {"word": "制作", "count": 67},
      {"word": "デザイン", "count": 45},
      {"word": "費用", "count": 38}
    ]
  },
  "merged": {
    "all_h1_keywords": ["..."],
    "all_h2_keywords": ["..."],
    "all_body_keywords": ["..."],
    "unique_keywords_count": 150
  }
}
```

---

## 🗓️ 最終更新

2025年12月10日

