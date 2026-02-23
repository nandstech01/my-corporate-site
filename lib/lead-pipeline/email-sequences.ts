/**
 * Tier-based drip email sequence definitions
 */

export interface EmailStep {
  readonly dayOffset: number
  readonly subject: string
  readonly templateKey: string
  readonly description: string
}

export interface EmailSequence {
  readonly key: string
  readonly tier: 'hot' | 'warm' | 'cold'
  readonly steps: readonly EmailStep[]
}

export const EMAIL_SEQUENCES: Record<string, EmailSequence> = {
  hot: {
    key: 'hot_nurture',
    tier: 'hot',
    steps: [
      {
        dayOffset: 0,
        subject: '【NANDS】AI開発提案書のご確認・無料相談のご案内',
        templateKey: 'proposal_with_calendly',
        description: '提案書 + Calendly予約リンク',
      },
      {
        dayOffset: 2,
        subject: '【NANDS】無料相談のご案内（30分で具体的な進め方をご提案）',
        templateKey: 'follow_up_call',
        description: 'フォローアップ電話促し',
      },
      {
        dayOffset: 7,
        subject: '【NANDS】同業種のAI導入事例をお届け',
        templateKey: 'case_study',
        description: '同業種事例紹介',
      },
      {
        dayOffset: 14,
        subject: '【NANDS】期間限定：初回開発費用20%OFFキャンペーン',
        templateKey: 'limited_offer',
        description: '期間限定オファー',
      },
    ],
  },
  warm: {
    key: 'warm_nurture',
    tier: 'warm',
    steps: [
      {
        dayOffset: 0,
        subject: '【NANDS】AI開発提案書・詳細資料のお届け',
        templateKey: 'proposal_with_resources',
        description: '提案書 + 資料',
      },
      {
        dayOffset: 3,
        subject: '【NANDS】AI導入事例集のご案内',
        templateKey: 'case_study_collection',
        description: '事例集送付',
      },
      {
        dayOffset: 7,
        subject: '【NANDS】AI開発のROI：投資対効果を数字で解説',
        templateKey: 'roi_content',
        description: 'AI開発ROIコンテンツ',
      },
      {
        dayOffset: 14,
        subject: '【NANDS】スモールスタートプラン：10万円からのAI導入',
        templateKey: 'small_start',
        description: 'スモールスタートプラン案内',
      },
    ],
  },
  cold: {
    key: 'cold_nurture',
    tier: 'cold',
    steps: [
      {
        dayOffset: 0,
        subject: '【NANDS】開発事例集のご案内',
        templateKey: 'case_study_light',
        description: '事例集送付',
      },
      {
        dayOffset: 7,
        subject: '【NANDS】中小企業のAI活用ガイド',
        templateKey: 'education_content',
        description: '教育コンテンツ',
      },
      {
        dayOffset: 21,
        subject: '【NANDS】2026年のAI開発トレンドレポート',
        templateKey: 'market_report',
        description: '市場動向レポート',
      },
    ],
  },
} as const

export function getSequenceForTier(tier: string): EmailSequence {
  if (tier === 'hot') return EMAIL_SEQUENCES.hot
  if (tier === 'warm') return EMAIL_SEQUENCES.warm
  return EMAIL_SEQUENCES.cold
}
