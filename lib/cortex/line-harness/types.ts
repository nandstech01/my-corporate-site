// Re-export SDK types for internal use
export type {
  Friend, Tag, Scenario, ScenarioWithSteps, ScenarioStep,
  Broadcast, RichMenu, TrackedLink, Form,
  LineHarnessConfig, LineHarnessError,
  FriendListParams, CreateTagInput, CreateScenarioInput,
  CreateBroadcastInput, SegmentCondition, SegmentRule,
  ScenarioTriggerType, MessageType, BroadcastStatus,
  StepDefinition, CreateStepInput,
  PaginatedData, ApiResponse,
} from '@line-harness/sdk'

// Bridge-specific types
export interface LineFirendMirror {
  id: string;
  line_user_id: string;
  harness_friend_id: string | null;
  display_name: string | null;
  source_platform: string | null;
  source_campaign: string | null;
  tags: string[];
  current_score: number;
  score_tier: 'cold' | 'warm' | 'hot';
  current_scenario: string | null;
  rich_menu_id: string | null;
  last_message_at: string | null;
  friend_added_at: string | null;
  synced_at: string;
  created_at: string;
}

export interface ScoringEvent {
  line_user_id: string;
  event_type: string;
  score_delta: number;
  source_platform: string | null;
  source_detail: Record<string, unknown> | null;
}

export interface ScoreTier {
  readonly name: 'cold' | 'warm' | 'hot';
  readonly min_score: number;
  readonly rich_menu_id?: string;
}

export const SCORE_TIERS: readonly ScoreTier[] = [
  { name: 'hot', min_score: 100 },
  { name: 'warm', min_score: 30 },
  { name: 'cold', min_score: 0 },
] as const;

export const SNS_ENGAGEMENT_SCORES: Record<string, Record<string, number>> = {
  x: { like: 1, retweet: 3, reply: 5, profile_click: 2 },
  linkedin: { like: 2, comment: 5, share: 3 },
  instagram: { story_view: 1, dm: 10 },
  threads: { like: 1, reply: 3, repost: 2 },
  web: { clavi_signup: 30, contact_form: 50 },
  line: { message_open: 1, link_click: 3, form_submit: 10, booking: 20 },
};

export const UTM_TAG_MAP: Record<string, string> = {
  x: 'utm:x',
  twitter: 'utm:x',
  linkedin: 'utm:linkedin',
  threads: 'utm:threads',
  instagram: 'utm:instagram',
  youtube: 'utm:youtube',
  zenn: 'utm:zenn',
  qiita: 'utm:qiita',
  blog: 'utm:blog',
};
