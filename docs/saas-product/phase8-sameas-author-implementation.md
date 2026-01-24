# Phase 8: sameAs + Author + マージ機能 実装完了レポート

**作成日**: 2026-01-20
**ステータス**: 完了

---

## 概要

Phase 8では、Google AIO（AI Overview）表示最適化のため、以下の機能を実装しました：

1. **sameAs設定** - Organization/AuthorのSNSリンク管理
2. **Author/Person Schema** - 著者情報の構造化データ
3. **型別マージロジック** - 既存JSON-LD（WordPress等）との衝突回避

---

## 実装内容

### 1. データベース拡張

**マイグレーション**: `20260120000010_tenant_settings_rpc.sql`

```sql
-- テナント設定取得RPC
CREATE OR REPLACE FUNCTION clavi.get_tenant_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER

-- テナント設定更新RPC
CREATE OR REPLACE FUNCTION clavi.update_tenant_settings(
  p_same_as jsonb DEFAULT NULL,
  p_author jsonb DEFAULT NULL
)
RETURNS jsonb
```

**背景**: Supabase REST APIは`clavi`スキーマを公開していないため、RPC経由でアクセス。

### 2. API実装

**ファイル**: `/app/api/clavi/settings/route.ts`

- `GET /api/clavi/settings` - テナント設定取得
- `PATCH /api/clavi/settings` - テナント設定更新

**認証方式**:
- Cookie認証（ブラウザ）
- Bearer token認証（API）

### 3. 型定義

**ファイル**: `/lib/clavi/types/tenant-settings.ts`

```typescript
interface TenantSettings {
  sameAs?: SameAsSettings;
  author?: AuthorSettings;
  updatedAt?: string;
}

interface SameAsSettings {
  organization?: OrganizationSameAs;  // Twitter, LinkedIn, YouTube, GitHub, custom
  author?: AuthorSameAs;              // Twitter, LinkedIn, GitHub, YouTube
}

interface AuthorSettings {
  name: string;
  jobTitle?: string;
  description?: string;
  expertise?: string[];
  image?: string;
  sameAs?: AuthorSameAs;
}
```

### 4. Schema Merger

**ファイル**: `/lib/clavi/schema-merger.ts`

既存JSON-LD（WordPress Yoast SEO等）とCLAVI生成スキーマをインテリジェントにマージ：

- **Organization**: 既存があればsameAs/knowsAboutを追加
- **Person/Author**: 常に新規追加
- **WebSite**: 既存を優先使用
- **WebPage**: hasPartを追加、author参照を追加

**重要な修正**:
- ネストされた`@context`を削除（Rich Results Test対応）

### 5. Phase 5スクリプト更新

**ファイル**: `/scripts/phase5-generate-jsonld.ts`

- Version 2.0.0にアップデート
- テナント設定（sameAs, Author）の統合
- プリセット設定（nands）追加

---

## 生成されるJSON-LD構造

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "sameAs": [
        "https://twitter.com/nands_tech",
        "https://x.com/NANDS_AI",
        "https://www.linkedin.com/company/nands-tech",
        "https://www.youtube.com/@kenjiharada_ai_site",
        "https://github.com/nands-tech"
      ]
    },
    {
      "@type": "Person",
      "@id": "#author",
      "name": "原田賢治",
      "jobTitle": "代表取締役 / AI検索最適化コンサルタント",
      "knowsAbout": ["AI検索最適化", "レリバンスエンジニアリング", ...],
      "sameAs": ["https://x.com/NANDS_AI", "https://www.linkedin.com/in/..."]
    },
    {
      "@type": "WebSite",
      "@id": "https://nands.tech#website"
    },
    {
      "@type": "WebPage",
      "author": { "@id": "#author" }
    }
  ]
}
```

---

## テスト結果

### Rich Results Test

- **結果**: 「アイテムが検出されませんでした」
- **解釈**: 正常（Organization/Person/WebSiteはリッチスニペット用ではない）
- **目的達成**: Knowledge Graph強化、E-E-A-T信号、AI検索最適化

### 生成ファイル

```
docs/saas-product/phase5-data/jsonld-output/
├── ai-agents-2026-01-20T06-25-16.json
├── ai-agents-2026-01-20T06-25-16-summary.txt
├── faq-2026-01-20T06-28-34.json
└── faq-2026-01-20T06-28-34-summary.txt
```

---

## 修正ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `lib/clavi/schema-merger.ts` | nested @context削除 |
| `lib/clavi/types/tenant-settings.ts` | Array.from互換性修正 |
| `scripts/phase5-generate-jsonld.ts` | Phase 8統合、プリセット追加 |
| `app/api/clavi/settings/route.ts` | RPC経由に変更 |
| `app/api/clavi/analyze/route.ts` | テナント設定取得をRPC経由に |

---

## 既知の制限事項

| 項目 | 状態 | 詳細 |
|------|------|------|
| エンティティ抽出 | フォールバック動作 | OpenAI APIモデル制限。基本機能は動作 |
| Fragment ID | 模擬生成 | 実運用はWordPressプラグインが生成 |

---

## 使用方法

### 1. テナント設定の保存（UI）

1. `/clavi/settings` にアクセス
2. 「ソーシャルリンク」セクションでsameAsを入力
3. 「代表者情報」セクションでAuthor情報を入力
4. 「設定を保存」をクリック

### 2. JSON-LD生成（スクリプト）

```bash
# 環境変数設定
export OPENAI_API_KEY=your_key

# 実行
npx tsx scripts/phase5-generate-jsonld.ts \
  --url https://nands.tech/ai-agents \
  --config nands
```

### 3. 生成されたJSON-LDの適用

1. 生成されたJSONファイルを開く
2. WordPressの該当ページで`<script type="application/ld+json">`として挿入
3. Rich Results Testで検証

---

## 次のステップ

- [ ] WordPress適用手順書の作成
- [ ] 実際のWordPressサイトへの適用テスト
- [ ] Google Search Consoleでの効果測定

---

## 関連ドキュメント

- [CLAVI実装調査レポート](/docs/saas-product/plan-modular-crunching-brook.md)
- [Phase 5 GSC実験計画](/docs/saas-product/phase5-gsc-experiment.md)
