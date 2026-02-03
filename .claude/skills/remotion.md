# Remotion Animation Skill

## Overview

CLAVIプロジェクトでRemotionを使用したプログラマブル動画アニメーションを作成するためのスキル。

## When to Use

- ヒーローセクションの動画アニメーション作成
- プロダクトデモ動画の自動生成
- マーケティング素材の動画作成
- データビジュアライゼーションのアニメーション

## Project Structure

```
remotion/
├── index.ts              # エントリーポイント (registerRoot)
├── Root.tsx              # Composition登録
├── compositions/         # 個別アニメーションコンポーネント
│   ├── HeroAnimation.tsx # ヒーロー用アニメーション
│   ├── ProductDemo.tsx   # プロダクトデモ
│   └── DataViz.tsx       # データビジュアライゼーション
├── components/           # 再利用可能なRemotionコンポーネント
│   ├── Logo.tsx
│   ├── TextReveal.tsx
│   └── GradientBackground.tsx
└── types/
    └── constants.ts      # FPS, 解像度, デュレーション定数
```

## Required Packages

```bash
npm install remotion @remotion/cli @remotion/player @remotion/google-fonts
```

## Configuration Files

### remotion.config.ts
```typescript
import { Config } from '@remotion/cli/config';
Config.setEntryPoint('./remotion/index.ts');
```

### package.json scripts
```json
{
  "scripts": {
    "remotion": "remotion studio",
    "remotion:render": "remotion render"
  }
}
```

## CLAVI Integration Patterns

### 1. Hero Section Player
```tsx
'use client';
import { Player } from "@remotion/player";
import { useClaviTheme } from "@/app/clavi/context";
import { HeroAnimation } from "@/remotion/compositions/HeroAnimation";
import { VIDEO_CONFIG } from "@/remotion/types/constants";

export function ClaviHeroPlayer() {
  const { theme } = useClaviTheme();

  return (
    <Player
      component={HeroAnimation}
      inputProps={{ isDark: theme === 'dark' }}
      durationInFrames={VIDEO_CONFIG.DURATION}
      fps={VIDEO_CONFIG.FPS}
      compositionWidth={VIDEO_CONFIG.WIDTH}
      compositionHeight={VIDEO_CONFIG.HEIGHT}
      style={{ width: '100%', borderRadius: '1rem' }}
      autoPlay
      loop
    />
  );
}
```

### 2. Composition Template
```tsx
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate
} from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";

loadFont("normal", { subsets: ["latin"], weights: ["400", "700"] });

interface HeroAnimationProps {
  isDark: boolean;
}

export const HeroAnimation: React.FC<HeroAnimationProps> = ({ isDark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';

  const titleOpacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const titleY = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <Sequence from={0}>
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${(1 - titleY) * 50}px)`
        }}>
          <h1 style={{ fontFamily, fontSize: 72, color: '#2563EB' }}>
            CLAVI
          </h1>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
```

### 3. Constants File
```typescript
// remotion/types/constants.ts
import { z } from "zod";

export const VIDEO_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  FPS: 30,
  DURATION: 200, // frames (約6.7秒)
} as const;

export const HeroAnimationProps = z.object({
  isDark: z.boolean(),
  title: z.string().optional(),
});

export type HeroAnimationPropsType = z.infer<typeof HeroAnimationProps>;
```

## CLAVI Design System Integration

### Color Palette
```typescript
const CLAVI_COLORS = {
  primary: '#2563EB',
  secondary: '#06B6D4',
  accent: '#1E3A8A',
  dark: {
    bg: '#0F172A',
    text: '#E2E8F0',
  },
  light: {
    bg: '#F8FAFC',
    text: '#1E293B',
  },
};
```

### Animation Principles
- Spring damping: 200 (滑らかなイージング)
- Transition duration: 30 frames (1秒 at 30fps)
- Stagger delay: 5-10 frames
- ループ時のシームレス接続を考慮

## Best Practices

1. **パフォーマンス**
   - 重いエフェクトは控えめに
   - SVGやCSSアニメーションを活用
   - 画像は事前に最適化

2. **レスポンシブ**
   - Playerの`style={{ width: '100%' }}`で親要素に追従
   - `compositionWidth/Height`は固定（アスペクト比維持）

3. **ダークモード対応**
   - `inputProps`でテーマ状態を渡す
   - コンポーネント内で条件分岐

4. **開発ワークフロー**
   - `npm run remotion`でStudio起動
   - リアルタイムプレビューで調整
   - 完成後Playerに組み込み

## Common Issues & Solutions

| 問題 | 解決策 |
|------|--------|
| Playerが表示されない | `'use client'`ディレクティブ確認 |
| フォントが読み込めない | `@remotion/google-fonts`使用 |
| アニメーションがカクつく | FPSを下げる、エフェクト軽量化 |
| ダークモード反映されない | `inputProps`でテーマ渡し確認 |

## Related Resources

- [Remotion公式ドキュメント](https://www.remotion.dev/docs)
- [Remotion Player](https://www.remotion.dev/docs/player)
- [Next.js統合ガイド](https://www.remotion.dev/docs/brownfield)
- [Remotion Next.js Template](https://github.com/remotion-dev/template-next-app-dir)
