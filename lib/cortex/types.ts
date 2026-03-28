/**
 * CORTEX Type Definitions
 * Shared types for the CORTEX knowledge engine
 */

// ============================================================
// Database Row Types (matching migration schemas)
// ============================================================

export interface CortexPlatformRule {
  id: string;
  platform: Platform;
  rule_category: RuleCategory;
  rule_title: string;
  rule_description: string;
  source_url: string | null;
  source_type: SourceType | null;
  confidence: number;
  effective_from: string | null;
  deprecated_at: string | null;
  verified_by_data: boolean;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CortexViralAnalysis {
  id: string;
  buzz_post_id: string | null;
  platform: string;
  original_text: string;
  author_handle: string | null;
  hook_type: string | null;
  structure_type: string | null;
  closing_type: string | null;
  emoji_count: number;
  hashtag_count: number;
  char_length: number | null;
  emotional_trigger: string | null;
  information_density: number | null;
  novelty_score: number | null;
  authority_signal: string | null;
  controversy_level: number | null;
  actionability: number | null;
  likes: number;
  reposts: number;
  replies: number;
  impressions: number;
  engagement_rate: number;
  primary_buzz_factor: string | null;
  secondary_factors: string[] | null;
  anti_patterns: string[] | null;
  replicability_score: number | null;
  analyzed_at: string;
  analyzed_by: string;
}

export interface CortexTemporalPattern {
  id: string;
  platform: string;
  day_of_week: number;
  hour_jst: number;
  topic_category: string | null;
  content_type: string | null;
  sample_count: number;
  avg_engagement_rate: number;
  avg_likes: number;
  avg_impressions: number;
  max_engagement_rate: number;
  std_dev: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  recommendation_score: number;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

export interface CortexConversationLog {
  id: string;
  channel: Channel;
  conversation_type: ConversationType;
  summary: string;
  key_decisions: string[] | null;
  action_items: Record<string, unknown> | null;
  affected_files: string[] | null;
  affected_platforms: string[] | null;
  priority: Priority;
  status: ConversationStatus;
  created_at: string;
  completed_at: string | null;
}

// ============================================================
// Enum Types
// ============================================================

export type Platform = 'x' | 'linkedin' | 'threads' | 'instagram' | 'youtube' | 'zenn' | 'qiita';
export type RuleCategory = 'algorithm' | 'content_policy' | 'best_practice' | 'rate_limit' | 'format' | 'monetization';
export type SourceType = 'official_doc' | 'official_blog' | 'api_changelog' | 'verified_experiment' | 'community_consensus';
export type Channel = 'discord' | 'line' | 'slack';
export type ConversationType = 'content_review' | 'timing_discussion' | 'trend_analysis' | 'strategy_update' | 'learning_report' | 'guideline_update' | 'performance_review';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ConversationStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

// ============================================================
// Context Types (for Discord/LINE intelligence layer)
// ============================================================

export interface CortexContext {
  platformRules: CortexPlatformRule[];
  viralInsights: CortexViralAnalysis[];
  temporalPatterns: CortexTemporalPattern[];
  patternPerformance: PatternPerformanceSummary[];
  recentTrends: TrendSummary[];
  recentPosts: RecentPostSummary[];
}

export interface PatternPerformanceSummary {
  pattern_id: string;
  platform: string;
  successes: number;
  failures: number;
  total_uses: number;
  avg_engagement: number;
  success_rate: number;
}

export interface TrendSummary {
  content: string;
  context: Record<string, unknown>;
  created_at: string;
}

export interface RecentPostSummary {
  post_text: string;
  platform: string;
  posted_at: string;
  likes: number;
  impressions: number;
  engagement_rate: number;
  pattern_used: string | null;
}

// ============================================================
// Analysis Types
// ============================================================

export interface ViralAnalysisInput {
  post_text: string;
  platform: string;
  author_handle?: string;
  likes: number;
  reposts: number;
  replies: number;
  impressions: number;
  buzz_post_id?: string;
}

export interface ViralAnalysisResult {
  hook_type: string;
  structure_type: string;
  closing_type: string;
  emoji_count: number;
  hashtag_count: number;
  char_length: number;
  emotional_trigger: string;
  information_density: number;
  novelty_score: number;
  authority_signal: string;
  controversy_level: number;
  actionability: number;
  primary_buzz_factor: string;
  secondary_factors: string[];
  anti_patterns: string[];
  replicability_score: number;
}

export interface TemporalRecommendation {
  platform: string;
  recommended_slots: {
    day_of_week: number;
    hour_jst: number;
    avg_engagement_rate: number;
    sample_count: number;
    confidence: string; // "95% CI: [x, y]"
  }[];
  avoid_slots: {
    day_of_week: number;
    hour_jst: number;
    reason: string;
  }[];
}

export interface ContentReviewResult {
  overall_score: number;
  platform_compliance: {
    rule_title: string;
    status: 'pass' | 'warn' | 'fail';
    detail: string;
  }[];
  viral_potential: {
    score: number;
    similar_high_performers: string[];
    improvement_suggestions: string[];
  };
  timing_recommendation: TemporalRecommendation;
  evidence_sources: string[];
}

// ============================================================
// Loop State Types (AI-to-AI conversation loop)
// ============================================================

export type LoopSpeaker = 'ai_a' | 'ai_b';
export type LoopAgendaTopic = 'post_review' | 'buzz_post' | 'performance' | 'pattern_optimize' | 'strategy';
export type LoopAgendaPhase = 'analyze' | 'propose' | 'execute' | 'learn';
export type LoopStatus = 'active' | 'paused' | 'sleeping';

export interface CortexLoopState {
  id: string;
  turn_number: number;
  current_speaker: LoopSpeaker;
  agenda_topic: LoopAgendaTopic;
  agenda_phase: LoopAgendaPhase;
  context_summary: string | null;
  last_message_id: string | null;
  turns_today: number;
  posts_today: number;
  last_turn_at: string | null;
  daily_budget: number;
  status: LoopStatus;
  created_at: string;
  updated_at: string;
}

export interface LoopExecutorResult {
  topic: LoopAgendaTopic;
  phase: LoopAgendaPhase;
  turn_number: number;
  response_text: string;
  actions_taken: string[];
  next_action: string;
  posts_published: number;
}

export interface TrendResearchResult {
  topic: string;
  maturity: 'emerging' | 'growing' | 'saturated';
  unexplored_angles: string[];
  japan_specific_angle: string;
  freshness_score: number;
  recommended_content_types: string[];
  supporting_data: {
    source: string;
    relevance: number;
    summary: string;
  }[];
}
