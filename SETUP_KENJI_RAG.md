# 🧠 Kenji Harada思想RAGセットアップ手順

**作成日**: 2025年10月12日  
**目的**: Kenji Harada思想をベクトル化し、台本生成時にRAG参照する

---

## ✅ 完了した実装

### **Phase 1: プロンプトリファクタリング & GPT-5化**
- ✅ プロンプト分離（`/lib/prompts/`）
- ✅ GPT-5への完全移行
- ✅ route.ts簡潔化（1027行→439行、60%削減）
- ✅ データ正確性ルール統合
- ✅ AIアーキテクトブランディング統一

### **Phase 2: Kenji思想RAG統合**
- ✅ 思想RAG用テーブル作成（`kenji_harada_architect_knowledge`）
- ✅ ベクトル化スクリプト作成（`scripts/vectorize-kenji-thoughts.ts`）
- ✅ ハイブリッド検索統合（`source: 'kenji'`）

### **Phase 3: 管理画面作成**
- ✅ 思想RAG管理画面UI（`/admin/kenji-thought`）
- ✅ ベクトル化ステータス可視化
- ✅ アクティブ/非アクティブトグル機能

---

## 🚀 セットアップ手順

### **Step 1: Migration実行**

```bash
# Supabaseに接続してMigrationを実行
cd /Users/nands/my-corporate-site

# Option A: Supabase CLIでMigration実行
npx supabase db push

# Option B: psqlで直接実行（提供されたDATABASE_URL使用）
psql "postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres" -f supabase/migrations/20250212000000_create_kenji_thought_table.sql
```

**確認**:
```sql
-- テーブル作成確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'kenji_harada_architect_knowledge';

-- 初期データ確認
SELECT thought_id, thought_title, vectorization_status 
FROM kenji_harada_architect_knowledge;
```

**期待される結果**:
- 5件の思想データが `vectorization_status = 'pending'` で挿入される

---

### **Step 2: 思想をベクトル化**

```bash
# ベクトル化スクリプト実行
npx tsx scripts/vectorize-kenji-thoughts.ts
```

**実行内容**:
1. `vectorization_status = 'pending'` の思想を取得
2. OpenAI APIでベクトル化（`text-embedding-3-large`）
3. `embedding` カラムに保存
4. `vectorization_status = 'vectorized'` に更新

**期待される出力**:
```
🚀 Kenji Harada思想ドキュメントのベクトル化を開始します...

📝 ベクトル化対象: 5件

⏳ [vector-link-essence] ベクトルリンクの本質
   ✅ ベクトル生成完了: 1536次元
   💾 データベース更新完了

⏳ [relevance-engineering] Relevance Engineeringとは
   ✅ ベクトル生成完了: 1536次元
   💾 データベース更新完了

...（以下同様）

🎉 ========================================
✅ Kenji Harada思想ベクトル化完了！
🎉 ========================================

📊 ベクトル化状況:
   ✅ 完了: 5件
   ⏳ 保留: 0件
   ❌ エラー: 0件
```

---

### **Step 3: 管理画面で確認**

1. 開発サーバー起動
```bash
npm run dev
```

2. ブラウザで管理画面にアクセス
```
http://localhost:3000/admin/kenji-thought
```

3. **確認項目**:
   - ✅ 統計カード: 「ベクトル化済み: 5件」
   - ✅ 思想一覧: 5件表示
   - ✅ ステータスバッジ: 全て「✅ ベクトル化済み」
   - ✅ ベクトル次元: 1536次元
   - ✅ ベクトル化日時: 表示されている

---

### **Step 4: 台本生成テスト**

#### **A. 既存ブログで台本生成（Before/After比較）**

1. 既存のブログ記事を選択
```
http://localhost:3000/admin/posts
```

2. 「Generate Script」ボタンをクリック

3. **確認ポイント**:
   - ✅ GPT-5で生成されている（コンソールログ確認）
   - ✅ データ正確性ルール適用（記事にない数字は使われていない）
   - ✅ AIアーキテクト視点で書かれている
   - ✅ Kenji思想が自然に統合されている

#### **B. Kenji思想RAG検索テスト（オプション）**

Node.jsスクリプトで直接テスト:

```typescript
// test-kenji-rag.ts
import { HybridSearchSystem } from './lib/vector/hybrid-search';

async function testKenjiRAG() {
  const search = new HybridSearchSystem();
  
  const results = await search.search({
    query: 'ベクトルリンク 構造化',
    source: 'kenji',
    limit: 3,
    threshold: 0.5,
  });
  
  console.log('Kenji思想検索結果:');
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.metadata.thought_title}`);
    console.log(`   類似度: ${r.combinedScore.toFixed(3)}`);
    console.log(`   内容: ${r.content.substring(0, 100)}...`);
  });
}

testKenjiRAG();
```

```bash
npx tsx test-kenji-rag.ts
```

---

## 📊 システム構成

### **データベーステーブル**

#### **kenji_harada_architect_knowledge**
```sql
CREATE TABLE kenji_harada_architect_knowledge (
  id BIGINT PRIMARY KEY,
  thought_id VARCHAR(255) UNIQUE,
  thought_title TEXT,
  thought_category VARCHAR(100),
  thought_content TEXT,
  key_terms TEXT[],
  embedding VECTOR(1536),
  usage_context VARCHAR(100),
  priority INTEGER,
  vectorization_status VARCHAR(50),
  is_active BOOLEAN,
  ...
);
```

#### **初期データ（5件）**
1. `vector-link-essence` - ベクトルリンクの本質（優先度95）
2. `relevance-engineering` - Relevance Engineeringとは（優先度90）
3. `triple-rag` - Triple RAGの設計思想（優先度85）
4. `ai-architect-role` - AIアーキテクトの役割（優先度80）
5. `structure-philosophy` - 構造化の哲学（優先度75）

---

## 🎯 動作確認チェックリスト

### **✅ Migration**
- [ ] `kenji_harada_architect_knowledge` テーブル作成完了
- [ ] 初期データ5件挿入完了
- [ ] `match_kenji_thoughts` 関数作成完了

### **✅ ベクトル化**
- [ ] 5件全てベクトル化完了
- [ ] `vectorization_status = 'vectorized'`
- [ ] `vector_dimensions = 1536`

### **✅ 管理画面**
- [ ] `/admin/kenji-thought` アクセス可能
- [ ] 統計カード正常表示
- [ ] フィルター機能動作
- [ ] アクティブ/非アクティブトグル動作

### **✅ 台本生成**
- [ ] GPT-5で生成されている
- [ ] データ正確性ルール適用
- [ ] AIアーキテクト視点の表現
- [ ] Kenji思想が自然に統合

---

## 🔧 トラブルシューティング

### **エラー: Migration実行失敗**
```bash
# RLS（Row Level Security）を一時的に無効化
ALTER TABLE kenji_harada_architect_knowledge DISABLE ROW LEVEL SECURITY;
```

### **エラー: ベクトル化スクリプト実行エラー**
```bash
# 環境変数確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
echo $OPENAI_API_KEY

# .env.localファイル確認
cat .env.local
```

### **エラー: 管理画面でデータが表示されない**
```sql
-- データ存在確認
SELECT COUNT(*) FROM kenji_harada_architect_knowledge;

-- RLS設定確認
SELECT * FROM pg_policies WHERE tablename = 'kenji_harada_architect_knowledge';
```

---

## 📝 次のステップ

1. **セットアップ完了後**:
   - 既存ブログで台本生成テスト
   - Before/After比較
   - 品質確認

2. **本番環境デプロイ**:
   - Vercelに環境変数設定
   - Migration実行
   - ベクトル化スクリプト実行

3. **運用開始**:
   - 週5回の台本生成でKenjiらしさを確認
   - 必要に応じて思想データを追加

---

## ✅ 完了確認

全てのチェックリストが完了したら、このシステムは稼働準備完了です！

**質問や問題があれば、すぐにお知らせください。** 🚀

