export const VIDEO_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  FPS: 30,
  DURATION: 360, // 12 seconds at 30fps (AI Orbit + SNS Flow)
} as const;

export const HERO_BG_CONFIG = {
  WIDTH: 960,
  HEIGHT: 1080,
  FPS: 30,
  DURATION: 90, // 3 seconds at 30fps (structured data only, then fades)
} as const;

export const COLORS = {
  primary: '#2563EB',
  secondary: '#06B6D4',
  accent: '#1E3A8A',
  dark: {
    bg: '#0F172A',
    text: '#E2E8F0',
    card: '#1E293B',
    border: '#334155',
  },
  light: {
    bg: '#F8FAFC',
    text: '#1E293B',
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  ai: {
    chatgpt: '#10A37F',
    gemini: '#8B5CF6',
    perplexity: '#14B8A6',
  },
} as const;

export interface ClaviHeroProps {
  isDark: boolean;
}

export interface HeroBgProps {
  isDark: boolean;
}

export const SCENE_COLORS = {
  // Scene 1: Structured Data
  json: {
    bracket: '#94A3B8',
    key: '#38BDF8',
    string: '#A78BFA',
    check: '#10B981',
  },
  schema: {
    article: '#8B5CF6',
    product: '#EC4899',
    faq: '#F59E0B',
    service: '#3B82F6',
  },

  // Scene 2: SNS
  sns: {
    youtube: '#FF0000',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    x: '#000000',
    active: '#10B981',
  },

  // Scene 3: Graph
  graph: {
    line: '#A855F7',
    fill: 'rgba(168, 85, 247, 0.2)',
    grid: 'rgba(255, 255, 255, 0.1)',
    gauge: '#22D3EE',
  },
} as const;
