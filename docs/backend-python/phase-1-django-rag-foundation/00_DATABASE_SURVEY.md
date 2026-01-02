# Phase 1: データベース調査結果

**調査日**: 2025年12月29日
**目的**: 既存RAGシステムの現状把握とDjango実装の影響範囲確認

---

## 📊 Supabase PostgreSQL 現状

### テーブル構成（全36テーブル）

| テーブル名 | サイズ | レコード数 | 用途 |
|-----------|-------|-----------|------|
| **fragment_vectors** | 35 MB | 1,556 | Fragment ID専用RAG（最重要） |
| **company_vectors** | 7.5 MB | 128 | 会社情報RAG |
| **trend_vectors** | 3.2 MB | 127 | トレンド情報RAG（鮮度付き） |
| **youtube_vectors** | 1.7 MB | 18 | YouTube動画RAG |
| **kenji_harada_architect_knowledge** | 576 KB | 38 | 原田賢治思想RAG（3072次元） |
| hybrid_scraped_keywords | 18 MB | - | ハイブリッド記事生成用 |
| posts | 1.2 MB | - | ブログ記事（RAG記事） |
| chatgpt_posts | 368 KB | - | ChatGPT記事（旧システム） |

### RAGテーブルの詳細

#### 1. Fragment Vectors（最大・最重要）
```
総レコード数: 1,556件
ベクトル次元: 1536
インデックス: HNSW（ベクトル検索）、GIN（全文検索）、B-tree（属性検索）
```

**content_type別分布**:
| content_type | 件数 | 割合 | 説明 |
|-------------|------|------|------|
| faq | 639 | 41% | FAQ |
| section | 555 | 36% | セクション |
| case-study | 153 | 10% | ケーススタディ |
| heading | 77 | 5% | 見出し |
| author | 48 | 3% | 著者情報 |
| service | 45 | 3% | サービス |
| youtube-medium | 12 | 1% | YouTube中尺動画 |
| youtube-short | 9 | 1% | YouTubeショート動画 |
| その他 | 18 | 1% | problem, pricing, solution, cta等 |

**重要な特徴**:
- ✅ Mike King理論準拠のFragment ID
- ✅ Complete URI（https://nands.tech/faq#faq-tech-1）
- ✅ ハイブリッド検索対応（BM25 + Vector + RRF）
- ✅ semantic_weight（セマンティック重み付け）
- ✅ target_queries（ターゲットクエリ配列）
- ✅ related_entities（関連エンティティ）

#### 2. Company Vectors
```
総レコード数: 128件
ベクトル次元: 1536
用途: 会社情報・サービス情報のRAG
```

#### 3. Trend Vectors
```
総レコード数: 127件
ベクトル次元: 1536
特徴: 鮮度スコア付き（7日間で減衰）
```

#### 4. YouTube Vectors
```
総レコード数: 18件
ベクトル次元: 1536
用途: YouTube動画の文字起こしRAG
```

#### 5. Kenji Thoughts
```
総レコード数: 38件
ベクトル次元: 3072（他と異なる！）
用途: 原田賢治の設計思想RAG
```

---

## 🔍 ハイブリッド検索システム

### 実装済みの検索関数

```sql
-- 確認されたハイブリッド検索関数（想定）
hybrid_search_fragment_vectors()
hybrid_search_company_vectors()
hybrid_search_trend_vectors()
hybrid_search_youtube_vectors()
```

### 検索アルゴリズム

```
ユーザークエリ
    ↓
┌─────────────────────────────────────┐
│ BM25全文検索（40%）                 │ ← キーワード完全一致
│ + Vector検索（60%）                  │ ← 意味的類似性
│ + Recency（30%）※Trendのみ         │ ← 鮮度スコア
│ = RRF統合（Reciprocal Rank Fusion） │
└─────────────────────────────────────┘
    ↓
combined_score = 
  0.4 * (1 / (60 + bm25_rank)) + 
  0.6 * (1 / (60 + vector_rank))
```

---

## ⚠️ 既存システムへの影響確認

### 保護すべき既存システム

#### 1. ✅ ベクトルリンク（Fragment ID）
**影響**: なし
**理由**: Django APIは**読み取り専用**でRAG検索を実行するだけ

#### 2. ✅ エンティティ関係性
**影響**: なし
**理由**: `related_entities`カラムは読み取るだけ

#### 3. ✅ 構造化データ
**影響**: なし
**理由**: Schema.orgの構造化データには一切触れない

#### 4. ✅ ハイブリッド記事生成
**場所**: `/app/api/generate-hybrid-blog/route.ts`
**影響**: なし
**理由**: 
- Django APIは**既存のNext.js APIと独立**
- Supabase接続は**読み取り専用**
- 既存の`hybrid_scraped_keywords`テーブルには触らない

---

## 🎯 Django実装の意義（骨組み検討）

### 問題: 既存RAGシステムの課題

1. **検索精度が見えない**
   - どのクエリで、どのFragment IDが返ってきたか不明
   - combined_scoreの妥当性が検証できない
   - ユーザーが求める情報が返っているか不明

2. **weight調整の根拠がない**
   - BM25:0.4、Vector:0.6の設定根拠が不明
   - 最適なweightが分からない
   - A/Bテストができない

3. **鮮度スコアの有効性が不明**
   - Trend RAGの鮮度スコア（7日減衰）が適切か不明
   - 実際の検索結果への影響が測定できない

### 解決: Django + ML評価システム

```
Django RAG API
    ↓
① 統一検索インターフェース
   - 5つのRAGを一元管理
   - 検索ログを記録
   
② ML評価システム
   - Recall@5: 上位5件に正解が含まれる割合
   - MRR: 正解の平均順位
   - NDCG: 順位を考慮した精度
   
③ A/Bテストフレームワーク
   - weight調整の効果測定
   - 最適なハイブリッド検索パラメータ発見
   
④ MLflow統合
   - 実験トラッキング
   - パラメータ最適化
   - 精度推移の可視化
```

### 具体的な価値

**Before（現状）**:
```
RAG検索 → 結果返却 → 終わり
（精度不明、改善不可）
```

**After（Django + ML評価）**:
```
RAG検索 → 結果返却 → ML評価
    ↓
Recall@5: 0.85（85%の精度）
MRR: 0.92（平均2位に正解）
NDCG: 0.88（順位考慮で88%）
    ↓
A/Bテスト: weight調整で+5%精度向上
    ↓
MLflow: 実験履歴を可視化
    ↓
継続的改善サイクル
```

---

## 🚀 Phase 1の実装方針

### 目標
**既存システムに一切影響を与えず**、Django RAG APIの基盤を構築

### 実装内容

1. **Django APIの構築**
   - Supabase接続（**読み取り専用**）
   - 既存のハイブリッド検索関数を呼び出すだけ
   - Next.jsからの検索リクエスト受付

2. **検索ログ記録**
   - 新規テーブル作成: `rag_search_logs`
   - **既存テーブルには一切触らない**

3. **Grafana可視化**
   - RAGデータ統計ダッシュボード
   - 検索ログ分析ダッシュボード

### 既存システムとの共存

```
┌────────────────────────────────────────┐
│    既存システム（変更なし）              │
├────────────────────────────────────────┤
│ Next.js API Routes                     │
│ - /api/generate-hybrid-blog ✅         │
│ - /api/vectorize-blog-fragments ✅     │
│ - /api/re-vectorize-post ✅            │
│                                         │
│ Fragment ID生成・ベクトル化 ✅         │
│ 構造化データ生成 ✅                     │
│ エンティティ関係性 ✅                   │
└────────────────────────────────────────┘
            ↓ 共存（独立実行）
┌────────────────────────────────────────┐
│    新規システム（Phase 1）              │
├────────────────────────────────────────┤
│ Django RAG API                         │
│ - POST /api/rag/search 🆕              │
│ - GET /api/rag/stats 🆕                │
│                                         │
│ ML評価システム（Phase 3） 🆕           │
│ MLflow統合（Phase 4） 🆕               │
└────────────────────────────────────────┘
            ↓ 両方接続
┌────────────────────────────────────────┐
│    Supabase PostgreSQL                 │
│    （既存テーブル保護）                 │
└────────────────────────────────────────┘
```

---

## ✅ Phase 1完了判定基準

1. ✅ Django APIが5つのRAGシステムを統一検索できる
2. ✅ 検索ログが`rag_search_logs`テーブルに記録される
3. ✅ Grafanaでログを可視化できる
4. ✅ **既存のNext.js APIが全て正常動作する**
5. ✅ **Fragment IDベクトル化が正常動作する**
6. ✅ **ハイブリッド記事生成が正常動作する**

---

## 📝 次のステップ

Phase 1実装開始：
1. Django プロジェクト設計
2. Supabase接続（読み取り専用）
3. RAG統一検索API実装
4. 検索ログ記録
5. Grafana可視化

**重要**: 既存システムへの影響を監視しながら段階的に実装

