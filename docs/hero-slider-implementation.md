# Hero Section スライダー実装ドキュメント

## 概要
トップページのHero Sectionに、以下の2つのスライダーを実装しました：

1. **メインビジュアルスライダー** (HeroImageSlider)
   - 1400×480pxの横長画像
   - 左右に次/前の画像が少し見える「ピークデザイン」
   - Swiper Coverflow Effect使用

2. **ブログカードスライダー** (HeroBlogCardSlider)
   - メインビジュアルの下に少し重なるように配置
   - 横スクロール可能
   - 最新ブログ記事を表示（最大6件）

## 実装ファイル

### 新規作成ファイル
1. `/app/components/portal/HeroImageSlider.tsx`
2. `/app/components/portal/HeroBlogCardSlider.tsx`

### 更新ファイル
1. `/app/components/portal/NewHeroSection.tsx`
2. `/app/components/portal/NewTopPageSections.tsx`
3. `/app/page.tsx`

## 技術仕様

### HeroImageSlider
- **ライブラリ**: Swiper v11.2.2
- **モジュール**: Navigation, Pagination, Autoplay, EffectCoverflow
- **サイズ**: 1400×480px（最大90vw / 最大高さ60vh）
- **特徴**:
  - センタースライド表示
  - 左右の次/前スライドがピークで見える
  - 自動再生（5秒間隔）
  - カスタムナビゲーションボタン
  - ダーク/ライトモード対応
  - **現在はプレースホルダー画像**（後で実際の画像に差し替え）

### HeroBlogCardSlider
- **ライブラリ**: Swiper v11.2.2
- **モジュール**: FreeMode, Mousewheel
- **カードサイズ**: 320px幅
- **特徴**:
  - フリーモードスクロール
  - マウスホイール対応
  - サムネイル画像表示
  - カテゴリバッジ（ChatGPT / Tech）
  - 日付表示
  - ホバーエフェクト
  - ダーク/ライトモード対応

## データフロー

```
page.tsx
  ↓ getLatestPosts() → posts
  ↓
NewTopPageSections ({ posts })
  ↓
NewHeroSection ({ posts })
  ↓
HeroBlogCardSlider ({ posts })
```

## 型定義

```typescript
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  created_at: string
  table_type: 'posts' | 'chatgpt_posts'
}
```

## 画像の差し替え方法

### プレースホルダー画像の位置
現在、`HeroImageSlider.tsx`では以下のプレースホルダー画像を定義しています：

```typescript
const PLACEHOLDER_SLIDES: HeroSlide[] = [
  { id: 'slide-1', image: '/images/hero-placeholder-1.jpg', alt: '...' },
  { id: 'slide-2', image: '/images/hero-placeholder-2.jpg', alt: '...' },
  { id: 'slide-3', image: '/images/hero-placeholder-3.jpg', alt: '...' },
  { id: 'slide-4', image: '/images/hero-placeholder-4.jpg', alt: '...' }
]
```

### 実際の画像に差し替える手順

#### 方法1: ファイルを配置して有効化（推奨）
1. `/public/images/` に以下の画像を配置：
   - `hero-placeholder-1.jpg` (1400×480px)
   - `hero-placeholder-2.jpg` (1400×480px)
   - `hero-placeholder-3.jpg` (1400×480px)
   - `hero-placeholder-4.jpg` (1400×480px)

2. `HeroImageSlider.tsx`の以下のコメントアウトを解除：
```tsx
// 実際の画像（後で差し替え）- 今はエラーを防ぐためコメントアウト
{/* 
<Image
  src={slide.image}
  alt={slide.alt}
  fill
  className="object-cover"
  priority={slide.id === 'slide-1'}
/>
*/}
```

#### 方法2: 別のファイル名で配置
1. 画像を配置（例: `/public/images/hero/slide-1.jpg`）
2. `PLACEHOLDER_SLIDES`の`image`パスを更新
3. Imageコンポーネントのコメントを解除

## デザイン仕様

### レスポンシブ対応
- **デスクトップ**: 1400px幅のスライド
- **モバイル**: 90vw（画面幅の90%）
- **高さ**: 480px（最大60vh）

### アニメーション
- **フェードイン**: 各スライダーは1秒遅延でフェードイン
- **ホバー**: カードにホバーで上に移動＋影を強調
- **トランジション**: 全てのアニメーションは0.3〜0.8秒のスムーズなイージング

### テーマ対応
- **ダークモード**: デフォルト
  - 背景: 深海グラデーション
  - プレースホルダー: グレー系
  - ボタン: 半透明黒

- **ライトモード**: トグルで切り替え
  - 背景: 白系グラデーション
  - プレースホルダー: ライトグレー系
  - ボタン: 半透明白

## SEO対応

### H1/H2構造の維持
- **H1**: `sr-only`（視覚的に非表示、SEO用）
  ```html
  NANDS TECH - AIアーキテクトによる企業OS設計...
  ```

- **H2**: 視覚的メインコピー
  ```html
  AIに使われるな。AIが使う「構造」を設計せよ。
  ```

### アクセシビリティ
- `aria-label`による説明
- キーボードナビゲーション対応
- スクリーンリーダー対応

## パフォーマンス最適化

### 画像最適化
- Next.js `Image`コンポーネント使用
- ファーストスライドは`priority`属性でプリロード
- その他は遅延ロード

### コード分割
- Swiperモジュールは必要なもののみインポート
- クライアントコンポーネント化（`'use client'`）

### ISR（Incremental Static Regeneration）
- トップページは`revalidate = 1800`（30分）
- ブログデータは自動更新

## 今後の拡張

### 画像管理
- [ ] Supabase Storageとの連携
- [ ] 管理画面からのスライド画像アップロード機能
- [ ] 動的な枚数調整

### アニメーション強化
- [ ] パララックス効果
- [ ] スクロール連動アニメーション
- [ ] 3D効果の追加

### データ連携
- [ ] CMS連携（スライド管理）
- [ ] A/Bテスト機能
- [ ] アナリティクス統合

## トラブルシューティング

### スライダーが表示されない
1. Swiperのインストール確認: `npm list swiper`
2. CSSインポート確認
3. ブラウザコンソールでエラー確認

### 画像が表示されない
1. ファイルパスの確認
2. 画像ファイルの存在確認
3. Imageコンポーネントのコメント解除確認

### ブログカードが表示されない
1. `posts`データの確認（`console.log(posts)`）
2. Supabaseクエリの確認
3. 型の互換性確認

## 実装日時
- **日付**: 2025年12月12日
- **実装者**: AI Assistant
- **バージョン**: v1.0.0
- **ステータス**: ✅ 完了（画像は後で差し替え）

