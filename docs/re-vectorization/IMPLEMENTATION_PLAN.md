# 再ベクトル化機能 実装計画

## 📋 プロジェクト概要

**プロジェクト名**: 記事編集時の再ベクトル化機能
**目的**: H1/H2リライト後のベクトルリンク完全同期
**期間**: 2時間（慎重に実装）
**担当**: AI Assistant

## 🎯 実装目標

- [x] ドキュメント作成
- [ ] 既存API動作確認
- [ ] 編集ページにボタン追加
- [ ] 再ベクトル化ハンドラー実装
- [ ] 実際の記事でテスト
- [ ] 完了レポート作成

## 📝 タスク詳細

### Phase 1: ドキュメント作成 ✅ (15分)

**状態**: 🟢 進行中

**成果物**:
- [x] `/docs/re-vectorization/README.md`
- [x] `/docs/re-vectorization/IMPLEMENTATION_PLAN.md`
- [ ] `/docs/re-vectorization/SAFETY_CHECKLIST.md`

**確認事項**:
- システムアーキテクチャ文書化
- 影響範囲分析
- 安全性設計の明確化

---

### Phase 2: 既存API動作確認 (20分)

**状態**: ⏳ 待機中

**確認項目**:
1. `/api/vectorize-blog-fragments` の動作確認
2. `FragmentVectorizer` クラスの理解
3. `fragment_vectors` テーブルスキーマ確認
4. 既存の再ベクトル化処理フロー確認

**成果物**:
- [ ] API動作確認レポート
- [ ] 影響範囲マップ

**安全性チェック**:
- [ ] 既存のベクトルが削除されないか確認
- [ ] 他の記事に影響がないか確認
- [ ] トランザクション安全性確認

---

### Phase 3: 編集ページにボタン追加 (30分)

**状態**: ⏳ 待機中

**実装内容**:

#### 3.1 UIコンポーネント追加

**ファイル**: `/app/admin/posts/[slug]/edit/page.tsx`

**追加コード**:
```typescript
// State追加
const [isReVectorizing, setIsReVectorizing] = React.useState(false);
const [reVectorizeResult, setReVectorizeResult] = React.useState<any>(null);

// ハンドラー追加
const handleReVectorize = async () => {
  if (!postId) {
    alert('記事IDが見つかりません');
    return;
  }

  if (!confirm('この記事のFragment IDを全て再ベクトル化しますか？\n（処理時間: 約15-30秒）')) {
    return;
  }

  setIsReVectorizing(true);
  setReVectorizeResult(null);

  try {
    const response = await fetch('/api/vectorize-blog-fragments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds: [parseInt(postId)] })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setReVectorizeResult(data);
      alert(`✅ 再ベクトル化成功！\n\nFragment ID数: ${data.results.totalFragments}\nベクトル化成功: ${data.results.vectorizedCount}\n成功率: ${data.results.successRate}`);
    } else {
      throw new Error(data.error || '再ベクトル化に失敗しました');
    }
  } catch (error) {
    console.error('再ベクトル化エラー:', error);
    alert(`❌ エラー: ${error.message}`);
  } finally {
    setIsReVectorizing(false);
  }
};
```

**UIボタン配置**:
```typescript
{/* 再ベクトル化セクション */}
<div className="bg-gray-800 shadow rounded-lg p-6 mt-6">
  <h2 className="text-xl font-semibold text-white mb-4">
    🔄 Fragment ID ベクトル化
  </h2>
  <p className="text-sm text-gray-300 mb-4">
    H1/H2タイトルや本文をリライトした場合、Fragment IDベクトルを再生成してください。
    AI検索最適化（AIO/GEO）と構造化データの整合性を維持します。
  </p>
  <button
    type="button"
    onClick={handleReVectorize}
    disabled={isReVectorizing || !postId}
    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
  >
    {isReVectorizing ? '🔄 処理中...' : '🔄 Fragment IDを全て再ベクトル化'}
  </button>

  {reVectorizeResult && (
    <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-md">
      <p className="text-green-400 font-semibold">✅ 再ベクトル化成功</p>
      <ul className="text-sm text-gray-300 mt-2 space-y-1">
        <li>📊 Fragment ID数: {reVectorizeResult.results.totalFragments}</li>
        <li>✅ ベクトル化成功: {reVectorizeResult.results.vectorizedCount}</li>
        <li>📈 成功率: {reVectorizeResult.results.successRate}</li>
      </ul>
    </div>
  )}
</div>
```

**配置場所**: 記事編集フォームの下部（SEO設定の後）

**安全性チェック**:
- [ ] 既存のフォーム送信に影響がないか確認
- [ ] State管理が独立しているか確認
- [ ] エラーハンドリングが適切か確認

---

### Phase 4: ハンドラー実装 (20分)

**状態**: ⏳ 待機中

**実装内容**:
- Phase 3で実装済み（`handleReVectorize`）

**テスト項目**:
- [ ] 正常系: 再ベクトル化成功
- [ ] 異常系: APIエラー処理
- [ ] 異常系: ネットワークエラー処理
- [ ] UI: ローディング状態表示
- [ ] UI: 成功メッセージ表示

---

### Phase 5: 実際の記事でテスト (30分)

**状態**: ⏳ 待機中

**テストシナリオ**:

#### 5.1 既存記事で再ベクトル化テスト

1. **記事選択**
   - 既存の公開済み記事を選択
   - Fragment IDが多い記事を選択（10個以上）

2. **再ベクトル化実行**
   - 編集ページで「🔄 再ベクトル化」ボタンクリック
   - 処理完了を待つ

3. **結果確認**
   - Fragment ID数が正しいか
   - 成功率が100%か
   - エラーがないか

4. **データベース確認**
   ```sql
   SELECT fragment_id, content_title, content_type, updated_at
   FROM fragment_vectors
   WHERE page_path = '/posts/test-slug'
   ORDER BY updated_at DESC;
   ```

#### 5.2 H2リライト後の再ベクトル化テスト

1. **H2タイトル変更**
   - 既存のH2を変更
   - 記事を保存

2. **再ベクトル化実行**
   - ボタンクリック

3. **ベクトルリンク確認**
   - 新しいH2タイトルがベクトル化されているか
   - 古いFragment IDが削除されているか

#### 5.3 本文リライト後の再ベクトル化テスト

1. **本文大幅変更**
   - 段落を追加/削除
   - 記事を保存

2. **再ベクトル化実行**

3. **AI検索最適化確認**
   - ベクトル検索で正しく引用されるか
   - 構造化データが正しいか

**確認項目**:
- [ ] Fragment ID抽出が正しい
- [ ] OpenAI Embeddings生成成功
- [ ] fragment_vectorsテーブル更新成功
- [ ] 他の記事に影響なし
- [ ] 構造化データ同期成功

---

### Phase 6: 完了レポート作成 (15分)

**状態**: ⏳ 待機中

**成果物**:
- [ ] `/docs/re-vectorization/COMPLETION_REPORT.md`

**含める内容**:
- 実装内容サマリー
- テスト結果
- パフォーマンス測定結果
- 今後の改善提案

---

## 🛡️ 安全性チェックリスト

### コード安全性

- [ ] 既存コードを変更しない
- [ ] 新規コードは独立した関数/State
- [ ] エラーハンドリング完備
- [ ] Try-catchで例外処理

### データ安全性

- [ ] 他の記事のベクトルに影響なし
- [ ] トランザクション安全性確保
- [ ] 削除前のバックアップ不要（再生成可能）
- [ ] エラー時のロールバック

### API安全性

- [ ] 既存APIを再利用（テスト済み）
- [ ] レート制限考慮
- [ ] タイムアウト処理
- [ ] 認証・認可チェック

### UI安全性

- [ ] ローディング状態表示
- [ ] 確認ダイアログ表示
- [ ] 成功/エラーメッセージ明確
- [ ] ボタン二重クリック防止

---

## 📊 進捗管理

| Phase | タスク | 状態 | 予定時間 | 実績時間 |
|-------|--------|------|----------|----------|
| 1 | ドキュメント作成 | 🟢 進行中 | 15分 | - |
| 2 | 既存API動作確認 | ⏳ 待機中 | 20分 | - |
| 3 | 編集ページ実装 | ⏳ 待機中 | 30分 | - |
| 4 | ハンドラー実装 | ⏳ 待機中 | 20分 | - |
| 5 | テスト | ⏳ 待機中 | 30分 | - |
| 6 | 完了レポート | ⏳ 待機中 | 15分 | - |

**合計予定時間**: 2時間10分

---

## 🚨 緊急時の対応

### 問題が発生した場合

1. **即座に処理を中断**
2. **変更をロールバック**（git reset等）
3. **ユーザーに報告**
4. **詳細なエラーログを記録**

### ロールバック手順

```bash
# 変更ファイルのみ
git checkout HEAD -- app/admin/posts/[slug]/edit/page.tsx

# 全てロールバック
git reset --hard HEAD
```

---

**作成日**: 2025-12-14
**更新日**: 2025-12-14
**バージョン**: 1.0.0
**ステータス**: Phase 1 進行中

