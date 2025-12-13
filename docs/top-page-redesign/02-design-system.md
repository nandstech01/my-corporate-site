# 02. デザインシステム

> **"The Dark Architect IDE" → "The Blueprint OS"**

---

## 🎨 カラーパレット

### Primary Colors（ベース）

```css
:root {
  /* 背景グラデーション（深海） */
  --bg-primary: #0A1628;      /* Deep Navy */
  --bg-secondary: #1A2332;    /* Midnight Blue */
  --bg-tertiary: #0D1B2A;     /* Ocean Depth */
  
  /* 代替: 漆黒（より攻撃的な場合） */
  --bg-obsidian: #050505;     /* Obsidian Black */
  --bg-charcoal: #0A0A0A;     /* Charcoal */
}
```

### Accent Colors（アクセント）

```css
:root {
  /* プライマリアクセント */
  --accent-cyan: #00FFFF;     /* Cyber Cyan - 技術感 */
  --accent-purple: #8A2BE2;   /* Neon Purple - 原田ブランド */
  
  /* セカンダリアクセント */
  --accent-blue: #3B82F6;     /* Trust Blue - 法人CTA */
  --accent-green: #22C55E;    /* LINE Green - 個人CTA */
  
  /* 公的信頼 */
  --accent-silver: #C0C0C0;   /* Silver - 助成金 */
  --accent-gold: #FFD700;     /* Gold - 実績 */
}
```

### Text Colors

```css
:root {
  /* テキスト */
  --text-primary: #FFFFFF;    /* 見出し */
  --text-secondary: #E5E7EB;  /* 本文 */
  --text-tertiary: #9CA3AF;   /* 補足 */
  --text-muted: #6B7280;      /* 注釈 */
}
```

### グラデーション

```css
:root {
  /* 背景グラデーション */
  --gradient-bg: linear-gradient(
    180deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
  
  /* アクセントグラデーション */
  --gradient-accent: linear-gradient(
    135deg,
    var(--accent-purple) 0%,
    var(--accent-cyan) 100%
  );
  
  /* CTAグラデーション */
  --gradient-cta-corp: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  --gradient-cta-indiv: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
}
```

---

## 🔤 タイポグラフィ

### フォントファミリー

```css
:root {
  /* 日本語（見出し・本文） */
  --font-primary: 'Noto Sans JP', sans-serif;
  
  /* 英数字・コード（装飾） */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* 代替（システムフォント） */
  --font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### フォントウェイト

```css
:root {
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-bold: 700;
  --font-black: 900;    /* Hero用 */
}
```

### タイプスケール

| 用途 | サイズ（Desktop） | サイズ（Mobile） | ウェイト |
|-----|-----------------|-----------------|---------|
| Hero H1 | 72px / 4.5rem | 40px / 2.5rem | 900 (Black) |
| Section H2 | 48px / 3rem | 32px / 2rem | 700 (Bold) |
| Card H3 | 24px / 1.5rem | 20px / 1.25rem | 700 (Bold) |
| Body Large | 20px / 1.25rem | 18px / 1.125rem | 400 (Regular) |
| Body | 16px / 1rem | 16px / 1rem | 400 (Regular) |
| Caption | 14px / 0.875rem | 14px / 0.875rem | 400 (Regular) |
| Code | 14px / 0.875rem | 12px / 0.75rem | 400 (Mono) |

### 行間（Line Height）

```css
:root {
  --leading-tight: 1.2;   /* 見出し */
  --leading-normal: 1.6;  /* 本文（日本語） */
  --leading-relaxed: 1.8; /* 長文 */
}
```

---

## 📐 スペーシング

### ベース単位

```css
:root {
  --space-unit: 4px;
  
  --space-1: 4px;     /* 0.25rem */
  --space-2: 8px;     /* 0.5rem */
  --space-3: 12px;    /* 0.75rem */
  --space-4: 16px;    /* 1rem */
  --space-6: 24px;    /* 1.5rem */
  --space-8: 32px;    /* 2rem */
  --space-12: 48px;   /* 3rem */
  --space-16: 64px;   /* 4rem */
  --space-20: 80px;   /* 5rem */
  --space-24: 96px;   /* 6rem */
  --space-32: 128px;  /* 8rem */
}
```

### セクション間隔

```css
/* セクション間の余白 */
.section {
  padding-top: var(--space-24);    /* 96px */
  padding-bottom: var(--space-24); /* 96px */
}

/* モバイル */
@media (max-width: 768px) {
  .section {
    padding-top: var(--space-16);    /* 64px */
    padding-bottom: var(--space-16); /* 64px */
  }
}
```

---

## 🎭 モーション・アニメーション

### 基本原則

1. **控えめに**: Apple的「存在を主張しない」アニメーション
2. **意味がある**: 装飾ではなく、状態変化を伝える
3. **パフォーマンス**: `transform`と`opacity`のみ使用

### イージング

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* 減速 */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* 滑らか */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弾む */
}
```

### 継続時間

```css
:root {
  --duration-fast: 150ms;    /* ホバー */
  --duration-normal: 300ms;  /* 標準遷移 */
  --duration-slow: 500ms;    /* セクション切り替え */
  --duration-slower: 800ms;  /* 背景アニメーション */
}
```

### 主要アニメーション

#### THE SWITCH 切り替え
```css
/* クロスフェード */
.switch-content-enter {
  opacity: 0;
  transform: translateY(20px);
}
.switch-content-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all var(--duration-slow) var(--ease-out);
}
.switch-content-exit {
  opacity: 1;
  transform: translateY(0);
}
.switch-content-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: all var(--duration-slow) var(--ease-out);
}
```

#### 背景ベクトルリンクアニメーション
```css
/* ノードの結合・切断 */
@keyframes vector-link-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.vector-node {
  animation: vector-link-pulse 4s ease-in-out infinite;
}

/* 線の流れ */
@keyframes line-flow {
  0% {
    stroke-dashoffset: 100%;
  }
  100% {
    stroke-dashoffset: 0%;
  }
}

.vector-line {
  stroke-dasharray: 100%;
  animation: line-flow 3s linear infinite;
}
```

#### スクロールトリガーアニメーション
```css
/* フェードアップ */
.fade-up {
  opacity: 0;
  transform: translateY(40px);
  transition: all var(--duration-slow) var(--ease-out);
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* スタガーアニメーション（Bento Grid用） */
.bento-card:nth-child(1) { transition-delay: 0ms; }
.bento-card:nth-child(2) { transition-delay: 100ms; }
.bento-card:nth-child(3) { transition-delay: 200ms; }
.bento-card:nth-child(4) { transition-delay: 300ms; }
```

---

## 🧩 コンポーネントスタイル

### ボタン

```css
/* 基本スタイル */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) var(--space-8);
  font-family: var(--font-primary);
  font-weight: var(--font-bold);
  font-size: 16px;
  border-radius: 8px;
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
}

/* 法人CTA（ソリッド・四角） */
.btn-corporate {
  background: var(--gradient-cta-corp);
  color: white;
  border: none;
  border-radius: 4px; /* より四角く */
}
.btn-corporate:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

/* 個人CTA（丸み・グロー） */
.btn-individual {
  background: var(--gradient-cta-indiv);
  color: white;
  border: none;
  border-radius: 50px;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}
.btn-individual:hover {
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
}
```

### カード（Bento Grid）

```css
.bento-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: var(--space-8);
  backdrop-filter: blur(10px);
  transition: all var(--duration-normal) var(--ease-out);
}

.bento-card:hover {
  border-color: rgba(0, 255, 255, 0.3);
  transform: translateY(-4px);
}

/* 大カード */
.bento-card--large {
  grid-column: span 2;
  grid-row: span 2;
}

/* フィーチャーカード */
.bento-card--featured {
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.1) 0%,
    rgba(0, 255, 255, 0.1) 100%
  );
  border-color: rgba(138, 43, 226, 0.3);
}
```

### THE SWITCH

```css
.the-switch {
  display: inline-flex;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.switch-option {
  padding: var(--space-4) var(--space-8);
  border-radius: 50px;
  font-weight: var(--font-medium);
  color: var(--text-tertiary);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

.switch-option--active {
  background: var(--gradient-accent);
  color: white;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
}

.switch-option:not(.switch-option--active):hover {
  color: var(--text-primary);
}
```

---

## 📱 レスポンシブブレークポイント

```css
:root {
  --breakpoint-sm: 640px;   /* スマートフォン（横） */
  --breakpoint-md: 768px;   /* タブレット */
  --breakpoint-lg: 1024px;  /* ノートPC */
  --breakpoint-xl: 1280px;  /* デスクトップ */
  --breakpoint-2xl: 1536px; /* 大画面 */
}
```

### Tailwind設定

```javascript
// tailwind.config.js への追加
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
    },
  },
}
```

---

## 🖼️ アイコン・イラスト

### アイコンスタイル
- **線の太さ**: 1.5px（細め）
- **サイズ**: 24px（標準）、32px（強調）、48px（Hero）
- **色**: `currentColor`（テキストと同化）
- **ライブラリ**: Heroicons または Lucide React

### イラストガイドライン
- **スタイル**: 抽象的・幾何学的（具体的なイラストは使用しない）
- **色**: モノクロ + シアン/パープルのアクセント
- **要素**: ノード、線、グリッド、コードスニペット

---

## 📸 写真スタイル

### 原田賢治の写真
- **トーン**: モノクロまたは低彩度
- **コントラスト**: 高め（陰影を強調）
- **背景**: 切り抜き or 暗い背景にフェード
- **構図**: 横顔 or 斜め（PCに向かう姿が理想）

### 加工指示
```
1. 背景を切り抜き（透過PNG）
2. モノクロ変換
3. コントラスト +30%
4. シャドウを暗く
5. 必要に応じてサイバーパープルのオーバーレイ
```

---

**次のドキュメント**: [03-sections.md](./03-sections.md) - 各セクション詳細仕様

