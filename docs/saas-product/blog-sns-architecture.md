# CLAVI SaaS - ブログ生成 & SNS自動投稿 アーキテクチャ

## ステータス: 企画段階（打ち合わせ中）

---

## 概要

CLAVI SaaS利用企業が、RAGパイプラインで高品質なブログ記事を自動生成し、
構造化データ（JSON-LD）・Fragment ID付きで自社サイトに配信、
さらにSNSへ自動投稿する機能。

---

## データの住み分け

### CLAVI側に保管（蓄積型）

| データ | 目的 |
|--------|------|
| tenant_vectors | 企業固有の知識ベース（過去記事、FAQ、製品情報のEmbedding） |
| generated_articles | 生成した記事の元データ（本文、HTML、JSON-LD） |
| job_queue | 生成ジョブの履歴・ステータス |

**蓄積する理由:**
- 品質向上: 過去記事をRAGに使い、企業の文体で一貫性のある記事を生成
- 重複防止: 過去に書いたトピックとの類似度チェック
- 内部リンク提案: Fragment IDのベクトル検索で関連セクション発見

### 企業側に渡る（成果物）

| データ | 形式 |
|--------|------|
| ブログ記事本文 | HTML or Markdown |
| 構造化データ | JSON-LD（`<script type="application/ld+json">`） |
| 見出し構造 | Fragment ID付き（`<h2 id="xxx">`） |

※ 配信済み記事は企業サイトにあるので、CLAVI解約後も残る。

---

## 技術的実現性

### 証明済み（既存コードベースで動作確認済み）

- URL解析 + Fragment ID生成 → `lib/clavi/crawler.ts`
- OpenAI Embedding (1536dim) + pgvector保存 → `lib/clavi/fragment-vectorizer.ts`
- JSON-LD構造化データ生成 → `lib/clavi/schema-generator.ts`
- Cloud Run Job → OIDC → Supabase JWT認証 → `jobs/production/index.js`
- マルチテナントRLS分離 → `clavi.current_tenant_id()`
- Stripe課金連携 → `app/api/clavi/stripe/`

### 未実装だが技術的に問題ないもの

| 機能 | 使用技術 | 難易度 |
|------|----------|--------|
| Web検索 | Brave Search API（HTTP GET） | 低 |
| Deep Research | Tavily API（HTTP POST） | 低 |
| テナントベクトル検索 | pgvector cosine similarity | 低（既存パターン） |
| LLM記事生成 | OpenAI / DeepSeek（HTTP POST） | 低 |
| WordPress配信 | WP REST API v2（Basic Auth） | 低 |
| Webhook配信 | HTTPS POST + HMAC-SHA256 | 低 |
| Pull API | Next.js API Route + API Key認証 | 低 |

### リスク・不確実性

| リスク | 影響 | 対策 |
|--------|------|------|
| 記事品質 | nands.techレベルの再現が難しい | テナント別プロンプトチューニング |
| SNS API審査 | LinkedIn/Instagramは2-4週間 | X(Twitter)から先行対応 |
| Vercelタイムアウト | 記事生成に5-15分かかる | Cloud Run Jobs（最大60分） |
| 企業機密データ | テナント間漏洩リスク | RLS + pgcrypto暗号化 |

---

## 5層RAGアーキテクチャ

```
Layer 1: Web Search    → Brave Search API（最新情報収集）
Layer 2: Deep Research → Tavily API（深い調査）
Layer 3: Company Vectors → テナント別pgvector（企業固有情報）
Layer 4: Brand Voice   → テナント設定のブランドボイス
Layer 5: Custom Prompt → テナント別カスタム指示
```

---

## 処理フロー

```
企業ユーザー → CLAVI Dashboard
  ↓
[記事生成ボタン] → POST /api/clavi/jobs/create
  ↓ （1秒以内）
job_queue INSERT → status: 'pending'
  ↓
Cloud Run Job 起動（非同期）
  ↓
RAGパイプライン実行（5-15分）
  1. Brave Search → Web情報収集
  2. Tavily → Deep Research
  3. tenant_vectors → 企業固有情報
  4. LLM生成（OpenAI / DeepSeek）
  5. Fragment ID付与
  6. JSON-LD生成
  7. Embedding生成 → tenant_vectors追加
  ↓
generated_articles INSERT
job_queue status → 'completed'
  ↓
ユーザー画面: ポーリング（3秒おき）で完了検知
  ↓
[配信ボタン] → WordPress / Webhook / Pull API
```

---

## 配信方式（3種類）

| 方式 | 対象企業 | 仕組み |
|------|----------|--------|
| WordPress REST API | WordPress利用企業 | `POST /wp-json/wp/v2/posts`（ドラフト投稿） |
| Webhook | カスタムCMS企業 | HMAC-SHA256署名付きHTTPS POST |
| Pull API | 技術力のある企業 | `GET /api/clavi/content/{tenant_id}/articles`（API Key認証） |

---

## SNS自動投稿

| Platform | API | 認証 | 投稿内容 |
|----------|-----|------|----------|
| X (Twitter) | v2 API | OAuth 1.0a | 280文字要約 + ハッシュタグ |
| LinkedIn | Marketing API | OAuth 2.0 | 3,000文字 + リンク |
| Instagram | Graph API | OAuth 2.0 | 画像 + 2,200文字キャプション |

**フロー:**
1. 記事生成完了
2. LLMで各プラットフォーム向けに要約生成
3. テナントのSNS認証情報で投稿
4. 投稿結果を記録

---

## 実装フェーズ（案）

### Phase 1: 記事生成MVP
- [ ] DBテーブル（job_queue, tenant_vectors, generated_articles）
- [ ] Cloud Run Job: blog-generate
- [ ] API: ジョブ作成 + ステータス確認
- [ ] UI: 記事生成フォーム + ポーリング表示

### Phase 2: 配信機能
- [ ] DBテーブル（delivery_configs）
- [ ] WordPress REST API Push
- [ ] Webhook配信（HMAC署名）
- [ ] Pull API
- [ ] UI: 配信設定画面

### Phase 3: SNS連携
- [ ] DBテーブル（sns_credentials, sns_posts）
- [ ] OAuth接続フロー
- [ ] LLM要約生成（プラットフォーム別）
- [ ] Cloud Run Job: sns-post
- [ ] UI: SNS接続 + 投稿履歴

### Phase 4: 課金連携
- [ ] プラン別生成回数制限
- [ ] 月間使用量トラッキング
- [ ] 超過通知

### Phase 5: 品質改善
- [ ] 記事品質スコアリング
- [ ] ジョブ失敗リトライ
- [ ] SNSエンゲージメント分析

---

## 未決事項（要打ち合わせ）

- [ ] テナントが「何を」ベクトルDBに預けるか（UI/UXフロー）
- [ ] 解約時のデータ削除ポリシー
- [ ] 無料プランでの生成回数制限
- [ ] Embedding次元数: 1536 vs 3072（コスト vs 品質）
- [ ] SNSプラットフォームの優先順位
- [ ] 記事承認フロー（自動公開 vs レビュー必須）
- [ ] 画像生成の必要性（Instagram投稿用）
- [ ] 多言語対応の範囲（日英のみ？）

---

## 技術選択

| 項目 | 選択 | 理由 |
|------|------|------|
| 言語 | Node.js (TypeScript) | 既存コードベース統一、Python不要 |
| 非同期処理 | Cloud Run Jobs | 最大60分、OIDC認証済み |
| ベクトルDB | pgvector (Supabase) | 既存インフラ、RLS対応 |
| LLM | OpenAI + DeepSeek fallback | 既存パターン踏襲 |
| 暗号化 | pgcrypto | Supabase内蔵 |
| 配信署名 | HMAC-SHA256 | 業界標準 |
