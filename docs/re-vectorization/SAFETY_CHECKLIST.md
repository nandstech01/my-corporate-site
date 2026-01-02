# 再ベクトル化機能 安全性チェックリスト

## 🛡️ 実装前チェック

### 既存システム影響確認

- [ ] **他の記事へ影響なし**
  - Fragment Vector削除は `page_path` で厳密にフィルタ
  - 編集中の記事のみが対象
  - 他の記事のベクトルは一切触らない

- [ ] **既存API再利用**
  - `/api/vectorize-blog-fragments` は既にテスト済み
  - 新規APIを作らない
  - 既存の実績あるコードを活用

- [ ] **データベーススキーマ変更なし**
  - テーブル構造変更なし
  - カラム追加なし
  - インデックス変更なし

- [ ] **既存フロー変更なし**
  - 記事保存フローに影響なし
  - 記事生成フローに影響なし
  - 他のベクトル化フローに影響なし

---

## 🔍 コード安全性チェック

### 独立性確認

- [ ] **State管理の独立**
  ```typescript
  // 既存のStateと衝突しない
  const [isReVectorizing, setIsReVectorizing] = React.useState(false);
  const [reVectorizeResult, setReVectorizeResult] = React.useState<any>(null);
  ```

- [ ] **関数の独立**
  ```typescript
  // 既存の関数を変更しない
  // 新規関数のみ追加
  const handleReVectorize = async () => { ... }
  ```

- [ ] **UI要素の独立**
  ```typescript
  // 既存フォームとは別セクション
  <div className="bg-gray-800 shadow rounded-lg p-6 mt-6">
    {/* 再ベクトル化UI */}
  </div>
  ```

### エラーハンドリング

- [ ] **Try-catch完備**
  ```typescript
  try {
    // API呼び出し
  } catch (error) {
    console.error('再ベクトル化エラー:', error);
    alert(`❌ エラー: ${error.message}`);
  } finally {
    setIsReVectorizing(false);
  }
  ```

- [ ] **ユーザーフィードバック**
  - ローディング状態表示
  - 成功メッセージ表示
  - エラーメッセージ表示
  - 確認ダイアログ表示

- [ ] **二重実行防止**
  ```typescript
  disabled={isReVectorizing || !postId}
  ```

---

## 🗄️ データベース安全性チェック

### トランザクション安全性

- [ ] **削除範囲の限定**
  ```typescript
  // page_pathで厳密にフィルタ
  await fragmentVectorStore.clearFragmentVectors({
    pagePathFilter: `/posts/${slug}`
  });
  ```

- [ ] **再生成の保証**
  - 削除後に必ず再生成
  - エラー時も部分的に復元可能
  - Fragment IDは記事から再抽出可能

- [ ] **他テーブルへの影響なし**
  - `posts` テーブル: 読み取りのみ
  - `fragment_vectors` テーブル: 該当記事のみ更新
  - `company_vectors` テーブル: 無関係
  - `youtube_vectors` テーブル: 無関係

### データ整合性

- [ ] **Fragment ID一貫性**
  - 記事コンテンツから自動抽出
  - 手動管理不要
  - 常に最新状態に同期

- [ ] **構造化データ自動同期**
  - Fragment IDベースで自動連携
  - hasPart/isPartOf関係維持
  - Schema.org準拠維持

---

## 🔌 API安全性チェック

### API呼び出し

- [ ] **既存APIの活用**
  - エンドポイント: `/api/vectorize-blog-fragments`
  - メソッド: `POST`
  - 認証: Supabase Auth経由

- [ ] **パラメータ検証**
  ```typescript
  if (!postId) {
    alert('記事IDが見つかりません');
    return;
  }
  ```

- [ ] **レスポンス処理**
  ```typescript
  if (response.ok && data.success) {
    // 成功処理
  } else {
    throw new Error(data.error || '再ベクトル化に失敗しました');
  }
  ```

### パフォーマンス

- [ ] **処理時間の考慮**
  - 1記事: 15-30秒程度
  - タイムアウト設定不要（Next.jsデフォルト）
  - ユーザーに処理時間を事前通知

- [ ] **OpenAI API制限**
  - 1記事あたり10-20回の呼び出し
  - レート制限内（60 RPM以内）
  - コスト: 約$0.01-0.03/記事

---

## 🧪 テスト安全性チェック

### テストシナリオ

#### 正常系テスト

- [ ] **既存記事の再ベクトル化**
  1. 編集ページにアクセス
  2. 「再ベクトル化」ボタンクリック
  3. 成功メッセージ確認
  4. Fragment ID数確認
  5. データベース確認

- [ ] **H2リライト後の再ベクトル化**
  1. H2タイトル変更
  2. 記事保存
  3. 再ベクトル化実行
  4. 新しいベクトル確認

- [ ] **本文リライト後の再ベクトル化**
  1. 本文大幅変更
  2. 記事保存
  3. 再ベクトル化実行
  4. ベクトル更新確認

#### 異常系テスト

- [ ] **記事IDなしでの実行**
  - エラーメッセージ表示
  - 処理中断

- [ ] **ネットワークエラー**
  - エラーメッセージ表示
  - ローディング状態解除

- [ ] **API エラー**
  - エラーメッセージ表示
  - 詳細ログ記録

#### 影響範囲テスト

- [ ] **他の記事への影響なし**
  ```sql
  -- テスト前後で他の記事のFragment Vectorが変わらないことを確認
  SELECT COUNT(*) FROM fragment_vectors WHERE page_path != '/posts/test-slug';
  ```

- [ ] **構造化データの整合性**
  - hasPart Schema確認
  - FAQ Schema確認
  - Author Profile確認

---

## 📋 実装手順チェック

### Phase 1: ドキュメント ✅

- [x] README.md作成
- [x] IMPLEMENTATION_PLAN.md作成
- [x] SAFETY_CHECKLIST.md作成

### Phase 2: 既存API確認 ⏳

- [ ] `/api/vectorize-blog-fragments` 動作確認
- [ ] `FragmentVectorizer` クラス理解
- [ ] `fragment_vectors` テーブルスキーマ確認
- [ ] 影響範囲マップ作成

### Phase 3: UI実装 ⏳

- [ ] State追加
- [ ] ハンドラー実装
- [ ] ボタン追加
- [ ] ローディング状態実装
- [ ] 成功/エラーメッセージ実装

### Phase 4: テスト ⏳

- [ ] 正常系テスト
- [ ] 異常系テスト
- [ ] 影響範囲テスト
- [ ] パフォーマンステスト

### Phase 5: 完了 ⏳

- [ ] 完了レポート作成
- [ ] ドキュメント最終化
- [ ] TODOリスト完了

---

## 🚨 問題発生時の対応

### 即座に実行すべきこと

1. **処理を中断**
   - ユーザーにエラー通知
   - 詳細ログ記録

2. **影響範囲確認**
   ```sql
   -- Fragment Vector総数確認
   SELECT COUNT(*) FROM fragment_vectors;
   
   -- 最新の更新確認
   SELECT * FROM fragment_vectors ORDER BY updated_at DESC LIMIT 10;
   ```

3. **ロールバック準備**
   ```bash
   # Git変更確認
   git diff app/admin/posts/[slug]/edit/page.tsx
   
   # ロールバック
   git checkout HEAD -- app/admin/posts/[slug]/edit/page.tsx
   ```

### エスカレーション基準

以下の場合は即座にユーザーに報告：

- [ ] 他の記事のFragment Vectorが削除された
- [ ] データベース構造が壊れた
- [ ] 既存機能が動かなくなった
- [ ] エラーが頻発する

---

## ✅ 最終確認

### デプロイ前チェック

- [ ] 全てのテストが成功
- [ ] ドキュメント完成
- [ ] コードレビュー完了
- [ ] 影響範囲確認完了
- [ ] ロールバック手順確認

### デプロイ後チェック

- [ ] 本番環境で動作確認
- [ ] エラーログ監視
- [ ] パフォーマンス監視
- [ ] ユーザーフィードバック収集

---

**重要**: このチェックリストの全項目を確認してから次のPhaseに進むこと。
1つでも不安な項目があれば、実装を中断してユーザーに相談すること。

---

**作成日**: 2025-12-14
**バージョン**: 1.0.0
**ステータス**: 実装前確認用

