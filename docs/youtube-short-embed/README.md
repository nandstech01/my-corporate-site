# YouTube ショート動画埋め込み統合プロジェクト

## 📋 プロジェクト概要

**目的:** ブログ記事詳細ページにYouTubeショート動画（縦動画、30秒）を埋め込み、既存の中尺動画埋め込み機能と共存させる。SEO/AIO最適化（構造化データ、エンティティ統合、ベクトルリンク）を維持・拡張する。

**開始日:** 2025-12-06  
**ステータス:** 📝 計画フェーズ  
**優先度:** 🔥 高（SEO価値: 計り知れない）

**対象プロジェクト:** `/Users/nands/my-corporate-site`  
**参考プロジェクト:** `/Users/nands/taishoku-anshin-daiko`（混同注意）

---

## 🎯 プロジェクト目標

### ビジネス目標
1. **SEO効果最大化:** リッチスニペット表示率向上、オーガニック検索流入+20-30%
2. **エンゲージメント向上:** ページ滞在時間+30-50%、直帰率-10-20%
3. **YouTube連携強化:** YouTube→ブログ流入+50-100%、ブログ→YouTube登録者+30-50%
4. **AI検索最適化:** ChatGPT Search、Perplexity AI、Google SGEでのマルチメディアコンテンツ優遇

### 技術目標
1. **既存システム影響ゼロ:** 中尺動画埋め込み、SSG、ISR、キャッシュ、既存デザインに一切影響を与えない
2. **Core Web Vitals維持:** LCP、CLS、FID/INP の良好スコアを維持
3. **構造化データ・エンティティ統合維持:** 既存のMike King理論準拠設計を壊さない
4. **段階的デプロイ:** 各フェーズで完全テスト後に次フェーズへ

---

## 🚨 重要な制約事項

### 絶対に守るべきルール

#### 1. 既存機能への影響ゼロ
- ✅ **既存の中尺動画埋め込み機能は一切変更しない**
- ✅ ブログ記事ページのレイアウト・デザインを変更しない
- ✅ SSG（Static Site Generation）の動作を変更しない
- ✅ ISR（Incremental Static Regeneration）の設定を変更しない
- ✅ 既存のキャッシュ戦略を変更しない
- ✅ 既存の構造化データシステムを破壊しない
- ✅ 既存のエンティティ統合システムを破壊しない
- ✅ 既存のベクトルリンク統合を破壊しない

#### 2. プロジェクト混同防止
- ✅ `/Users/nands/my-corporate-site` のみを変更
- ✅ `/Users/nands/taishoku-anshin-daiko` のコードは参考のみ、変更禁止
- ✅ ファイルパスを必ず確認してから編集

#### 3. パフォーマンス維持
- ✅ Core Web Vitals スコアを維持（LCP < 2.5s、CLS < 0.1、FID < 100ms）
- ✅ 初期ロードに影響を与えない（遅延読み込み必須）
- ✅ ページサイズ増加を最小限に抑える（+200KB以内）

#### 4. 段階的実装
- ✅ 各フェーズで完全テスト完了後、次フェーズへ進む
- ✅ ロールバック可能な設計
- ✅ フィーチャーフラグでオン/オフ切り替え可能

---

## 📁 プロジェクト構成

```
/Users/nands/my-corporate-site/docs/youtube-short-embed/
├── README.md                          # このファイル（プロジェクト概要）
├── TASK_MANAGEMENT.md                 # タスク管理・進捗追跡
├── IMPLEMENTATION_PLAN.md             # 詳細実装計画
├── IMPACT_ANALYSIS.md                 # 既存システム影響分析
├── PHASE1_COMPLETION_REPORT.md        # Phase 1 完了報告
├── PHASE2_COMPLETION_REPORT.md        # Phase 2 完了報告
├── PHASE3_COMPLETION_REPORT.md        # Phase 3 完了報告
├── PHASE4_COMPLETION_REPORT.md        # Phase 4 完了報告
└── PHASE5_COMPLETION_REPORT.md        # Phase 5 完了報告
```

---

## 🔄 実装フェーズ

### Phase 0: 事前調査・計画（現在）
- [x] プロジェクトディレクトリ作成
- [x] README.md作成
- [ ] 既存システム影響分析完了（IMPACT_ANALYSIS.md）
- [ ] 詳細実装計画作成（IMPLEMENTATION_PLAN.md）
- [ ] タスク分解完了（TASK_MANAGEMENT.md）

### Phase 1: 既存実装の詳細調査（推定: 1時間）
- [ ] 既存の中尺動画埋め込み実装の完全理解
- [ ] `company_youtube_shorts`テーブル構造確認
- [ ] 構造化データシステムの現状把握
- [ ] エンティティ統合の現状把握
- [ ] ベクトルリンク統合の現状把握

### Phase 2: データベース・API設計（推定: 2時間）
- [ ] ショート動画選択機能の設計
- [ ] 記事へのショート動画関連付けAPI設計
- [ ] 管理画面UI設計（ショート動画選択）

### Phase 3: ショート動画埋め込みコンポーネント実装（推定: 3時間）
- [ ] YouTubeショート埋め込みコンポーネント作成（縦型対応）
- [ ] 中尺動画との共存レイアウト実装
- [ ] 遅延読み込み実装（Intersection Observer）
- [ ] レスポンシブデザイン実装

### Phase 4: 構造化データ・エンティティ統合（推定: 2時間）
- [ ] `hasPart`配列拡張（ショート動画追加）
- [ ] `video`配列拡張（ショート動画追加）
- [ ] Fragment ID生成実装
- [ ] エンティティ関係の拡張
- [ ] ベクトルリンク統合

### Phase 5: テスト・デプロイ（推定: 2時間）
- [ ] Core Web Vitalsテスト
- [ ] 構造化データ検証
- [ ] 既存機能への影響テスト
- [ ] 本番デプロイ

---

## 📊 既存システムとの関係

### 現在の中尺動画埋め込み機能

```
┌─────────────────────────────────────────────────────────────────┐
│ ブログ記事ページ (/app/posts/[slug]/page.tsx)                    │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 中尺動画埋め込み（既存・維持）                                │ │
│ │ - content_type: 'youtube-medium'                              │ │
│ │ - 記事と直接関連                                              │ │
│ │ - 構造化データ: VideoObject                                   │ │
│ │ - エンティティ統合: hasPart, associatedMedia                  │ │
│ │ - ベクトルリンク: fragment_id, complete_uri                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ショート動画埋め込み（新規追加）                              │ │
│ │ - content_type: 'youtube-short'                               │ │
│ │ - 記事と関連（同じカテゴリまたは手動選択）                    │ │
│ │ - 構造化データ: VideoObject                                   │ │
│ │ - エンティティ統合: hasPart, mentions                         │ │
│ │ - ベクトルリンク: fragment_id, complete_uri                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 構造化データ設計（拡張後）

```json
{
  "@type": "BlogPosting",
  "@id": "https://nands.tech/posts/slug#article",
  "video": [
    {
      "@type": "VideoObject",
      "@id": "https://nands.tech/posts/slug#youtube-medium-{videoId}",
      "name": "詳細解説動画（中尺）",
      "duration": "PT130S",
      "isPartOf": { "@id": "https://nands.tech/posts/slug#article" }
    },
    {
      "@type": "VideoObject",
      "@id": "https://nands.tech/posts/slug#youtube-short-{videoId}",
      "name": "ショート解説動画",
      "duration": "PT30S",
      "mentions": { "@id": "https://nands.tech/posts/slug#article" }
    }
  ],
  "hasPart": [
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/posts/slug#youtube-medium-{videoId}"
    },
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/posts/slug#youtube-short-{videoId}"
    }
  ]
}
```

---

## 📊 成功指標（KPI）

### 技術指標
- ✅ Core Web Vitals: LCP < 2.5s、CLS < 0.1、FID < 100ms（現状維持）
- ✅ ページサイズ: +200KB以内
- ✅ 初期ロード時間: 影響ゼロ（遅延読み込み）
- ✅ 既存機能: 影響ゼロ
- ✅ エラー率: 0.1%以下

### ビジネス指標（3ヶ月後）
- 📈 ページ滞在時間: +30%
- 📉 直帰率: -15%
- 📈 リッチスニペット表示率: +10%
- 📈 オーガニック検索流入: +20-30%
- 📈 YouTube→ブログ流入: +50-100%

---

## 🔗 関連ドキュメント

### my-corporate-site内
- `/lib/structured-data/youtube-short-schema.ts` - YouTube短尺動画構造化データ
- `/lib/structured-data/entity-relationships.ts` - エンティティ関係定義
- `/lib/structured-data/unified-integration.ts` - 統合システム
- `/app/posts/[slug]/page.tsx` - ブログ記事ページ
- `/app/admin/youtube-scripts/[scriptId]/page.tsx` - 台本管理画面

### 参考（taishoku-anshin-daiko）
- `/docs/youtube-short-integration/` - 参考実装ドキュメント

---

## 👥 担当者

- **実装:** AI Assistant
- **レビュー:** nands
- **承認:** nands

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|--------|
| 2025-12-06 | 0.1.0 | プロジェクト開始、README作成 | AI Assistant |

---

## 🚀 次のステップ

1. ✅ このREADMEをレビュー
2. [ ] `TASK_MANAGEMENT.md` 作成（詳細タスク管理）
3. [ ] `IMPACT_ANALYSIS.md` 作成（既存システム影響分析）
4. [ ] `IMPLEMENTATION_PLAN.md` 作成（詳細実装計画）
5. [ ] Phase 1開始準備


