# 06. 実装ガイド

> **技術仕様とファイル構成**

---

## 📁 ファイル構成

```
app/
├── page.tsx                    # トップページ（リデザイン対象）
├── components/
│   └── portal/                 # 新規作成ディレクトリ
│       ├── TheGreatSwitch.tsx  # モード切り替えコンポーネント
│       ├── HeroSection.tsx     # ヒーローセクション
│       ├── VectorLinkBackground.tsx  # 背景アニメーション
│       ├── ProblemSection.tsx  # 課題提起セクション
│       ├── SolutionBentoGrid.tsx     # ソリューションBento Grid
│       ├── PricingSection.tsx  # 価格セクション
│       ├── PhilosophySection.tsx     # 哲学セクション
│       ├── ServicesBlueprint.tsx     # サービス一覧（Fragment ID保持）
│       └── KnowledgeShowcase.tsx     # ブログ連携
├── globals.css                 # グローバルスタイル更新
└── layout.tsx                  # レイアウト（JSON-LD更新）
```

---

## 🛠️ 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| フレームワーク | Next.js 14 (App Router) | SSR/SSG |
| 状態管理 | React Context | モード共有 |
| アニメーション | Framer Motion | UI遷移 |
| 背景 | Canvas API | ベクトルリンク可視化 |
| スタイル | Tailwind CSS | ユーティリティCSS |
| フォント | Noto Sans JP, JetBrains Mono | タイポグラフィ |

---

## 📝 globals.css 追加

```css
/* Deep Navy テーマ */
:root {
  --bg-primary: #0A1628;
  --bg-secondary: #1A2332;
  --bg-tertiary: #0D1B2A;
  --accent-cyan: #00FFFF;
  --accent-purple: #8A2BE2;
}

/* グラデーション背景 */
.bg-deep-gradient {
  background: linear-gradient(
    180deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
}

/* アクセントグラデーションテキスト */
.text-gradient-accent {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* スクロールスナップ */
.scroll-snap-y {
  scroll-snap-type: y mandatory;
}
.scroll-snap-section {
  scroll-snap-align: start;
}
```

---

## 🔧 tailwind.config.js 更新

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0A1628',
        'midnight-blue': '#1A2332',
        'ocean-depth': '#0D1B2A',
        'cyber-cyan': '#00FFFF',
        'neon-purple': '#8A2BE2',
      },
      fontFamily: {
        'jp': ['Noto Sans JP', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
}
```

---

## 📦 依存関係

```bash
# 必要なパッケージ（既存で対応可能）
# framer-motion: 11.18.2 ✅
# tailwindcss: 3.4.14 ✅

# フォント追加（Google Fonts）
# layout.tsxでインポート
```

---

## 🚀 実装手順

### Phase 1: 基盤構築

1. `app/components/portal/` ディレクトリ作成
2. `TheGreatSwitch.tsx` 実装（ModeContext含む）
3. `globals.css` にテーマ変数追加
4. `tailwind.config.js` 更新

### Phase 2: セクション実装

1. `HeroSection.tsx` 実装
2. `ProblemSection.tsx` 実装
3. `SolutionBentoGrid.tsx` 実装
4. `PricingSection.tsx` 実装

### Phase 3: 哲学＆構造

1. `PhilosophySection.tsx` 実装
2. `ServicesBlueprint.tsx` 実装（23 Fragment ID保持）
3. JSON-LD更新

### Phase 4: 仕上げ

1. `VectorLinkBackground.tsx` 実装
2. `KnowledgeShowcase.tsx` 実装
3. レスポンシブ調整
4. パフォーマンス最適化

---

## ⚡ パフォーマンス考慮事項

### 1. 動的インポート
```typescript
// 重いコンポーネントは動的インポート
const VectorLinkBackground = dynamic(
  () => import('./VectorLinkBackground'),
  { ssr: false }
)
```

### 2. Intersection Observer
```typescript
// スクロール検知でアニメーション開始
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.1,
})
```

### 3. 画像最適化
```typescript
// 原田賢治の写真は優先読み込み
<Image
  src="/images/kenji-harada.jpg"
  priority
  ...
/>
```

---

**次のドキュメント**: [TASKS.md](./TASKS.md) - タスク管理

