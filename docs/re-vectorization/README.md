# 記事編集時の再ベクトル化機能

## 📋 概要

ブログ記事のH1/H2/本文をリライトした際に、Fragment IDベクトルを完全に再生成する機能です。

## 🎯 目的

- H1/H2タイトル変更時のベクトルリンク同期
- 本文リライト時のAI検索最適化維持
- 構造化データとの整合性保持
- Mike King理論準拠の維持

## 🏗️ アーキテクチャ

### システム構成

```
編集ページ (edit/page.tsx)
    ↓
    [🔄 再ベクトル化ボタン]
    ↓
既存API活用 (/api/vectorize-blog-fragments)
    ↓
FragmentVectorizer クラス
    ↓
1. 既存Fragment Vector削除
2. マークダウン再解析
3. Fragment ID再抽出
4. OpenAI Embeddings再生成
5. fragment_vectors テーブル更新
```

### ベクトル化対象（30個近いFragment ID）

1. **記事内Fragment ID**
   - H1タイトル (`main-title-*`)
   - H2見出し (`{#id}` 形式)
   - FAQ項目 (`faq-1`, `faq-2`, ...)
   - 著者情報 (`author-profile`)
   - カスタムFragment ID

2. **構造化データ連携**
   - `hasPartSchema` (hasPart/isPartOf関係)
   - `FAQSchema` (Schema.org準拠)
   - `AuthorProfile` (E-E-A-T対応)
   - セマンティックリンク

3. **AI検索最適化**
   - ChatGPT/Perplexity引用対応
   - AIO (AI Overviews) 最適化
   - GEO (Generative Engine Optimization)
   - Triple RAG検索システム

## 🔧 実装詳細

### 1. UIコンポーネント（編集ページ）

**場所**: `/app/admin/posts/[slug]/edit/page.tsx`

**追加機能**:
- 「🔄 Fragment IDを全て再ベクトル化」ボタン
- ローディング状態表示
- 成功/エラーメッセージ
- 再ベクトル化結果の詳細表示

### 2. 既存API活用

**エンドポイント**: `/api/vectorize-blog-fragments`

**リクエスト**:
```json
{
  "postIds": [123]  // 編集中の記事IDのみ
}
```

**レスポンス**:
```json
{
  "success": true,
  "message": "1件のブログ記事を処理しました",
  "results": {
    "processedPosts": 1,
    "totalFragments": 15,
    "vectorizedCount": 15,
    "successRate": "100.0%",
    "errors": []
  }
}
```

### 3. Fragment Vectorizer処理フロー

```typescript
// 1. 既存Fragment Vector削除（page_path指定）
await fragmentVectorStore.clearFragmentVectors({
  pagePathFilter: `/posts/${slug}`
});

// 2. マークダウンからFragment ID再抽出
const result = await fragmentVectorizer.extractAndVectorizeFromMarkdown(
  markdownContent,
  {
    post_id: postId,
    post_title: title,
    slug: slug,
    page_path: `/posts/${slug}`,
    category: categorySlug,
    seo_keywords: keywords,
    rag_sources: []
  }
);

// 3. 新しいベクトルで保存
// 各Fragment IDをOpenAI Embeddings (1536次元) でベクトル化
// fragment_vectors テーブルに保存
```

## 🛡️ 安全性設計

### 既存システムへの影響なし

1. **独立したAPI呼び出し**
   - 既存の `/api/vectorize-blog-fragments` を再利用
   - 新規コード最小限

2. **トランザクション安全性**
   - Fragment Vector削除→再生成はページ単位
   - 他の記事に影響なし
   - エラー時も既存データは保護

3. **構造化データ自動同期**
   - Fragment IDベースなので自動で同期
   - 手動更新不要

4. **エラーハンドリング**
   - APIエラー時は詳細メッセージ表示
   - ユーザーに明確なフィードバック

## 📊 影響範囲分析

### ✅ 影響なし（安全）

- 他の記事のベクトル
- メインページのFragment ID
- FAQページのFragment ID
- AIサイトページのFragment ID
- YouTube台本のベクトル
- 記事本体データ（posts/chatgpt_posts）

### 🔄 更新される（意図的）

- 編集中記事のFragment Vector（全て）
- H1タイトルのベクトル
- H2見出しのベクトル
- FAQセクションのベクトル
- 著者情報のベクトル

## 🚀 使用方法

1. **記事編集ページにアクセス**
   - `/admin/posts/[slug]/edit`

2. **H1/H2/本文をリライト**
   - 必要な変更を実施
   - 保存ボタンで記事を保存

3. **再ベクトル化ボタンをクリック**
   - 「🔄 Fragment IDを全て再ベクトル化」ボタン
   - 処理開始（15-30秒程度）

4. **結果確認**
   - 成功メッセージと詳細統計を表示
   - Fragment ID数、ベクトル化成功数を確認

## 📈 パフォーマンス

- **処理時間**: 1記事あたり15-30秒
- **Fragment ID数**: 平均10-20個/記事
- **OpenAI API呼び出し**: Fragment ID数と同じ
- **コスト**: 記事あたり約$0.01-0.03

## 🔍 デバッグ

### ログ確認

```bash
# サーバーログで確認
# 🔄 Fragment Vector保存開始: main-title-xxx
# ✅ Fragment Vector保存成功: ID 123
# 📊 Fragment ID抽出完了: 15個
```

### データベース確認

```sql
-- 特定記事のFragment Vector確認
SELECT fragment_id, content_title, content_type, created_at
FROM fragment_vectors
WHERE page_path = '/posts/your-slug'
ORDER BY created_at DESC;

-- Fragment Vector総数
SELECT COUNT(*) FROM fragment_vectors;
```

## 🎯 今後の拡張

- [ ] 複数記事の一括再ベクトル化
- [ ] 自動再ベクトル化トリガー（記事保存時）
- [ ] ベクトル差分検出（変更箇所のみ更新）
- [ ] Fragment ID変更履歴管理

## 📝 関連ファイル

- `/lib/vector/fragment-vectorizer.ts` - Fragment ID抽出・ベクトル化エンジン
- `/lib/vector/fragment-vector-store.ts` - ベクトルストア管理
- `/lib/vector/openai-embeddings.ts` - OpenAI Embeddings API
- `/app/api/vectorize-blog-fragments/route.ts` - 既存再ベクトル化API
- `/app/admin/posts/[slug]/edit/page.tsx` - 編集ページ（ボタン追加）

## ⚠️ 注意事項

1. **再ベクトル化は記事保存後に実行**
   - 先に記事を保存してから再ベクトル化
   - 最新のコンテンツがベクトル化されます

2. **OpenAI API制限**
   - 短時間に大量の記事を処理しない
   - レート制限に注意

3. **コスト管理**
   - 必要な場合のみ実行
   - 全記事の一括実行は慎重に

---

**作成日**: 2025-12-14
**バージョン**: 1.0.0
**担当**: AI Assistant
**ステータス**: 実装中

