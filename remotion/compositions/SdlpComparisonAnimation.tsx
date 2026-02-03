import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SdlpComparisonProps, SDLP_COMP_COLORS } from '../types/constants';
import { ComparisonScene } from './components/ComparisonScene';

const C = SDLP_COMP_COLORS;

const COMPARISONS = [
  {
    title: 'AI活用力',
    traditional: {
      label: '従来の開発会社',
      items: [
        'AI非対応、または別途高額オプション',
        'AI人材不足で外注依存',
        '最新モデルへの追従が遅い',
      ],
    },
    nands: {
      label: 'NANDSの場合',
      items: [
        'ChatGPT・Claude等のAI実装が標準',
        'AI専門エンジニアが社内に在籍',
        '最新AIモデルを即座に検証・導入',
      ],
    },
  },
  {
    title: 'コスト構造',
    traditional: {
      label: '従来の開発会社',
      items: [
        '大規模オフィスの維持費',
        '多層の管理体制',
        '手作業中心で工数が膨大',
      ],
    },
    nands: {
      label: 'NANDSの場合',
      items: [
        'AI活用で開発工数を40%削減',
        'フラットな開発チーム',
        'AIコードレビューで品質担保',
      ],
    },
  },
  {
    title: '開発手法',
    traditional: {
      label: '従来の開発会社',
      items: [
        'ウォーターフォール型で変更困難',
        '完成まで実物が見えない',
        '追加費用が頻発',
      ],
    },
    nands: {
      label: 'NANDSの場合',
      items: [
        'AI支援アジャイルで高速開発',
        '2週間ごとに成果物を確認',
        '明確な見積もりで追加費用抑制',
      ],
    },
  },
  {
    title: 'サポート体制',
    traditional: {
      label: '従来の開発会社',
      items: [
        '担当者が頻繁に変わる',
        '納品後は別契約',
        '問い合わせ対応が遅い',
      ],
    },
    nands: {
      label: 'NANDSの場合',
      items: [
        '専任チームが最後まで担当',
        '納品後3ヶ月の無料サポート',
        'AI監視で障害を未然に検知',
      ],
    },
  },
];

// 4 scenes across 360 frames (12 seconds @ 30fps)
// Scene 1: AI活用力       (0–90)     15-frame crossfade overlap
// Scene 2: コスト構造     (75–165)   15-frame crossfade overlap
// Scene 3: 開発手法       (150–240)  15-frame crossfade overlap
// Scene 4: サポート体制   (225–360)  fades out at end for loop

const SCENE_RANGES = [
  { start: 0, end: 90 },
  { start: 75, end: 165 },
  { start: 150, end: 240 },
  { start: 225, end: 360 },
];

export const SdlpComparisonAnimation: React.FC<SdlpComparisonProps> = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background frame={frame} />
      {COMPARISONS.map((comp, i) => (
        <SceneWrapper key={comp.title} frame={frame} index={i} data={comp} />
      ))}
    </AbsoluteFill>
  );
};

// --- Shared Background (same as SdlpAboutAnimation) ---
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const rotation = interpolate(frame, [0, 360], [0, 216], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg.dark,
        overflow: 'hidden',
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Gradient orbs */}
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '20%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.08)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.06)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.05)',
            filter: 'blur(50px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- Scene Wrapper ---
interface SceneWrapperProps {
  frame: number;
  index: number;
  data: (typeof COMPARISONS)[number];
}

const SceneWrapper: React.FC<SceneWrapperProps> = ({ frame, index, data }) => {
  const range = SCENE_RANGES[index];

  // Early exit if frame is well outside range
  if (frame < range.start - 5 || frame > range.end + 5) return null;

  const fadeIn = interpolate(frame, [range.start, range.start + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // For last scene, fade out at the end for seamless loop
  const fadeOutStart = index === 3 ? range.end - 15 : range.end - 20;
  const fadeOutEnd = index === 3 ? range.end : range.end - 5;

  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const localFrame = frame - range.start;

  return (
    <ComparisonScene
      frame={localFrame}
      opacity={fadeIn * fadeOut}
      title={data.title}
      traditionalLabel={data.traditional.label}
      traditionalItems={data.traditional.items}
      nandsLabel={data.nands.label}
      nandsItems={data.nands.items}
      sceneNumber={`${String(index + 1).padStart(2, '0')}/${String(COMPARISONS.length).padStart(2, '0')}`}
      totalScenes={COMPARISONS.length}
      sceneIndex={index}
    />
  );
};
