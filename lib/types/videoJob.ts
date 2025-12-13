/**
 * VIDEO Job 型定義
 * 
 * データベース: video_jobs テーブル
 * 用途: ショート動画制作ジョブの管理
 * 
 * 作成日: 2025-12-10
 * Phase: 1 (マルチユーザー対応)
 */

// ===================================
// ステータス型
// ===================================

/**
 * VIDEO Job のステータス
 */
export type VideoJobStatus = 
  | 'draft'              // 下書き（編集中）
  | 'akool_processing'   // Akool処理中（2-5分）
  | 'akool_done'         // Akoolアバター生成完了
  | 'final_uploaded'     // 完成動画アップロード済み
  | 'youtube_uploaded'   // YouTube限定公開完了
  | 'error';             // エラー発生

// ===================================
// JSON型フィールドの型定義
// ===================================

/**
 * 音声設定（voice JSONB）
 */
export interface VoiceConfig {
  voiceId: string;
  audioJobId?: string;
  from?: number;
  voice_model_id?: string;
  status?: number;
  ttsProvider?: 'akool' | 'elevenlabs' | 'google' | 'openai';
  emotion?: 'neutral' | 'happy' | 'serious' | 'friendly' | 'sad';
  speed?: number;
  pitch?: number;
  url?: string;
}

/**
 * アバター設定（avatar JSONB）
 */
export interface AvatarConfig {
  avatarTemplateId: string;
  akoolJobId?: string;
  akoolVideoUrl?: string;
  url?: string;
  from?: number;
  resolution?: string;
  status?: number;
  source?: 'akool' | 'custom';
  customAvatarUrl?: string;
  expression?: string;
  scale?: { x: number; y: number };
  position?: { x: number; y: number };
}

/**
 * 背景設定（background JSONB）
 */
export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'video';
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: 'vertical' | 'horizontal' | 'diagonal';
  imageUrl?: string;
  videoUrl?: string;
  blur?: number;
  opacity?: number;
}

/**
 * 字幕セグメント
 */
export interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

/**
 * 字幕/テロップ設定（caption JSONB）
 */
export interface CaptionConfig {
  enabled: boolean;
  style: 'modern' | 'classic' | 'minimal' | 'bold';
  font: string;
  fontSize: number;
  color: string;
  outlineColor: string;
  outlineWidth?: number;
  position: 'top' | 'center' | 'bottom';
  srtUrl?: string;
  segments?: CaptionSegment[];
  animation?: 'fade' | 'slide' | 'none';
  animationDuration?: number;
}

/**
 * BGM設定（music JSONB）
 */
export interface MusicConfig {
  enabled: boolean;
  bgmId: string;
  url: string;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  startTime?: number;
  endTime?: number;
}

/**
 * タイムライン要素
 */
export interface TimelineItem {
  type: 'background' | 'avatar' | 'caption' | 'bgm' | 'overlay';
  start: number;
  end: number;
  layerIndex: number;
  assetUrl?: string;
  config?: any;
  volume?: number;
}

/**
 * メトリクス（metrics JSONB）
 */
export interface VideoJobMetrics {
  duration?: number;
  fileSize?: number;
  views?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
  shares?: number;
  ctr?: number;
  avgWatchTime?: number;
  watchTimePercentage?: number;
  akoolProcessingTime?: number;
  totalCost?: number;
  lastFetchedAt?: string;
}

/**
 * 構造化台本（script_struct JSONB）
 */
export interface ScriptStruct {
  hook?: { text: string; duration: number };
  body?: { text: string; duration: number };
  payoff?: { text: string; duration: number };
  cta?: { text: string; duration: number };
  totalDuration?: number;
}

// ===================================
// VIDEO Job メイン型
// ===================================

/**
 * VIDEO Job（完全な型定義）
 */
export interface VideoJob {
  id: string;
  user_id: string;
  status: VideoJobStatus;
  
  // メタ情報
  title_internal: string;
  youtube_title: string;
  youtube_description: string | null;
  youtube_tags: string[];
  
  // 台本
  script_raw: string;
  script_struct: ScriptStruct | null;
  
  // JSON型フィールド
  voice: VoiceConfig | null;
  avatar: AvatarConfig | null;
  background: BackgroundConfig | null;
  caption: CaptionConfig | null;
  music: MusicConfig | null;
  timeline: TimelineItem[] | null;
  
  // Akool連携
  akool_job_id: string | null;
  akool_video_url: string | null;
  
  // 完成動画
  final_video_url: string | null;
  
  // YouTube連携
  youtube_video_id: string | null;
  youtube_url: string | null;
  youtube_published_at: string | null;
  
  // メトリクス
  metrics: VideoJobMetrics | null;
  
  // ブログ連携
  related_blog_post_id: string | null;
  article_slug: string | null;
  
  // タイムスタンプ
  created_at: string;
  updated_at: string;
}

// ===================================
// API リクエスト/レスポンス型
// ===================================

export interface CreateVideoJobRequest {
  title_internal: string;
  youtube_title: string;
  youtube_description?: string;
  youtube_tags?: string[];
  script_raw: string;
  voice?: Partial<VoiceConfig>;
  avatar?: Partial<AvatarConfig>;
  related_blog_post_id?: number;
}

export interface UpdateVideoJobRequest {
  title_internal?: string;
  youtube_title?: string;
  youtube_description?: string;
  youtube_tags?: string[];
  script_raw?: string;
  voice?: Partial<VoiceConfig>;
  avatar?: Partial<AvatarConfig>;
  background?: Partial<BackgroundConfig>;
  caption?: Partial<CaptionConfig>;
  music?: Partial<MusicConfig>;
  related_blog_post_id?: string | null;
}

// ===================================
// 型ガード
// ===================================

export function isVideoJob(obj: any): obj is VideoJob {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.title_internal === 'string' &&
    typeof obj.youtube_title === 'string' &&
    typeof obj.script_raw === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

export function isValidStatus(status: string): status is VideoJobStatus {
  return [
    'draft',
    'akool_processing',
    'akool_done',
    'final_uploaded',
    'youtube_uploaded',
    'error'
  ].includes(status);
}

// ===================================
// デフォルト値
// ===================================

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceId: 'female',
};

export const DEFAULT_AVATAR_CONFIG: Partial<AvatarConfig> = {
  avatarTemplateId: '',
};

export function getDefaultVideoJob(userId: string): Omit<VideoJob, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    status: 'draft',
    title_internal: '',
    youtube_title: '',
    youtube_description: null,
    youtube_tags: [],
    script_raw: '',
    script_struct: null,
    voice: DEFAULT_VOICE_CONFIG,
    avatar: null,
    background: null,
    caption: null,
    music: null,
    timeline: null,
    akool_job_id: null,
    akool_video_url: null,
    final_video_url: null,
    youtube_video_id: null,
    youtube_url: null,
    youtube_published_at: null,
    metrics: null,
    related_blog_post_id: null,
    article_slug: null,
  };
}

