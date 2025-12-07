# YouTube ショート動画埋め込み - 詳細実装計画

**作成日:** 2025-12-06  
**バージョン:** 1.0.0  
**ステータス:** 📝 計画完了

**対象プロジェクト:** `/Users/nands/my-corporate-site`  
**参考プロジェクト:** `/Users/nands/taishoku-anshin-daiko`（混同注意）

---

## 📋 実装サマリー

### 目標
ブログ記事詳細ページにYouTubeショート動画（縦動画、30秒）を埋め込み、既存の中尺動画埋め込み機能と共存させる。SEO/AIO最適化（構造化データ、エンティティ統合、ベクトルリンク）を維持・拡張する。

### 設計原則
1. ✅ **既存システム影響ゼロ:** 中尺動画埋め込み、構造化データ、エンティティ統合を変更しない
2. ✅ **パフォーマンス最優先:** Core Web Vitals維持（遅延読み込み必須）
3. ✅ **段階的実装:** 各フェーズで完全テスト後に次へ進む
4. ✅ **ロールバック可能:** フィーチャーフラグでオン/オフ切り替え

---

## 🏗️ システムアーキテクチャ

### データフロー図

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ショート動画台本生成 & YouTube URL保存（既存）                 │
└─────────────────────────────────────────────────────────────────┘
    ↓
[管理画面UI] (/admin/youtube-scripts/[scriptId]/page.tsx)
    ↓
[YouTube URL登録API] (/api/admin/update-youtube-url)
    ├─ YouTube URL検証
    ├─ video_id抽出
    ├─ データベース更新 (company_youtube_shorts)
    └─ ベクトルリンク統合（fragment_vectors同期）

┌─────────────────────────────────────────────────────────────────┐
│ 2. ブログ記事ページでの表示（新規実装）                           │
└─────────────────────────────────────────────────────────────────┘
    ↓
[ブログ記事ページ] (/app/posts/[slug]/page.tsx)
    ├─ データ取得:
    │    ├─ 中尺動画取得 (content_type = 'youtube-medium') ← 既存
    │    └─ ショート動画取得 (content_type = 'youtube-short') ← 新規
    │
    ├─ 中尺動画埋め込み（既存・変更なし）
    │    └─ iframe (横型、16:9)
    │
    └─ ショート動画埋め込み（新規）
         └─ YouTubeShortEmbed コンポーネント
              ├─ iframe (縦型、9:16)
              ├─ Intersection Observer (遅延読み込み)
              └─ Skeleton Loader (CLS防止)

┌─────────────────────────────────────────────────────────────────┐
│ 3. 構造化データ統合（拡張）                                       │
└─────────────────────────────────────────────────────────────────┘
    ↓
[BlogPosting スキーマ拡張]
    ├─ video 配列: 中尺 + ショート（複数対応）
    ├─ hasPart 配列: 中尺Fragment + ショートFragment
    └─ associatedMedia 配列: 中尺 + ショート

┌─────────────────────────────────────────────────────────────────┐
│ 4. Google リッチスニペット表示                                    │
└─────────────────────────────────────────────────────────────────┘
    └─ 動画カルーセル表示の可能性（クリック率+15-25%）
```

---

## 📁 ファイル構成

### 新規作成ファイル

| ファイルパス | 説明 | 推定行数 |
|-------------|------|---------|
| `/components/blog/YouTubeShortEmbed.tsx` | ショート動画埋め込みコンポーネント | ~150行 |

### 修正が必要なファイル

| ファイルパス | 修正内容 | 影響範囲 |
|-------------|---------|---------|
| `/app/posts/[slug]/page.tsx` | ショート動画取得・表示・構造化データ追加 | +100行（新規追加） |

### 変更しないファイル（重要）

| ファイルパス | 理由 |
|-------------|------|
| `/lib/structured-data/youtube-short-schema.ts` | 既存関数をそのまま活用 |
| `/lib/structured-data/entity-relationships.ts` | 既存エンティティは変更しない |
| `/lib/structured-data/unified-integration.ts` | 既存統合システムは変更しない |
| `/app/admin/youtube-scripts/[scriptId]/page.tsx` | 管理画面は今回変更しない |
| `/supabase/migrations/` | データベース変更不要 |

---

## 🔧 技術仕様

### 1. YouTubeShortEmbed コンポーネント仕様

**ファイル:** `/components/blog/YouTubeShortEmbed.tsx`

**Propsインターフェース:**
```typescript
interface YouTubeShortEmbedProps {
  videoId: string;
  title: string;
  fragmentId: string;
  completeUri?: string;
  hookText?: string;
}
```

**HTML構造:**
```tsx
<div 
  id={fragmentId} 
  className="youtube-short-section"
  aria-label="ショート動画"
>
  <div className="header">
    <h3>📱 この記事をショートで見る（30秒）</h3>
  </div>
  
  <p className="hook-text">{hookText}</p>
  
  <div className="video-container" style={{ aspectRatio: '9/16' }}>
    {/* Skeleton Loader */}
    {!isLoaded && <div className="skeleton-loader" />}
    
    {/* iframe (Intersection Observerで遅延読み込み) */}
    {isIntersecting && (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
    )}
  </div>
  
  {/* YouTubeボタン */}
  <div className="cta-buttons">
    <a href={`https://youtube.com/shorts/${videoId}`}>高評価お願いします</a>
    <a href="https://www.youtube.com/@kenjiharada_ai_site?sub_confirmation=1">チャンネル登録</a>
  </div>
</div>
```

**CSS実装:**
```css
.youtube-short-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(to br, #f59e0b, #d97706);
  border-radius: 0.5rem;
  border: 2px solid #f59e0b;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.skeleton-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

/* レスポンシブ */
@media (max-width: 640px) {
  .video-container {
    max-width: 80vw;
  }
}
```

**JavaScript実装（Intersection Observer）:**
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

export default function YouTubeShortEmbed({ 
  videoId, 
  title, 
  fragmentId,
  hookText 
}: YouTubeShortEmbedProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect(); // 一度ロードしたら解除
          }
        });
      },
      { rootMargin: '100px' } // 100px手前から準備開始
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      id={fragmentId} 
      className="youtube-short-section scroll-mt-20"
    >
      {/* ... JSX */}
    </div>
  );
}
```

---

### 2. ブログ記事ページ修正仕様

**ファイル:** `/app/posts/[slug]/page.tsx`

**データ取得部分の修正:**
```typescript
// 現状のコード（維持）
const mediumScript = allScripts.find((s: any) => s.content_type === 'youtube-medium')
const shortScript = allScripts.find((s: any) => s.content_type === 'youtube-short')
const data = mediumScript || shortScript  // ← 中尺動画用（既存）

// 追加: ショート動画用の変数
let youtubeShort: YouTubeScriptInfo | null = null;
let youtubeShortAIOptimizedSchema: any = null;

if (shortScript && shortScript.youtube_video_id) {
  youtubeShort = {
    id: shortScript.id,
    youtube_video_id: shortScript.youtube_video_id,
    youtube_url: shortScript.youtube_url,
    script_title: shortScript.script_title,
    script_hook: shortScript.script_hook,
    fragment_id: shortScript.fragment_id,
    complete_uri: shortScript.complete_uri,
    // ... 他のフィールド
  };
  
  // AI最適化スキーマ生成（既存関数を使用）
  const shortInfo: YouTubeShortInfo = {
    videoId: shortScript.youtube_video_id,
    title: shortScript.script_title,
    // ... 他のフィールド
  };
  
  const entity: YouTubeShortEntity = {
    fragmentId: shortScript.fragment_id,
    completeUri: shortScript.complete_uri,
    // ... 他のフィールド
  };
  
  youtubeShortAIOptimizedSchema = generateAIOptimizedYouTubeShortSchema(
    shortInfo,
    entity,
    `https://nands.tech/posts/${params.slug}`
  );
}
```

**構造化データ部分の修正:**
```typescript
// 既存の enhancedStructuredData を拡張
const enhancedStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `https://nands.tech/posts/${params.slug}#article`,
  // ... 既存のプロパティ
  
  // video配列の構築（中尺 + ショート）
  "video": (() => {
    const videos = [];
    
    // 中尺動画（既存）
    if (youtubeScript?.youtube_video_id) {
      videos.push({
        "@type": "VideoObject",
        "@id": `https://nands.tech/posts/${params.slug}#${youtubeScript.fragment_id}`,
        "name": `${post.title} - 詳細解説動画`,
        "embedUrl": `https://www.youtube-nocookie.com/embed/${youtubeScript.youtube_video_id}`,
        "contentUrl": youtubeScript.youtube_url,
        "duration": "PT130S",
        "isPartOf": { "@id": `https://nands.tech/posts/${params.slug}#article` }
      });
    }
    
    // ショート動画（新規）
    if (youtubeShort?.youtube_video_id) {
      videos.push({
        "@type": "VideoObject",
        "@id": `https://nands.tech/posts/${params.slug}#${youtubeShort.fragment_id}`,
        "name": `${post.title} - ショート解説`,
        "embedUrl": `https://www.youtube-nocookie.com/embed/${youtubeShort.youtube_video_id}`,
        "contentUrl": youtubeShort.youtube_url,
        "duration": "PT30S",
        "mentions": { "@id": `https://nands.tech/posts/${params.slug}#article` }
      });
    }
    
    // 1件の場合はオブジェクト、複数の場合は配列（後方互換性）
    return videos.length === 1 ? videos[0] : videos.length > 0 ? videos : undefined;
  })(),
  
  // hasPart配列の拡張（既存 + ショート）
  "hasPart": [
    // ... 既存のhasPart要素
    
    // ショート動画セクション（新規追加）
    ...(youtubeShort?.youtube_video_id ? [{
      "@type": "WebPageElement",
      "@id": `https://nands.tech/posts/${params.slug}#${youtubeShort.fragment_id}`,
      "name": "ショート解説動画",
      "position": tocData.toc.length + 2  // TOC + 中尺の後
    }] : [])
  ]
};
```

**JSX部分の追加:**
```tsx
{/* 🎬 中尺動画埋め込み（既存・変更なし） */}
{youtubeScript && youtubeScript.youtube_video_id && (
  <div id={youtubeScript.fragment_id || 'youtube-medium-video'} className="...">
    {/* 既存の中尺動画埋め込みコード */}
  </div>
)}

{/* 📱 ショート動画埋め込み（新規追加） */}
{youtubeShort && youtubeShort.youtube_video_id && (
  <YouTubeShortEmbed
    videoId={youtubeShort.youtube_video_id}
    title={youtubeShort.script_title || post.title}
    fragmentId={youtubeShort.fragment_id || 'youtube-short-video'}
    completeUri={youtubeShort.complete_uri}
    hookText={youtubeShort.script_hook}
  />
)}
```

---

### 3. 構造化データ仕様

#### BlogPosting スキーマ拡張

**拡張前（中尺動画のみ）:**
```json
{
  "@type": "BlogPosting",
  "video": {
    "@type": "VideoObject",
    "@id": "https://nands.tech/posts/slug#youtube-medium-{videoId}"
  },
  "hasPart": [
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/posts/slug#youtube-medium-{videoId}"
    }
  ]
}
```

**拡張後（中尺 + ショート）:**
```json
{
  "@type": "BlogPosting",
  "video": [
    {
      "@type": "VideoObject",
      "@id": "https://nands.tech/posts/slug#youtube-medium-{videoId}",
      "name": "詳細解説動画",
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
      "@id": "https://nands.tech/posts/slug#youtube-medium-{videoId}",
      "name": "詳細解説動画",
      "position": 1
    },
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/posts/slug#youtube-short-{videoId}",
      "name": "ショート解説動画",
      "position": 2
    }
  ]
}
```

---

## 📊 パフォーマンス最適化

### Core Web Vitals への影響予測

#### LCP（Largest Contentful Paint）

**現状:** ~1.8s  
**目標:** < 2.5s  
**影響予測:** ✅ **影響なし**

**理由:**
- ショート動画は中尺動画セクションの下（Fold下）
- 遅延読み込みでメインコンテンツに影響なし

#### CLS（Cumulative Layout Shift）

**現状:** ~0.05  
**目標:** < 0.1  
**影響予測:** ✅ **影響なし**

**対策:**
```css
.video-container {
  aspect-ratio: 9 / 16; /* CLS防止 */
  width: 100%;
  max-width: 300px;
}
```

#### FID/INP（First Input Delay / Interaction to Next Paint）

**現状:** ~50ms  
**目標:** < 100ms  
**影響予測:** ✅ **影響なし**

**対策:**
- Intersection Observer（軽量API）
- メインスレッドをブロックしない

---

## 📅 実装スケジュール

### フェーズ別スケジュール

| Phase | 内容 | 推定時間 | 累計時間 |
|-------|------|---------|---------|
| Phase 0 | 事前調査・計画 | 1h | 1h |
| Phase 1 | 既存実装の詳細調査 | 1h | 2h |
| Phase 2 | データベース・API設計 | 2h | 4h |
| Phase 3 | コンポーネント実装 | 3h | 7h |
| Phase 4 | 構造化データ・エンティティ統合 | 2h | 9h |
| Phase 5 | テスト・デプロイ | 2h | **11h** |

**合計推定時間: 11時間（約1.5日）**

---

## 🎯 成功指標（KPI）

### 技術指標（即時）

| 指標 | 現状 | 目標 | 測定方法 |
|------|------|------|---------|
| LCP | ~1.8s | < 2.5s | Lighthouse |
| CLS | ~0.05 | < 0.1 | Lighthouse |
| FID/INP | ~50ms | < 100ms | Lighthouse |
| ページサイズ | ~500KB | < 700KB | DevTools |
| 既存機能 | 正常 | 正常維持 | 手動テスト |

### ビジネス指標（3ヶ月後）

| 指標 | 現状 | 目標 | 測定方法 |
|------|------|------|---------|
| ページ滞在時間 | - | +30% | Google Analytics |
| 直帰率 | - | -15% | Google Analytics |
| リッチスニペット表示率 | - | +10% | Search Console |

---

## 🚀 デプロイ戦略

### フィーチャーフラグ実装

**環境変数:**
```bash
# Vercel環境変数設定
NEXT_PUBLIC_ENABLE_SHORT_VIDEOS=false  # 初期値: false
```

**コンポーネント内条件分岐:**
```typescript
const ENABLE_SHORT_VIDEOS = process.env.NEXT_PUBLIC_ENABLE_SHORT_VIDEOS === 'true';

// ブログページ内
{ENABLE_SHORT_VIDEOS && youtubeShort && youtubeShort.youtube_video_id && (
  <YouTubeShortEmbed {...props} />
)}
```

### 段階的ロールアウト

1. ✅ **Phase 1:** 開発環境でテスト
2. ✅ **Phase 2:** Vercelプレビューデプロイでテスト
3. ✅ **Phase 3:** 本番環境デプロイ（フラグOFF）
4. ✅ **Phase 4:** 本番環境で有効化（フラグON）
5. ✅ **Phase 5:** モニタリング（1週間）
6. ✅ **Phase 6:** フィーチャーフラグ削除（完全統合）

---

## 🔄 ロールバック計画

### ロールバック手順

**ケース1: パフォーマンス悪化**
```bash
# 即座にフィーチャーフラグをオフ
NEXT_PUBLIC_ENABLE_SHORT_VIDEOS=false
# 再デプロイ不要（環境変数変更で即座に反映）
```

**ケース2: 致命的なバグ**
```bash
# Gitコミットをrevert
git revert <commit-hash>
git push origin main
```

---

## 📝 承認チェックリスト

### Phase 0 承認事項

- [ ] **README.md** レビュー完了
- [ ] **TASK_MANAGEMENT.md** レビュー完了
- [ ] **IMPACT_ANALYSIS.md** レビュー完了
- [ ] **IMPLEMENTATION_PLAN.md** レビュー完了（このファイル）
- [ ] 全体方針に合意
- [ ] リスク評価に合意
- [ ] 実装スケジュールに合意

**承認者:** _______________________  
**承認日:** _______________________

---

## 🔗 関連ドキュメント

- [プロジェクト概要（README.md）](./README.md)
- [既存システム影響分析（IMPACT_ANALYSIS.md）](./IMPACT_ANALYSIS.md)
- [タスク管理（TASK_MANAGEMENT.md）](./TASK_MANAGEMENT.md)

---

**🎉 Phase 0 完了後、Phase 1（既存実装の詳細調査）を開始します**


