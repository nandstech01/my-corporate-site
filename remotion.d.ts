/**
 * Remotion型定義の補完
 * remotion v4のESMエクスポートをTypeScriptに認識させるための宣言
 */
declare module 'remotion' {
  import { CSSProperties, FC, ReactNode } from 'react';

  // Core hooks
  export function useCurrentFrame(): number;
  export function useVideoConfig(): VideoConfig;

  // Animation utilities
  export function interpolate(
    input: number,
    inputRange: readonly number[],
    outputRange: readonly number[],
    options?: {
      extrapolateLeft?: 'extend' | 'clamp' | 'identity';
      extrapolateRight?: 'extend' | 'clamp' | 'identity';
      easing?: (t: number) => number;
    }
  ): number;

  export function spring(config: {
    frame: number;
    fps: number;
    config?: {
      damping?: number;
      mass?: number;
      stiffness?: number;
      overshootClamping?: boolean;
    };
    from?: number;
    to?: number;
    durationInFrames?: number;
    durationRestThreshold?: number;
    reverse?: boolean;
    delay?: number;
  }): number;

  // Easing functions
  export const Easing: {
    linear: (t: number) => number;
    ease: (t: number) => number;
    quad: (t: number) => number;
    cubic: (t: number) => number;
    poly: (n: number) => (t: number) => number;
    sin: (t: number) => number;
    circle: (t: number) => number;
    exp: (t: number) => number;
    elastic: (bounciness?: number) => (t: number) => number;
    back: (s?: number) => (t: number) => number;
    bounce: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    in: (easing: (t: number) => number) => (t: number) => number;
    out: (easing: (t: number) => number) => (t: number) => number;
    inOut: (easing: (t: number) => number) => (t: number) => number;
  };

  // Components
  export const AbsoluteFill: FC<{
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }>;

  export const Sequence: FC<{
    from?: number;
    durationInFrames?: number;
    name?: string;
    layout?: 'absolute-fill' | 'none';
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }>;

  export const Composition: FC<{
    id: string;
    component: FC<any>;
    durationInFrames: number;
    fps: number;
    width: number;
    height: number;
    defaultProps?: Record<string, unknown>;
  }>;

  export const Img: FC<{
    src: string;
    style?: CSSProperties;
    className?: string;
    alt?: string;
  }>;

  export const Video: FC<{
    src: string;
    style?: CSSProperties;
    className?: string;
    volume?: number;
    muted?: boolean;
  }>;

  export const Audio: FC<{
    src: string;
    volume?: number;
    startFrom?: number;
    endAt?: number;
  }>;

  export const OffthreadVideo: FC<{
    src: string;
    style?: CSSProperties;
    className?: string;
    volume?: number;
    muted?: boolean;
  }>;

  // Types
  export interface VideoConfig {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    id: string;
    defaultProps: Record<string, unknown>;
  }

  // Utility functions
  export function staticFile(relativePath: string): string;
  export function getInputProps<T = Record<string, unknown>>(): T;
  export function continueRender(handle: number): void;
  export function delayRender(label?: string): number;
  export function cancelRender(error?: Error): void;

  // Random
  export function random(seed: string | number | null, ...args: (string | number)[]): number;

  // Register root
  export function registerRoot(component: FC): void;
}
