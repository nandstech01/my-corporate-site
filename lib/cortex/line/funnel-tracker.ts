import { getSupabaseAdmin } from '../discord/context-builder';
import { pushToLine } from './webhook-handler';
import { logConversation } from './discord-bridge';

interface LineFriend {
  userId: string;
  source_platform: string | null;
  source_campaign: string | null;
  interest_topics: string[];
  added_at: string;
}

// Handle new LINE friend follow event
export async function handleFollow(userId: string): Promise<void> {
  console.log(`[funnel-tracker] New LINE friend: ${userId}`);

  // Get user profile from LINE
  const profile = await getLineProfile(userId);

  // Log the follow event
  await logConversation({
    channel: 'line',
    conversation_type: 'strategy_update',
    summary: `New LINE friend: ${profile?.displayName || userId}`,
    affected_platforms: ['line'],
    priority: 'low',
  });

  // Send welcome message
  await pushToLine(userId, [{
    type: 'flex',
    altText: 'nands.techへようこそ！',
    contents: buildWelcomeBubble(profile?.displayName || 'ゲスト'),
  }]);

  // Bridge to LINE Harness CRM (non-blocking, failure-safe)
  try {
    const { bridgeFollowToHarness } = await import('../line-harness/funnel-bridge')
    await bridgeFollowToHarness(userId)
  } catch {
    console.error('[funnel-tracker] LINE Harness bridge unavailable, continuing without')
  }
}

// Generate LINE friend add URL with UTM tracking
export function generateLineAddUrl(params: {
  platform: string;
  campaign?: string;
  topic?: string;
}): string {
  const lineId = process.env.LINE_OFFICIAL_ACCOUNT_ID || '';
  const base = `https://line.me/R/ti/p/${lineId}`;
  // Note: LINE doesn't support URL params in friend add links directly.
  // Instead, we use a redirect through our domain for tracking.
  const trackingUrl = new URL('https://nands.tech/api/cortex/line-redirect');
  trackingUrl.searchParams.set('utm_source', params.platform);
  if (params.campaign) trackingUrl.searchParams.set('utm_campaign', params.campaign);
  if (params.topic) trackingUrl.searchParams.set('utm_content', params.topic);
  trackingUrl.searchParams.set('redirect', base);
  return trackingUrl.toString();
}

// Embed LINE CTA in SNS post text
export function embedLineCTA(postText: string, platform: string): string {
  const url = generateLineAddUrl({ platform, campaign: 'sns_funnel' });
  // Only add CTA to long-form content (articles, threads)
  if (postText.length < 200) return postText;
  return `${postText}\n\n📱 LINEで最新AI情報を受け取る: ${url}`;
}

// Get LINE user profile
async function getLineProfile(userId: string): Promise<{ displayName: string; pictureUrl?: string } | null> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Build welcome Flex Message
function buildWelcomeBubble(displayName: string): Record<string, unknown> {
  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical',
      backgroundColor: '#1a1a2e',
      contents: [
        { type: 'text', text: 'CORTEX', weight: 'bold', size: 'xl', color: '#D97757' },
        { type: 'text', text: `${displayName}さん、ようこそ！`, size: 'md', color: '#ffffff', margin: 'sm' },
      ],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'md',
      contents: [
        { type: 'text', text: 'AIで進化するSNS運用エンジン', size: 'sm', wrap: true, color: '#666666' },
        { type: 'separator' },
        { type: 'text', text: '使い方:', weight: 'bold', size: 'sm', margin: 'md' },
        { type: 'text', text: '📊「バズ」で今日のトレンド\n✍️「投稿して」でAI投稿生成\n📈「成績」で週間レポート', size: 'sm', wrap: true, color: '#888888' },
      ],
    },
  };
}
