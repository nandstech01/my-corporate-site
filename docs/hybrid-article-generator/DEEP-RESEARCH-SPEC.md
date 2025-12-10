# 🔬 ディープリサーチ仕様書

## 概要

**本物の**ディープリサーチシステム。Tavily API + DeepSeek を使用して、反復的な深掘りリサーチを実行し、包括的なレポートを生成する。

---

## 🎯 ディープリサーチの目的

1. **最新情報収集**: リアルタイムの情報を反復的に収集
2. **権威性確保**: E-E-A-T基準の情報源を優先
3. **深掘り分析**: 初期結果を分析し、追加クエリで深掘り
4. **統合レポート**: 全情報を統合した包括的レポート

---

## ⚠️ 偽物 vs 本物

### ❌ 偽物（旧実装）
```
Tavily検索1回 → 15件取得 → 終了
所要時間: 3-5秒
問題: 「ディープ」ではなく単なる検索
```

### ✅ 本物（新実装）
```
初期検索 → DeepSeek分析 → 追加クエリ生成 → 反復検索 → 最終レポート
所要時間: 3-5分
特徴: 反復的な深掘り、LLMによる分析
```

---

## 🔧 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│            本物の Deep Research アーキテクチャ                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   パラメータ:                                                    │
│   ├── depth: 3 (反復の深さ)                                     │
│   ├── breadth: 3 (各反復での検索クエリ数)                        │
│   └── 予想時間: depth × breadth × 20秒 ≈ 3-5分                  │
│                                                                 │
│   1️⃣ 初期検索 (Tavily API)                                      │
│       │                                                         │
│       ▼                                                         │
│   2️⃣ DeepSeek分析                                               │
│       ├── 検索結果を分析                                         │
│       ├── 重要な知識（learnings）を抽出                          │
│       └── JSON形式で構造化                                       │
│       │                                                         │
│       ▼                                                         │
│   3️⃣ 追加クエリ生成 (DeepSeek) ◄─────────────┐                  │
│       ├── まだ調査していない角度を特定           │                 │
│       └── depth × breadth 個のクエリ生成        │                 │
│       │                                         │                 │
│       ▼                                         │                 │
│   4️⃣ 深掘り検索 (Tavily) ──────────────────────┘                 │
│       │                               (反復: depth回)            │
│       ▼                                                         │
│   5️⃣ 最終レポート生成 (DeepSeek)                                 │
│       ├── 全learningsを統合                                      │
│       ├── サマリー（300-500文字）                                │
│       ├── 主要な発見（5-8項目）                                   │
│       ├── 推奨事項（3-5項目）                                     │
│       ├── エンティティ抽出                                       │
│       └── 統計データ抽出                                         │
│       │                                                         │
│       ▼                                                         │
│   6️⃣ RAG保存 (Supabase)                                         │
│       └── hybrid_deep_research テーブル                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API仕様

### エンドポイント

```
POST /api/deep-research
```

### リクエストパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `topic` | string | 必須 | リサーチトピック |
| `researchType` | string | `'trend'` | リサーチタイプ |
| `depth` | number | `3` | 反復の深さ |
| `breadth` | number | `3` | 各反復での検索クエリ数 |
| `saveToRag` | boolean | `true` | RAGに保存するか |
| `existingLearnings` | string[] | `[]` | 既存の学習内容 |

### リサーチタイプ

| タイプ | 説明 | 初期クエリ |
|--------|------|-----------|
| `trend` | トレンド調査 | `${topic} 最新動向 2025 トレンド` |
| `comparison` | 比較調査 | `${topic} 比較 おすすめ ランキング 2025` |
| `technical` | 技術調査 | `${topic} 仕組み 技術 実装方法` |
| `market` | 市場調査 | `${topic} 市場規模 シェア 成長率` |

### レスポンス

```json
{
  "success": true,
  "topic": "AIリスキリング",
  "researchType": "trend",
  "depth": 3,
  "breadth": 3,
  "totalLearnings": 45,
  "totalResults": 90,
  "savedToRag": 11,
  "elapsedSeconds": 180,
  "summary": "AIリスキリングは2025年...",
  "keyFindings": [
    "2025年のAI研修市場は前年比150%成長",
    "デジタル庁が2025年にAI人材育成ガイドラインを改定",
    "..."
  ],
  "recommendations": [
    "まずはChatGPT基礎から始めることを推奨",
    "..."
  ],
  "results": [...],
  "learnings": [...],
  "timestamp": "2025-12-10T12:00:00Z"
}
```

---

## 🤖 DeepSeek統合

### 分析プロンプト

```typescript
const prompt = `あなたは専門的なリサーチャーです。以下の検索結果から、「${topic}」に関する重要な知識・インサイトを抽出してください。

## 既存の知識（重複しないこと）
${existingKnowledge}

## 検索結果
${resultsText}

## 抽出ルール
1. 具体的な数字・統計データを優先
2. 会社名・サービス名・人名などの固有名詞を含める
3. 最新のトレンドや変化を特定
4. 1つの知識は1-3文で簡潔に
5. 既存の知識と重複しないこと

## 出力形式（JSON）
{
  "learnings": [
    "具体的な知識1（数字や固有名詞を含む）",
    "具体的な知識2",
    ...
  ]
}`;
```

### 追加クエリ生成プロンプト

```typescript
const prompt = `あなたは専門的なリサーチャーです。「${topic}」についてより深く調査するために、追加の検索クエリを生成してください。

## これまでの学習内容
${recentLearnings}

## ルール
1. まだ調査していない角度から質問を生成
2. 具体的で検索しやすいクエリにする
3. 日本語のクエリを生成
4. 数字や具体的な条件を含める

## 出力形式（JSON）
{
  "queries": [
    "具体的な検索クエリ1",
    "具体的な検索クエリ2",
    ...
  ]
}`;
```

---

## 📤 出力データ構造

### Learning（知識）

```typescript
interface Learning {
  content: string;    // 知識の内容
  source: string;     // 情報源
  depth: number;      // 取得した深さ
  query: string;      // 取得時のクエリ
}
```

### FinalReport（最終レポート）

```typescript
interface FinalReport {
  summary: string;           // サマリー（300-500文字）
  keyFindings: string[];     // 主要な発見（5-8項目）
  recommendations: string[]; // 推奨事項（3-5項目）
  entities: string[];        // 抽出されたエンティティ
  statistics: string[];      // 抽出された統計データ
}
```

---

## 💾 RAG保存

### 保存先テーブル

```sql
hybrid_deep_research
```

### 保存内容

1. **最終レポート**（authority_score: 1.0）
   - サマリー、主要発見、推奨事項を含む

2. **重要な学習内容**（上位10件、authority_score: 0.8）
   - 各learningを個別に保存

### 保存フォーマット

```typescript
{
  research_topic: topic,
  research_type: researchType,
  research_prompt: `Deep Research: ${topic} (${researchType})`,
  content: reportContent,
  summary: report.summary,
  source_urls: [],
  source_count: learnings.length,
  authority_score: 1.0,
  embedding: vector,
  key_findings: report.keyFindings,
  related_entities: report.entities,
  semantic_keywords: [...report.entities, ...report.statistics],
  research_date: '2025-12-10',
  data_freshness: 'recent',
  metadata: { type: 'final_report', learnings_count: learnings.length },
  is_active: true
}
```

---

## ⏱️ パフォーマンス

### 予想時間

| depth | breadth | 検索回数 | 予想時間 |
|-------|---------|----------|----------|
| 2 | 2 | 5回 | 1-2分 |
| 3 | 3 | 10回 | 3-5分 |
| 4 | 4 | 17回 | 5-8分 |

### タイムアウト設定

```typescript
export const maxDuration = 300; // 5分
```

---

## 🔑 必要なAPIキー

| APIキー | 用途 | 環境変数 |
|---------|------|----------|
| Tavily API | 検索 | `TAVILY_API_KEY` |
| DeepSeek API | 分析・生成 | `DEEPSEEK_API_KEY` |

---

## 🧪 テスト方法

### curl でテスト

```bash
curl -X POST http://localhost:3000/api/deep-research \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AIリスキリング",
    "researchType": "trend",
    "depth": 2,
    "breadth": 2
  }'
```

### 期待される動作

1. 「本物の」ディープリサーチが実行される
2. ターミナルに詳細なログが出力される
3. 3-5分で完了する（depth: 3, breadth: 3の場合）
4. 30-50件のlearningsが生成される
5. RAGに保存される

---

## 🗓️ 最終更新

2025年12月10日

### 更新履歴
- **2025-12-10**: 本物のディープリサーチに完全書き換え
  - 反復的深掘り実装
  - DeepSeek統合
  - 最終レポート生成
