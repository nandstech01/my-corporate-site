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

export const BEFORE_AFTER_CONFIG = {
  WIDTH: 400,
  HEIGHT: 200,
  FPS: 30,
  DURATION: 180, // 6 seconds at 30fps, loops
} as const;

export interface BeforeAfterProps {
  isDark: boolean;
}

export const FEATURES_HERO_CONFIG = {
  WIDTH: 1200,
  HEIGHT: 600,
  FPS: 30,
  DURATION: 180, // 6 seconds at 30fps, loops
} as const;

export interface FeaturesHeroProps {
  isDark: boolean;
}

export const SDLP_HERO_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  FPS: 30,
  DURATION: 360, // 12 seconds at 30fps (Architecture + Pipeline)
} as const;

export interface SdlpHeroProps {
  isDark: boolean;
}

export const SDLP_VALUEPROP_CONFIG = {
  WIDTH: 800,
  HEIGHT: 450,
  FPS: 30,
  DURATION: 210, // 7 seconds at 30fps (3 scenes loop)
} as const;

export interface SdlpValuePropProps {
  isDark: boolean;
}

export const SDLP_VP_COLORS = {
  chat: {
    userBubble: '#2563EB',
    aiBubble: '#1E293B',
    aiAvatar: '#06B6D4',
    userAvatar: '#8B5CF6',
    header: '#0F172A',
  },
  code: {
    nextjs: '#2563EB',
    typescript: '#3178C6',
    supabase: '#3ECF8E',
    ai: '#F59E0B',
    keyword: '#C084FC',
    string: '#34D399',
  },
  metrics: {
    speed: '#2563EB',
    cost: '#06B6D4',
    uptime: '#10B981',
  },
  bg: {
    dark: '#0A1628',
    card: '#1E293B',
    light: '#F8FAFC',
    cardLight: '#FFFFFF',
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    dark: '#1E293B',
    darkSecondary: '#64748B',
  },
} as const;

export const SDLP_SCENE_COLORS = {
  architecture: {
    frontend: '#2563EB',
    api: '#06B6D4',
    database: '#a855f7',
    auth: '#10B981',
  },
  pipeline: {
    requirements: '#2563EB',
    design: '#06B6D4',
    development: '#a855f7',
    testing: '#10B981',
    deploy: '#F59E0B',
  },
  bg: {
    dark: '#0A1628',
    mid: '#0F172A',
    card: '#1E293B',
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
  glow: {
    cyan: '#06B6D4',
    blue: '#2563EB',
    purple: '#a855f7',
  },
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
