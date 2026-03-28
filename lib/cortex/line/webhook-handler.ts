import crypto from 'crypto';

interface LineEvent {
  type: 'message' | 'postback' | 'follow' | 'unfollow';
  replyToken: string;
  source: { type: string; userId: string; groupId?: string };
  message?: { type: string; text?: string; id: string };
  postback?: { data: string };
  timestamp: number;
}

interface LineWebhookBody {
  events: LineEvent[];
  destination: string;
}

// Verify LINE signature
export function verifyLineSignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) return false;
  const hash = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
  return hash === signature;
}

// Send LINE reply
export async function replyToLine(replyToken: string, messages: LineMessage[]): Promise<void> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not set');

  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

// Push message (no reply token needed)
export async function pushToLine(userId: string, messages: LineMessage[]): Promise<void> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not set');

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });
}

type LineMessage = LineTextMessage | LineFlexMessage;
interface LineTextMessage { type: 'text'; text: string; }
interface LineFlexMessage { type: 'flex'; altText: string; contents: Record<string, unknown>; }

// Route events to appropriate handlers
export async function handleLineWebhook(body: LineWebhookBody): Promise<void> {
  for (const event of body.events) {
    try {
      switch (event.type) {
        case 'message':
          if (event.message?.type === 'text' && event.message.text) {
            // Import dynamically to avoid circular deps
            const { routeCommand } = await import('./command-router');
            await routeCommand(event.message.text, event.replyToken, event.source.userId);
          }
          break;
        case 'postback':
          if (event.postback) {
            const { handlePostback } = await import('./command-router');
            await handlePostback(event.postback.data, event.replyToken, event.source.userId);
          }
          break;
        case 'follow':
          const { handleFollow } = await import('./funnel-tracker');
          await handleFollow(event.source.userId);
          break;
      }
    } catch (err) {
      console.error(`[line-webhook] Error handling event ${event.type}:`, err);
    }
  }
}
