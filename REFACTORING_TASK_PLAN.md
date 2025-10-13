# 🎯 リファクタリング タスク管理計画 — 品質最優先・慎重に進める

**作成日**: 2025年10月12日  
**モデル**: gpt-4o（全て最高品質で）  
**方針**: 1つずつ慎重に、テストしながら進める

---

## ⚠️ 重要：モデルの選択

### **ユーザーのご要望**
> 「全てgpt-4oで進めてください、妥協したくないので！」

### **実装方針**
```typescript
// 全ての台本生成でgpt-4oを使用（品質最優先）
const model = 'gpt-4o'; // ショート・中尺の両方

// 理由:
// - 品質妥協なし
// - コスト < 品質
// - 週5回配信でも品質を保つ
```

**注意**: 「gpt-5」というモデルは現在存在しません。最新の最高性能モデルは「gpt-4o」です。

---

## 📋 タスク一覧（16タスク）

### **Phase 1: プロンプト分離（8タスク）**

#### **✅ Task 1-1**: プロンプト用ディレクトリ作成
```bash
mkdir -p /lib/prompts/youtube
mkdir -p /lib/prompts/sns
mkdir -p /lib/prompts/kenji-thought
```
- **所要時間**: 5分
- **リスク**: なし
- **確認**: ディレクトリが作成されたか確認

---

#### **✅ Task 1-2**: 共通ルール作成
**ファイル**: `/lib/prompts/common-rules.ts`

**内容**:
- データ正確性ルール（ブログ記事にない数字は使わない）
- トーン（カジュアル × プロフェッショナル）
- エンジニア視点
- Kenji思想コンテキスト

**チェックポイント**:
- [ ] データ正確性ルールが明確か
- [ ] トーンが適切か
- [ ] TypeScriptエラーがないか

---

#### **✅ Task 1-3**: ショート動画プロンプト分離
**ファイル**: `/lib/prompts/youtube/short-base.ts`

**内容**:
- 4フェーズ構造（Hook, Empathy, Body, CTA）
- 既存の20パターン維持
- 文字数ルール（450-500文字）
- But→So構造の統合

**チェックポイント**:
- [ ] 既存の20パターンが全て含まれているか
- [ ] 文字数ルールが明確か
- [ ] バズる構造が自然に統合されているか

---

#### **✅ Task 1-4**: 中尺動画プロンプト分離
**ファイル**: `/lib/prompts/youtube/medium-base.ts`

**内容**:
- 5フェーズ構造（Hook, Problem, Solution, Summary, CTA）
- 文字数ルール（1250-1400文字）
- YouTubeチャプター生成

**チェックポイント**:
- [ ] 5フェーズ構造が明確か
- [ ] 文字数ルールが厳格か
- [ ] チャプター生成が含まれているか

---

#### **✅ Task 1-5**: SNS別プロンプト作成（優先3つ）
**ファイル**:
- `/lib/prompts/sns/x-twitter.ts`
- `/lib/prompts/sns/linkedin.ts`
- `/lib/prompts/sns/threads.ts`

**内容**:
- X: 衝撃的な冒頭、損失回避、280文字
- LinkedIn: ビジネス価値、データドリブン、1300文字
- Threads: ストーリー形式、500文字

**チェックポイント**:
- [ ] 各SNSの特性が反映されているか
- [ ] 文字数制限が明確か
- [ ] データ正確性ルールが含まれているか

---

#### **✅ Task 1-6**: SNS別プロンプト作成（残り3つ）
**ファイル**:
- `/lib/prompts/sns/instagram.ts`
- `/lib/prompts/sns/tiktok.ts`
- `/lib/prompts/sns/lemon8.ts`

**内容**:
- Instagram: エモーショナル、2200文字
- TikTok: 超短文、100文字
- Lemon8: 実用的、1000文字

**チェックポイント**:
- [ ] 各SNSの特性が反映されているか
- [ ] 文字数制限が明確か

---

#### **✅ Task 1-7**: プロンプト統合
**ファイル**: `/lib/prompts/index.ts`

**内容**:
- 全プロンプトのexport
- システムプロンプト生成関数
- SNS別プロンプト取得関数

**チェックポイント**:
- [ ] 全てのプロンプトがexportされているか
- [ ] 関数が正しく動作するか
- [ ] TypeScriptエラーがないか

---

#### **✅ Task 1-8**: route.ts簡潔化
**ファイル**: `/app/api/admin/generate-youtube-script/route.ts`

**変更内容**:
1. プロンプトをimportで読み込み
2. システムプロンプトを簡潔化（600行 → 数行）
3. gpt-4oを全てに使用
4. 既存ロジックは一切変更しない

**重要**:
```typescript
// Before（現在・1026行）
const systemPrompt = `
  あなたはYouTubeショート動画の台本制作エキスパートです。
  ... 600行のプロンプト ...
`;

// After（簡潔化・300行）
import { buildShortScriptSystemPrompt } from '@/lib/prompts';
const systemPrompt = buildShortScriptSystemPrompt();
const model = 'gpt-4o'; // 全てgpt-4o
```

**チェックポイント**:
- [ ] プロンプトが正しくimportされているか
- [ ] 既存ロジックが一切変更されていないか
- [ ] gpt-4oが設定されているか
- [ ] TypeScriptエラーがないか

---

#### **✅ Task 1-9**: 既存機能テスト
**テスト内容**:
1. 台本生成（ショート・中尺）
2. YouTube URL登録
3. ベクトルリンク化
4. fragment_vectors同期

**確認事項**:
- [ ] 台本が正常に生成されるか
- [ ] 文字数が維持されているか（ショート450-500、中尺1250-1400）
- [ ] YouTube URL登録が正常に動作するか
- [ ] ベクトルリンク化が正常に動作するか
- [ ] fragment_vectorsに正常に同期されるか
- [ ] 他の機能に影響がないか

**もし問題があれば**: 即座に修正、再テスト

---

### **Phase 2: 思想RAGのベクトル化（3タスク）**

#### **✅ Task 2-1**: 思想RAG用テーブル作成
**ファイル**: `/supabase/migrations/xxxxx_create_kenji_thought_table.sql`

**SQL**:
```sql
CREATE TABLE kenji_harada_architect_knowledge (
  id SERIAL PRIMARY KEY,
  fragment_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_for_embedding TEXT NOT NULL,
  embedding vector(1536),
  semantic_weight FLOAT DEFAULT 1.0,
  examples TEXT[],
  related_concepts TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON kenji_harada_architect_knowledge 
  USING ivfflat (embedding vector_cosine_ops);
```

**チェックポイント**:
- [ ] テーブルが正常に作成されたか
- [ ] インデックスが作成されたか
- [ ] 既存テーブルに影響がないか

---

#### **✅ Task 2-2**: 3つの思想ドキュメントをベクトル化
**ドキュメント**:
1. AIが理解する構造の設計
2. ベクトルリンク思想
3. Triple RAG設計論

**処理**:
1. 各ドキュメントをFragment化（4-6個）
2. OpenAI text-embedding-3-large でベクトル化
3. kenji_harada_architect_knowledge テーブルに保存

**チェックポイント**:
- [ ] 3つのドキュメントが全て保存されたか
- [ ] ベクトル埋め込みが正常に生成されたか
- [ ] Fragment IDが正しく設定されたか

---

#### **✅ Task 2-3**: ハイブリッド検索に思想RAG統合
**ファイル**: `/app/api/admin/generate-youtube-script/route.ts`

**変更内容**:
```typescript
// 1. ブログフラグメント取得（既存）
const blogFragments = await hybridSearch.search({
  query: postTitle,
  source: 'fragment',
  limit: 15
});

// 2. 🆕 Kenji思想取得（新規追加）
const kenjiThoughts = await hybridSearch.search({
  query: postTitle,
  source: 'architect', // 新しいソース
  limit: 2 // 1-2個のみ
});

// 3. 統合してGPT-4oに渡す
const enhancedContent = `
  ${blogContent}
  ${blogFragments}
  ${kenjiThoughts} // 自然に統合
`;
```

**チェックポイント**:
- [ ] Kenji思想が正常に取得されるか
- [ ] ブログフラグメントとの統合が自然か
- [ ] 既存の検索ロジックに影響がないか

---

### **Phase 3: 思想RAG管理画面（3タスク）**

#### **✅ Task 3-1**: 思想RAG管理画面UI作成
**ファイル**: `/app/admin/kenji-thought/page.tsx`

**機能**:
- 思想ドキュメント一覧
- 統計情報（総数・ベクトル化済み・使用率）
- 新規追加ボタン
- 編集・削除ボタン

**チェックポイント**:
- [ ] 一覧が正常に表示されるか
- [ ] 統計情報が正確か
- [ ] UIが見やすいか

---

#### **✅ Task 3-2**: 思想RAG管理API作成
**ファイル**:
- `/app/api/admin/kenji-thought/route.ts` （一覧）
- `/app/api/admin/kenji-thought/[id]/route.ts` （詳細・更新・削除）

**機能**:
- GET: 一覧取得
- POST: 新規追加
- PUT: 更新
- DELETE: 削除

**チェックポイント**:
- [ ] 全てのAPIが正常に動作するか
- [ ] エラーハンドリングが適切か

---

#### **✅ Task 3-3**: ベクトル化ステータス可視化
**機能**:
- ベクトル化済み / 未処理
- Fragment ID表示
- ベクトル次元表示（1536次元）
- 使用統計

**チェックポイント**:
- [ ] ステータスが正確か
- [ ] Fragment IDが表示されているか
- [ ] 統計が正確か

---

### **最終テスト: Task 16**

#### **✅ Task 16**: 既存ブログで台本生成（Before/After比較）

**テスト内容**:
1. 既存のブログ記事1つ選定
2. Before: 現在のシステムで台本生成
3. After: 新しいシステムで台本生成
4. 比較:
   - 文字数が維持されているか
   - Kenjiさんの思想が自然に含まれているか
   - バズる構造が含まれているか
   - データの正確性が保たれているか

**チェックポイント**:
- [ ] 文字数: ショート450-500、中尺1250-1400
- [ ] Kenjiさんの思想が1-2個含まれているか
- [ ] ブログ記事にないデータが使われていないか
- [ ] 既存の20パターンが維持されているか
- [ ] バズる構造（But→So）が自然か

**もし問題があれば**: 即座に修正、再テスト

---

## 📊 進捗管理

### **Phase 1: プロンプト分離**
- [ ] Task 1-1: ディレクトリ作成
- [ ] Task 1-2: 共通ルール作成
- [ ] Task 1-3: ショート動画プロンプト
- [ ] Task 1-4: 中尺動画プロンプト
- [ ] Task 1-5: SNS別プロンプト（X, LinkedIn, Threads）
- [ ] Task 1-6: SNS別プロンプト（Instagram, TikTok, Lemon8）
- [ ] Task 1-7: プロンプト統合
- [ ] Task 1-8: route.ts簡潔化
- [ ] Task 1-9: 既存機能テスト

**所要時間**: 2-3時間  
**リスク**: 低

---

### **Phase 2: 思想RAGのベクトル化**
- [ ] Task 2-1: テーブル作成
- [ ] Task 2-2: ベクトル化
- [ ] Task 2-3: ハイブリッド検索統合

**所要時間**: 1-2時間  
**リスク**: 低

---

### **Phase 3: 思想RAG管理画面**
- [ ] Task 3-1: UI作成
- [ ] Task 3-2: API作成
- [ ] Task 3-3: ベクトル化ステータス可視化

**所要時間**: 4-5時間  
**リスク**: 低（新規機能）

---

### **最終テスト**
- [ ] Task 16: Before/After比較

**所要時間**: 30分  
**リスク**: なし

---

## ⏱️ タイムライン

### **今日（Day 1）**
- Phase 1: プロンプト分離（Task 1-1 〜 1-9）
- 所要時間: 2-3時間

### **明日（Day 2）**
- Phase 2: 思想RAGのベクトル化（Task 2-1 〜 2-3）
- 所要時間: 1-2時間

### **明後日（Day 3）**
- Phase 3: 思想RAG管理画面（Task 3-1 〜 3-3）
- 所要時間: 4-5時間

### **Day 4**
- 最終テスト（Task 16）
- 所要時間: 30分

**合計**: 8-11時間（4日間で完了）

---

## 🔒 安全対策

### **1. 影響範囲の限定**
- ✅ route.ts のみ修正
- ✅ 他のファイルは読み取り専用
- ✅ 既存ロジックは一切変更しない

### **2. 段階的なテスト**
- ✅ Task 1-9: Phase 1完了後にテスト
- ✅ Task 2-3: Phase 2完了後にテスト
- ✅ Task 16: 全体完了後にテスト

### **3. バックアップ**
- ✅ route.ts のバックアップを作成
- ✅ 問題があれば即座にロールバック

### **4. 1つずつ慎重に**
- ✅ 1タスク完了 → 確認 → 次タスク
- ✅ 問題があれば即座に停止・修正

---

## ✅ 開始確認

**全てのタスクが明確になりました。**

**開始してよろしいですか？**

- **Phase 1（プロンプト分離）から開始**
- **1つずつ慎重に進める**
- **gpt-4oで全て進める（品質最優先）**
- **タスク完了ごとに報告**

**すぐに始められます。** 🚀

