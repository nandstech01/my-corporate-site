# NANDS Corporate Site - ドキュメント

**最終更新**: 2026-01-19

---

## コアアーキテクチャ

**[CORE_ARCHITECTURE.md](./CORE_ARCHITECTURE.md)** - レリバンスエンジニアリング＆ベクトル検索の技術仕様

| システム | 場所 | 概要 |
|---------|------|------|
| レリバンスエンジニアリング | `lib/structured-data/` | Mike King理論準拠のAI検索最適化 |
| ベクトル検索 | `lib/vector/` | Fragment ID + ハイブリッド検索 |

---

## 現在のプロジェクト状態

### アクティブ: AI Search Optimizer SaaS

| 項目 | パス | 状態 |
|------|------|------|
| **SaaS Product** | [saas-product/TASKS.md](./saas-product/TASKS.md) | Phase 5 実験待ち |
| **Carve-Out基盤** | [carve-out/TASKS.md](./carve-out/TASKS.md) | Phase 0-6 完了 |

**概要**: マルチテナントSaaS基盤でAI検索最適化サービスを提供。Stripe課金統合済み。

---

## 完了プロジェクト一覧

| プロジェクト | パス | 内容 |
|-------------|------|------|
| Backend Python (RAG/ML) | [backend-python/](./backend-python/) | Django RAG API, ML評価, MLflow統合 |
| Top Page Redesign | [top-page-redesign/](./top-page-redesign/) | トップページリニューアル |
| Architect Short V2 | [architect-short-v2/](./architect-short-v2/) | YouTube台本生成V2 |
| Hybrid Article Generator | [hybrid-article-generator/](./hybrid-article-generator/) | AI記事自動生成 |
| Thumbnail AI Generation | [thumbnail-ai-generation/](./thumbnail-ai-generation/) | サムネイル自動生成 |
| Re-Vectorization | [re-vectorization/](./re-vectorization/) | 記事編集時のベクトル再生成 |
| Vector Link Reconstruction | [vector-link-reconstruction-2025/](./vector-link-reconstruction-2025/) | Fragment ID設計 |
| YouTube Short Embed | [youtube-short-embed/](./youtube-short-embed/) | Shorts埋め込み機能 |
| Video Job | [video-job/](./video-job/) | 動画メタデータ管理 |
| X Auto Post | [x-auto-post/](./x-auto-post/) | X(Twitter)自動投稿 |

---

## ディレクトリ構成

```
docs/
├── README.md                          # このファイル
│
├── saas-product/                      # 🔥 アクティブ: ASO SaaS
│   ├── TASKS.md                       # タスク管理（Phase 5-8）
│   └── phase5-data/                   # 実験データ
│
├── carve-out/                         # マルチテナント基盤
│   ├── TASKS.md                       # タスク管理（Phase 0-6 完了）
│   └── RLS_ROLLBACK.sql               # 緊急ロールバック用
│
├── backend-python/                    # Python バックエンド
│   ├── PHASES_OVERVIEW.md             # Phase概要
│   ├── hybrid-search-optimization.md  # ハイブリッド検索最適化
│   ├── vector-system-architecture.md  # ベクトルシステム設計
│   └── phase-{1-6}-*/README.md        # 各Phase詳細
│
└── [完了プロジェクト]/README.md        # 各プロジェクトの概要
```

---

## 技術スタック概要

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase Auth**

### バックエンド
- **Next.js API Routes** (TypeScript)
- **Django REST API** (Python) - RAG/ML
- **Supabase** (PostgreSQL + pgvector)

### AI/ML
- **OpenAI GPT-5.2** - 記事生成
- **OpenAI Embeddings** (1536/3072次元)
- **ハイブリッド検索** (BM25 + Vector + RRF)

### インフラ
- **Vercel** - Next.js ホスティング
- **Cloud Run** - Django API
- **Supabase** - DB/Auth
- **Stripe** - 課金

---

## 主要な実装ファイル

### ASO SaaS（71ファイル）

| カテゴリ | パス | ファイル数 |
|---------|------|-----------|
| API | `app/api/aso/` | 20 |
| Frontend | `app/aso/` | 18 |
| Components | `components/aso/` | 13 |
| Library | `lib/aso/` | 20 |

### ベクトルシステム

| ファイル | 説明 |
|---------|------|
| `lib/vector/fragment-vectorizer.ts` | Fragment ID抽出・ベクトル化 |
| `lib/vector/hybrid-search.ts` | ハイブリッド検索 |
| `lib/vector/content-extractor.ts` | コンテンツ抽出 |

### 構造化データ

| ファイル | 説明 |
|---------|------|
| `lib/structured-data/entity-relationships.ts` | エンティティ関係 |
| `lib/structured-data/unified-integration.ts` | 統合システム |

---

## クイックリンク

### 開発中
- [SaaS Product タスク](./saas-product/TASKS.md)
- [Carve-Out タスク](./carve-out/TASKS.md)

### 技術リファレンス
- [ハイブリッド検索最適化](./backend-python/hybrid-search-optimization.md)
- [ベクトルシステム設計](./backend-python/vector-system-architecture.md)
- [Backend Python Phase概要](./backend-python/PHASES_OVERVIEW.md)

### 緊急時
- [RLS ロールバック](./carve-out/RLS_ROLLBACK.sql)

---

## ドキュメント方針

- 各プロジェクトは **README.md** 1ファイルに集約
- タスク管理は **TASKS.md** で一元管理
- 完了プロジェクトの詳細ドキュメントは削除済み
- 実装ベースで最新状態を反映

---

**管理者**: NANDS 開発チーム
