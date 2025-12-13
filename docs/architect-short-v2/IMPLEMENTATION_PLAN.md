# 実装計画 - AIアーキテクト・ショート台本V2

**作成日:** 2025-12-12 03:15  
**決定:** ハイブリッドアプローチ（V1: シンプルRAG）  
**推定工数:** 14時間（約2日）

---

## 🎯 実装方針

### 重要な原則

```
✅ 他の機能/UIに絶対影響を出さない
✅ 既存のAPIは一切変更しない
✅ 新しいAPIを完全に分離
✅ 🏗️ショート（AIアーキテクト）ボタンのみ変更
```

### 変更対象

```
変更するボタン（1つのみ）:
✅ 🏗️ショート - 30秒、AIアーキテクトモード

変更しないボタン（3つ）:
❌ ⚡ショート - 30秒、通常モード
❌ 🎯中尺 - 130秒、通常モード
❌ 🏗️中尺 - 130秒、AIアーキテクトモード
```

---

## 📂 ファイル変更一覧

### 🆕 新規作成ファイル（5つ）

```
1. /lib/viral-hooks/hook-templates.ts          (150行)
   └─ フックパターンのテンプレート定義

2. /lib/viral-hooks/hook-optimizer.ts          (200行)
   └─ フック最適化エンジン

3. /lib/prompts/architect-short-v2.ts          (300行)
   └─ V2専用プロンプト

4. /app/api/generate-architect-short-v2/route.ts (400行)
   └─ V2専用API

5. /supabase/migrations/create_viral_hook_patterns.sql (50行)
   └─ フックパターンRAG用テーブル
```

### ✏️ 修正ファイル（1つ、10行のみ）

```
/app/admin/posts/page.tsx
  - handleGenerateScript関数を修正（10行のみ）
  - scriptMode === 'architect' && scriptType === 'short' の場合のみ
    新しいAPI /api/generate-architect-short-v2 を呼び出す
  - 他の条件は既存API /api/admin/generate-youtube-script を使用
```

### ❌ 変更しないファイル（重要）

```
/app/api/admin/generate-youtube-script/route.ts
  └─ 既存のAPI、一切変更しない

/app/admin/youtube-scripts/[scriptId]/page.tsx
  └─ 台本確認画面、一切変更しない

/lib/prompts/index.ts
  └─ 既存プロンプト、一切変更しない
```

---

## 🔄 実装フェーズ

### ✅ Phase 0: 準備・DB調査（完了）

```
- [x] プロジェクトディレクトリ作成
- [x] README.md作成
- [x] psqlでDB調査
- [x] PHASE0_DB_ANALYSIS.md作成
- [x] RAG_STRATEGY.md作成
- [x] FUTURE_V2_PLAN.md作成
- [x] 最終決定（ハイブリッドアプローチ）
```

### 🔄 Phase 1: フックパターンRAG構築（3時間）

```
- [ ] viral_hook_patterns テーブル作成
- [ ] /lib/viral-hooks/hook-templates.ts 作成
- [ ] /lib/viral-hooks/hook-optimizer.ts 作成
- [ ] 初期データ投入（50件）
- [ ] PHASE1_COMPLETION.md 作成
```

### 🔄 Phase 2: RAG検索ロジック実装（2時間）

```
- [ ] 既存RAG検索関数の確認（hybrid-search.ts）
- [ ] スコアベース条件分岐実装（0.75閾値）
- [ ] ターゲット層検出ロジック実装
- [ ] テスト実行
- [ ] PHASE2_COMPLETION.md 作成
```

### 🔄 Phase 3: V2専用プロンプト作成（2時間）

```
- [ ] /lib/prompts/architect-short-v2.ts 作成
- [ ] システムプロンプト（フック最適化版）
- [ ] ユーザープロンプト（3つのRAG統合）
- [ ] 専門用語→日常語変換ロジック
- [ ] PHASE3_COMPLETION.md 作成
```

### 🔄 Phase 4: V2専用API実装（3時間）

```
- [ ] /app/api/generate-architect-short-v2/route.ts 作成
- [ ] 全フロー統合
- [ ] エラーハンドリング
- [ ] ログ出力
- [ ] PHASE4_COMPLETION.md 作成
```

### 🔄 Phase 5: UI更新（1時間・慎重に）

```
- [ ] /app/admin/posts/page.tsx 修正（10行のみ）
- [ ] handleGenerateScript関数を慎重に修正
- [ ] 他のボタンに影響しないことを確認
- [ ] PHASE5_COMPLETION.md 作成
```

### 🔄 Phase 6: テスト（2時間）

```
- [ ] 一般層向けテスト
- [ ] 実装者向けテスト
- [ ] 上級者向けテスト
- [ ] 既存機能に影響がないことを確認
- [ ] PHASE6_COMPLETION.md 作成
```

### 🔄 Phase 7: デプロイ（1時間）

```
- [ ] Vercelデプロイ
- [ ] 本番動作確認
- [ ] PHASE7_COMPLETION.md 作成
```

---

## 🔧 Phase 5の詳細（UI更新）

### 修正内容（慎重に）

#### Before（現在のコード）

```typescript
const handleGenerateScript = async (post: Post, scriptType: 'short' | 'medium' = 'short', scriptMode: 'default' | 'architect' = 'default') => {
  // ... 確認メッセージ ...

  // ★ 全ての台本生成が同じAPIを使用
  const response = await fetch('/api/admin/generate-youtube-script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId: parseInt(originalId),
      postSlug: post.slug,
      postTitle: post.title,
      postContent: post.content,
      scriptType: scriptType,
      scriptMode: scriptMode
    }),
  });
  
  // ...
};
```

#### After（修正後）

```typescript
const handleGenerateScript = async (post: Post, scriptType: 'short' | 'medium' = 'short', scriptMode: 'default' | 'architect' = 'default') => {
  // ... 確認メッセージ ...

  // ★ AIアーキテクト・ショートのみ新しいAPIを使用
  const apiEndpoint = (scriptMode === 'architect' && scriptType === 'short')
    ? '/api/generate-architect-short-v2'
    : '/api/admin/generate-youtube-script';

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId: parseInt(originalId),
      postSlug: post.slug,
      postTitle: post.title,
      postContent: post.content,
      scriptType: scriptType,
      scriptMode: scriptMode
    }),
  });
  
  // ...
};
```

**変更点:**
- 3行追加（apiEndpoint変数定義）
- 1行修正（fetch URLを変数に変更）
- 合計4行の変更のみ
- 既存の条件分岐、エラーハンドリングは一切変更しない

---

## 🎯 影響範囲の確認

### 変更対象

```
✅ 🏗️ショート（AIアーキテクト）ボタン
   - クリック時に /api/generate-architect-short-v2 を呼び出す
   - 新しいフック最適化、RAG検索を使用
   - 約30秒で台本生成（85%のケース）
```

### 影響を受けないもの

```
❌ ⚡ショート（通常）ボタン
   - 既存API /api/admin/generate-youtube-script を使用
   - 既存のロジックをそのまま使用

❌ 🎯中尺（通常）ボタン
   - 既存API /api/admin/generate-youtube-script を使用
   - 既存のロジックをそのまま使用

❌ 🏗️中尺（AIアーキテクト）ボタン
   - 既存API /api/admin/generate-youtube-script を使用
   - 既存のロジックをそのまま使用

❌ 台本確認画面
   - /admin/youtube-scripts/[scriptId] はそのまま
   - 既存のUIを維持

❌ データベーステーブル
   - company_youtube_shorts テーブルはそのまま使用
   - 既存のカラムに保存
```

---

## 🔒 安全策

### 1. API分離

```
新しいAPI: /api/generate-architect-short-v2
既存API: /api/admin/generate-youtube-script

→ 完全に分離、既存APIに一切影響しない
```

### 2. 条件分岐

```typescript
if (scriptMode === 'architect' && scriptType === 'short') {
  // 新しいAPI
} else {
  // 既存API
}

→ 厳密な条件分岐、誤動作の可能性ゼロ
```

### 3. テスト戦略

```
1. 🏗️ショート（AIアーキテクト）をテスト
   └─ 新しいAPIが正しく動作することを確認

2. ⚡ショート（通常）をテスト
   └─ 既存APIが正しく動作することを確認

3. 🎯中尺（通常）をテスト
   └─ 既存APIが正しく動作することを確認

4. 🏗️中尺（AIアーキテクト）をテスト
   └─ 既存APIが正しく動作することを確認

→ 4つ全てのボタンを個別にテスト
```

### 4. ロールバック戦略

```
問題が発生した場合:

1. handleGenerateScript関数を元に戻す（4行のみ）
2. /api/generate-architect-short-v2 を削除
3. 新しいファイルを削除

→ 5分以内にロールバック可能
```

---

## 📊 実装スケジュール

### Day 1（7時間）

```
09:00-12:00  Phase 1: フックパターンRAG構築（3時間）
13:00-15:00  Phase 2: RAG検索ロジック実装（2時間）
15:00-17:00  Phase 3: V2専用プロンプト作成（2時間）
```

### Day 2（7時間）

```
09:00-12:00  Phase 4: V2専用API実装（3時間）
13:00-14:00  Phase 5: UI更新（1時間・慎重に）
14:00-16:00  Phase 6: テスト（2時間）
16:00-17:00  Phase 7: デプロイ（1時間）
```

---

## ✅ 完了条件

```
□ 🏗️ショート（AIアーキテクト）ボタンが新しいAPIを呼び出す
□ フック最適化が動作する
□ RAG検索が動作する
□ 台本生成が成功する（30秒以内、85%のケース）
□ 既存の3つのボタンが正常に動作する
□ 台本確認画面が正常に動作する
□ エラーハンドリングが正しく動作する
□ 本番環境で動作確認完了
```

---

**作成者:** AI Assistant  
**作成日:** 2025-12-12 03:15  
**次のステップ:** Phase 1開始

