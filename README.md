# NANDS Corporate Site

**最終更新**: 2026-01-19

株式会社エヌアンドエスのコーポレートサイト + AI Search Optimizer SaaS

---

## プロジェクト状態

| プロジェクト | 状態 | 詳細 |
|-------------|------|------|
| **ASO SaaS** | Phase 5 実験待ち | [docs/saas-product/TASKS.md](./docs/saas-product/TASKS.md) |
| **Carve-Out基盤** | Phase 0-6 完了 | [docs/carve-out/TASKS.md](./docs/carve-out/TASKS.md) |
| **Django Backend** | Phase 1-4 完了 | [docs/backend-python/](./docs/backend-python/) |

**タスク管理**: [TASKS.md](./TASKS.md)

---

## 技術スタック

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth

### バックエンド
- Next.js API Routes
- Django REST API (RAG/ML)
- Supabase (PostgreSQL + pgvector)

### AI/ML
- OpenAI GPT-4o / Embeddings
- ハイブリッド検索 (BM25 + Vector + RRF)

### インフラ
- Vercel (Next.js)
- Cloud Run (Django)
- Supabase (DB/Auth)
- Stripe (課金)

---

## コアアーキテクチャ

**詳細**: [docs/CORE_ARCHITECTURE.md](./docs/CORE_ARCHITECTURE.md)

### lib/structured-data/ - レリバンスエンジニアリング

Mike King理論に基づくAI検索最適化システム。

| ファイル | 役割 |
|---------|------|
| `entity-relationships.ts` | エンティティ定義（Organization, Service） |
| `ai-search-optimization.ts` | AI検索最適化（knowsAbout, mentions） |
| `unified-integration.ts` | 統合JSON-LD生成 |

### lib/vector/ - ベクトル検索システム

Fragment IDベースのハイブリッド検索。

| ファイル | 役割 |
|---------|------|
| `hybrid-search.ts` | BM25 + Vector + RRF検索 |
| `fragment-vectorizer.ts` | Fragment ID自動ベクトル化 |
| `openai-embeddings.ts` | OpenAI Embeddings API |

---

## ディレクトリ構成

```
my-corporate-site/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── aso/          # ASO SaaS API
│   ├── aso/              # ASO SaaS Frontend
│   └── [pages]/          # Corporate Pages
├── backend/               # Django RAG API
├── components/            # React Components
│   └── aso/              # ASO Components
├── lib/                   # Shared Libraries ★コア機能
│   ├── structured-data/  # レリバンスエンジニアリング
│   ├── vector/           # ベクトル検索
│   └── aso/              # ASO SaaS Logic
├── docs/                  # Documentation
│   ├── CORE_ARCHITECTURE.md  # コアアーキテクチャ詳細
│   ├── saas-product/     # ASO SaaS Docs
│   ├── carve-out/        # Multi-tenant Docs
│   └── backend-python/   # Django Docs
└── supabase/             # DB Migrations
```

---

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint
npm run lint
```

### 環境変数

`.env.local` に以下を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe (ASO SaaS)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [docs/README.md](./docs/README.md) | ドキュメント一覧 |
| [docs/saas-product/TASKS.md](./docs/saas-product/TASKS.md) | ASO SaaS タスク |
| [docs/carve-out/TASKS.md](./docs/carve-out/TASKS.md) | Carve-Out タスク |
| [docs/backend-python/](./docs/backend-python/) | Django Backend |

---

## 主要機能

### Corporate Site
- レリバンスエンジニアリング (Mike King理論)
- Fragment ID ベクトルリンクシステム
- Schema.org 構造化データ
- AI検索最適化 (GEO/AIO)

### ASO SaaS (71ファイル)
- マルチテナント基盤 (RLS)
- URL分析・ベクトルリンク化
- Stripe課金統合
- 運営管理画面

---

**管理者**: NANDS 開発チーム
