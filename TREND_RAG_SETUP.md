# トレンドRAG実装ガイド

## 📰 トレンドRAGとは

今日のニュース（クマ、芸能、スポーツなど）を使って、ブログ記事を**真面目にうまく例える**ための機能です。

### 例
**ニュース:** 「北海道でクマが小熊と町に出現、住民の食べ物を食べる」

**LLMO記事の例:**
「AIも同じ。無駄な計算で電気を求めてる。だからLLMOでエンジン調整が必要！」

---

## 🎯 目的

1. **一般人が興味を持つ**: テックニュースではなく、クマ、芸能、スポーツなど
2. **記憶に残る**: 「あのクマのニュースとLLMOが繋がるんだ！」
3. **バズりやすい**: トレンドニュース × 技術解説 = シェアされやすい
4. **エンタメ性**: 真面目な技術解説だけど、入り口はエンタメ

---

## 🏗 アーキテクチャ

```
1. 管理画面でサンプルニュース生成（/admin/trend-rag）
   ↓
2. ニュースをベクトル化してDBに保存（trend_rag）
   ↓
3. 台本生成時に記事タイトルでトレンドRAG検索
   ↓
4. 関連度 > 0.4のニュースを取得
   ↓
5. GPT-5が「ブログ記事 × トレンドニュース」で比喩生成
   ↓
6. Hookで使用（冒頭で注目を引く）
```

---

## 📝 データベース構造

### `trend_rag`テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | BIGSERIAL | 主キー |
| `trend_date` | DATE | トレンド日付 |
| `trend_title` | TEXT | ニュースタイトル |
| `trend_content` | TEXT | ニュース本文（要約） |
| `trend_url` | TEXT | ニュースソースURL |
| `trend_category` | TEXT | カテゴリ（general, animal, sports, entertainment） |
| `trend_source` | TEXT | ソース（brave, manual） |
| `embedding` | VECTOR(1536) | ベクトル埋め込み |
| `relevance_score` | FLOAT | 記事との関連度スコア |
| `is_active` | BOOLEAN | アクティブフラグ |

---

## 🚀 使い方

### 1. トレンドニュース登録

```
http://localhost:3000/admin/trend-rag
```

1. 「サンプルニュース生成」をクリック
2. サンプルニュース（クマ、大谷翔平、桜など）が表示される
3. 「ベクトル化してDBに保存」をクリック

### 2. 台本生成

```
http://localhost:3000/admin/content-generation
```

1. 記事を選択（例: LLMO記事）
2. 「ショート動画台本生成」をクリック
3. **自動的にトレンドRAG検索**が実行される
4. 関連するニュースがあれば、Hookで使用される

例:
```
【Hook】
「今日、北海道でクマが町に出てきて食べ物を食べてた。AIも同じ。
無駄な計算で電気を求めてる。だからLLMOでエンジン調整が必要！」
```

---

## 🔧 カスタマイズ

### 1. サンプルニュースを変更

`/app/admin/trend-rag/page.tsx`の`sampleTrends`を編集：

```typescript
const sampleTrends = [
  {
    title: '新しいニュースタイトル',
    content: 'ニュース本文',
    url: 'https://example.com/news/new',
    category: 'general',
  },
];
```

### 2. 関連度閾値を変更

`/app/api/admin/generate-youtube-script/route.ts`の`threshold`を編集：

```typescript
const trendResults = await hybridSearch.search({
  query: postTitle,
  source: 'trend',
  limit: 3,
  threshold: 0.4, // ← ここを変更（0.0 - 1.0）
});
```

### 3. 取得件数を変更

`limit`を編集：

```typescript
limit: 3, // ← ここを変更（最大10件推奨）
```

---

## 🔍 トラブルシューティング

### Q1. トレンドニュースが取得されない

**原因:** 関連度が低い（記事とニュースの関連性が薄い）

**解決策:**
1. `threshold`を下げる（0.4 → 0.3）
2. ニュースの内容を充実させる

### Q2. 比喩が不自然

**原因:** GPT-5が適切な比喩を生成できていない

**解決策:**
1. `trendContext`のプロンプトを調整
2. ニュースの質を向上（具体的な内容を追加）

---

## 🎨 将来の改善案

### 1. Brave API統合

現在はサンプルニュースですが、将来的に：

```typescript
// Brave APIで実際のニュース取得
const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
  headers: {
    'X-Subscription-Token': process.env.BRAVE_API_KEY,
  },
  params: {
    q: '日本 ニュース 今日',
    country: 'JP',
    search_lang: 'ja',
    count: 10,
  },
});
```

### 2. Vercel Cronで自動取得

毎日朝7時に自動でニュース取得：

```typescript
// /app/api/cron/fetch-trends/route.ts
export async function GET(request: Request) {
  // 認証チェック
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Brave APIでニュース取得 → ベクトル化 → trend_ragに保存
}
```

### 3. カテゴリ自動分類

GPT-5でニュースカテゴリを自動分類：

```typescript
const category = await openai.chat.completions.create({
  model: 'gpt-5',
  messages: [
    { role: 'system', content: 'ニュースをカテゴリ分類してください（animal, sports, entertainment, general）' },
    { role: 'user', content: trend.title },
  ],
});
```

---

## 📊 実装ファイル一覧

| ファイル | 説明 |
|---------|------|
| `/app/admin/trend-rag/page.tsx` | トレンドRAG管理画面 |
| `/app/api/admin/fetch-trends/route.ts` | トレンドベクトル化API |
| `/app/api/admin/generate-youtube-script/route.ts` | 台本生成（トレンドRAG統合） |
| `/lib/vector/hybrid-search.ts` | ハイブリッド検索システム |
| `/supabase/migrations/20250214000000_create_trend_rag.sql` | trend_ragテーブル作成 |
| `/supabase/migrations/20250214000001_create_trend_rag_hybrid_search.sql` | ハイブリッド検索関数 |

---

## ✅ チェックリスト

- [x] trend_ragテーブル作成
- [x] hybrid_search_trend_vectors関数作成
- [x] トレンドRAG管理画面作成
- [x] 台本生成にトレンドRAG統合
- [x] サンプルニュース実装
- [ ] Brave API統合（将来）
- [ ] Vercel Cron自動取得（将来）
- [ ] カテゴリ自動分類（将来）

---

## 🎉 完成！

トレンドRAGが使えるようになりました！

次のステップ：
1. `/admin/trend-rag`でサンプルニュース生成
2. `/admin/content-generation`で台本生成
3. Hookでトレンドニュースが使われているか確認

---

## 📞 サポート

質問があれば、このドキュメントを参照してください。

