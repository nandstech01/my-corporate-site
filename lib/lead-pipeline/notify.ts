import { sendMessage, SLACK_GENERAL_CHANNEL_ID } from '@/lib/slack-bot/slack-client'

interface LeadNotificationData {
  readonly email: string
  readonly serviceType: string
  readonly budget: string
  readonly leadScore?: number
  readonly leadTier?: string
  readonly estimatedPrice?: number
}

const TIER_EMOJI: Record<string, string> = {
  hot: '🔥',
  warm: '🟡',
  cold: '🔵',
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  homepage: 'ホームページ制作',
  efficiency: '業務効率化',
  'custom-dev': 'カスタム開発',
  'ai-integration': 'AI導入',
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ja-JP')}円`
}

export async function notifyNewLead(data: LeadNotificationData): Promise<void> {
  try {
    const channel = process.env.SLACK_LEAD_CHANNEL_ID || SLACK_GENERAL_CHANNEL_ID
    const tier = data.leadTier ?? 'cold'
    const emoji = TIER_EMOJI[tier] ?? '🔵'
    const serviceLabel = SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType
    const isHot = tier === 'hot'

    const blocks = [
      {
        type: 'header' as const,
        text: {
          type: 'plain_text' as const,
          text: `${emoji} 新規リード（${tier.toUpperCase()}）`,
          emoji: true,
        },
      },
      {
        type: 'section' as const,
        fields: [
          {
            type: 'mrkdwn' as const,
            text: `*メール:*\n${data.email}`,
          },
          {
            type: 'mrkdwn' as const,
            text: `*サービス:*\n${serviceLabel}`,
          },
          {
            type: 'mrkdwn' as const,
            text: `*予算:*\n${data.budget || '未回答'}`,
          },
          {
            type: 'mrkdwn' as const,
            text: `*見積金額:*\n${data.estimatedPrice ? formatPrice(data.estimatedPrice) : '未算出'}`,
          },
          {
            type: 'mrkdwn' as const,
            text: `*リードスコア:*\n${data.leadScore ?? 'N/A'}`,
          },
          {
            type: 'mrkdwn' as const,
            text: `*リードランク:*\n${emoji} ${tier.toUpperCase()}`,
          },
        ],
      },
    ]

    const fallbackText = isHot
      ? `<!channel> ${emoji} 新規HOTリード: ${data.email} (${serviceLabel})`
      : `${emoji} 新規リード: ${data.email} (${serviceLabel})`

    await sendMessage({
      channel,
      text: fallbackText,
      blocks,
    })
  } catch (error) {
    console.error('Lead notification failed (non-fatal):', error)
  }
}
