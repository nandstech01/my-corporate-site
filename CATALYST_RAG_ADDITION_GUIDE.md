# 📚 偉人RAG（Catalyst RAG）追加ガイド

## ✅ 現在の状況

- **テーブル**: `catalyst_rag` (拡張済み)
- **登録済み**: 16件
- **残り**: 50件以上

---

## 🎯 追加手順

### 1️⃣ データ準備

`/rag_data/catalyst_rag_v2.json` に新しい偉人データを追加してください。

#### データ形式（必須フィールド）

```json
{
  "person": "偉人の名前",
  "quote": "原文の名言",
  "theme": "メインテーマ",
  "subthemes": ["サブテーマ1", "サブテーマ2"],
  "emotion": "感情名（日本語）",
  "emotion_code": "Emotion_Code",
  "core_message": "核心メッセージ",
  "your_voice_paraphrase": "Kenjiの声で言い換えた内容",
  "use_cases": ["intro", "twist", "climax"],
  "insertion_style": "direct_quote|allusion|paraphrase",
  "counterpoint": "反論・バランスを取る一文",
  "source_url": "出典URL（なければ'unspecified'）",
  "verify_status": "verified|credible|unverified",
  "lang": "en|ja",
  "embedding_text": "検索用キーワード（スペース区切り）"
}
```

#### フィールド詳細

| フィールド | 説明 | 例 |
|---|---|---|
| `person` | 偉人の名前 | `"アインシュタイン"` |
| `quote` | 原文の名言 | `"Imagination is more important..."` |
| `theme` | メインテーマ | `"創造性"` |
| `subthemes` | サブテーマ（配列） | `["思考の限界突破", "本質的な価値"]` |
| `emotion` | 感情名（日本語） | `"知的好奇心"` |
| `emotion_code` | 感情コード | `"Intellectual_Curiosity"` |
| `core_message` | 核心メッセージ | `"既存の知識には限界がある..."` |
| `your_voice_paraphrase` | Kenjiの声で言い換え | `"頭に詰まった知識量より..."` |
| `use_cases` | 使用箇所（配列） | `["intro", "twist", "climax"]` |
| `insertion_style` | 挿入スタイル | `"direct_quote"`, `"allusion"`, `"paraphrase"` |
| `counterpoint` | 反論・バランス | `"知識なしには、想像も空想に終わる。"` |
| `source_url` | 出典URL | `"Stanford_Commencement_Speech_2005"` |
| `verify_status` | 検証ステータス | `"verified"`, `"credible"`, `"unverified"` |
| `lang` | 言語 | `"en"` または `"ja"` |
| `embedding_text` | 検索用キーワード | `"アインシュタイン 想像力 知識 限界 創造性"` |

---

### 2️⃣ バッチ追加（10件ずつ推奨）

#### 方法A: 既存データを上書きして再ベクトル化（推奨）

```bash
# 1. catalyst_rag_v2.json に新しいデータを追加
# 2. 既存データを削除
PGPASSWORD=11925532kG1192 psql -h db.xhmhzhethpwjxuwksmuv.supabase.co -U postgres -d postgres -p 5432 -c "DELETE FROM catalyst_rag;"

# 3. ベクトル化スクリプト実行
npm run vectorize-catalyst
```

#### 方法B: 追加データのみをベクトル化

1. 新しいJSONファイルを作成（例: `catalyst_rag_batch1.json`）
2. 新しいベクトル化スクリプトを作成（例: `vectorize-catalyst-batch.ts`）
3. 実行

---

### 3️⃣ 検証

追加後、以下を確認してください：

```sql
-- 総件数確認
SELECT COUNT(*) FROM catalyst_rag;

-- 最新5件確認
SELECT person, theme, subthemes, emotion, insertion_style, lang, verify_status 
FROM catalyst_rag 
ORDER BY created_at DESC 
LIMIT 5;

-- ベクトル生成確認
SELECT COUNT(*) as total, COUNT(embedding) as vectorized 
FROM catalyst_rag;
```

---

## 🎨 挿入スタイルの選び方

| スタイル | 説明 | 使用例 |
|---|---|---|
| `direct_quote` | 原文を直接引用 | 名言そのものを使う場合 |
| `allusion` | ほのめかし | 名言の意味を暗示する表現 |
| `paraphrase` | 言い換え | Kenjiの声で完全に言い換える |

---

## 🔥 verify_status の重要性

- **verified**: 検証済み → **類似度 +0.1**
- **credible**: 信頼できる → **類似度 +0.05**
- **unverified**: 未検証 → **ボーナスなし**

検証ステータスによって検索スコアが変わるため、信頼できる出典がある場合は `verified` を推奨。

---

## 📊 推奨：偉人の選定基準

1. **多様性**: 哲学者、発明家、ビジネスリーダー、武道家、文学者など
2. **テーマの広がり**: 創造性、努力、柔軟性、戦略、目的、行動など
3. **言語バランス**: 英語と日本語の名言をバランスよく
4. **感情の多様性**: 決意、挑戦、洞察、冷静、誇り、忍耐など
5. **Kenjiとの親和性**: 構造、仕組み、静かな決意、孤独、覚悟などのテーマ

---

## ⚠️ 注意事項

1. **必ず10件ずつ追加**: 一度に大量追加するとOpenAI APIレート制限に引っかかる可能性
2. **embedding_text の重要性**: 検索精度を左右するため、関連キーワードを慎重に選ぶ
3. **counterpoint は必須**: 思想のバランスを保つため、必ず反論を入れる
4. **your_voice_paraphrase**: Kenjiの声で言い換え、HeyGenで読み上げることを想定

---

## 🚀 次のステップ

残り50件の偉人データを準備できたら、以下のコマンドで追加してください：

```bash
# データ確認
cat rag_data/catalyst_rag_v2.json | jq 'length'

# 既存削除 + 再ベクトル化
PGPASSWORD=11925532kG1192 psql -h db.xhmhzhethpwjxuwksmuv.supabase.co -U postgres -d postgres -p 5432 -c "DELETE FROM catalyst_rag;" && npm run vectorize-catalyst
```

---

## 📝 現在の16件の概要

| 偉人 | テーマ | 言語 | 挿入スタイル | 検証 |
|---|---|---|---|---|
| ニーチェ | 価値の再創造 | ja | paraphrase | ✅ |
| スティーブ・ジョブズ | 探求心 | en | direct_quote | ✅ |
| アインシュタイン | シンプルさと本質 | en | direct_quote | ✅ |
| ヘミングウェイ | 逆境と成長 | en | direct_quote | ✅ |
| ブルース・リー | 柔軟性と適応 | en | direct_quote | ✅ |
| 孫子 | 戦略的思考 | ja | direct_quote | ✅ |
| フランクル | 目的の再定義 | ja | paraphrase | ✅ |
| ダ・ヴィンチ | 洗練されたシンプルさ | en | direct_quote | ✅ |
| マーク・トウェイン | 行動の重要性 | en | direct_quote | ✅ |
| セネカ | 準備と機会 | en | direct_quote | ✅ |
| エマーソン | 内なる力 | en | direct_quote | ✅ |
| 宮本武蔵 | 継続の力 | ja | direct_quote | ✅ |
| アインシュタイン | 創造性 | en | direct_quote | ✅ |
| チャーチル | 視点 | en | direct_quote | ✅ |
| 吉田松陰 | 目標設定 | ja | paraphrase | ⚠️ |
| エジソン | 努力 | en | allusion | ✅ |

---

## ✅ 完了後の確認

```sql
-- 最終確認
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT theme) as unique_themes,
  COUNT(DISTINCT lang) as languages,
  COUNT(CASE WHEN verify_status = 'verified' THEN 1 END) as verified_count
FROM catalyst_rag;
```

期待される結果:
- **total**: 66件以上（16 + 50）
- **unique_themes**: 40テーマ以上
- **languages**: 2 (en, ja)
- **verified_count**: 高いほど良い

---

**🔥 準備ができたら、いつでも追加を開始してください！**

