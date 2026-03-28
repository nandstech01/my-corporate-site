import { getSupabaseAdmin } from '../discord/context-builder';
import type { CortexConversationLog, Channel } from '../types';

// Log conversation from any channel
export async function logConversation(params: {
  channel: Channel;
  conversation_type: CortexConversationLog['conversation_type'];
  summary: string;
  key_decisions?: string[];
  action_items?: Record<string, unknown>;
  affected_files?: string[];
  affected_platforms?: string[];
  priority?: CortexConversationLog['priority'];
}): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('cortex_conversation_log')
    .insert({
      channel: params.channel,
      conversation_type: params.conversation_type,
      summary: params.summary,
      key_decisions: params.key_decisions || [],
      action_items: params.action_items || {},
      affected_files: params.affected_files || [],
      affected_platforms: params.affected_platforms || [],
      priority: params.priority || 'medium',
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[discord-bridge] Failed to log conversation:', error);
    return null;
  }

  return data?.id || null;
}

// Forward complex request from LINE to Discord for Claude Code processing
export async function forwardToDiscord(params: {
  userId: string;
  requestType: string;
  content: string;
  replyToken?: string;
}): Promise<void> {
  // Log the request
  await logConversation({
    channel: 'line',
    conversation_type: 'content_review',
    summary: `LINE user ${params.userId}: ${params.requestType} - ${params.content.slice(0, 200)}`,
    priority: 'high',
  });

  // Send notification to Discord via webhook (if configured)
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhookUrl) {
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📱 LINE Request: ${params.requestType}\n\`\`\`${params.content.slice(0, 1800)}\`\`\``,
      }),
    }).catch(err => console.error('[discord-bridge] Discord webhook failed:', err));
  }
}

// Get pending conversation items for a channel
export async function getPendingConversations(channel: Channel): Promise<CortexConversationLog[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('cortex_conversation_log')
    .select('*')
    .eq('channel', channel)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[discord-bridge] Failed to fetch pending conversations:', error);
    return [];
  }

  return (data || []) as CortexConversationLog[];
}

// Update conversation status
export async function updateConversationStatus(
  id: string,
  status: 'in_progress' | 'completed' | 'rejected',
  key_decisions?: string[]
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const update: Record<string, unknown> = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();
  if (key_decisions) update.key_decisions = key_decisions;

  const { error } = await supabase
    .from('cortex_conversation_log')
    .update(update)
    .eq('id', id);

  if (error) {
    console.error('[discord-bridge] Failed to update conversation:', error);
  }
}

// Notify Discord of a post execution from LINE CORTEX with rich embed
export async function notifyPostExecution(params: {
  platform: string;
  postText: string;
  postUrl: string;
  patternUsed: string | null;
  userId: string;
}): Promise<void> {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) return;

  const colorMap: Record<string, number> = {
    x: 0x1DA1F2,
    linkedin: 0x0077B5,
    threads: 0x000000,
  };

  const payload = {
    embeds: [
      {
        title: '🚀 LINE CORTEX → SNS投稿',
        description: params.postText.slice(0, 300),
        color: colorMap[params.platform] ?? 0x808080,
        fields: [
          { name: 'Platform', value: params.platform, inline: true },
          { name: 'Pattern', value: params.patternUsed || 'N/A', inline: true },
        ],
        url: params.postUrl,
        footer: { text: 'CORTEX by NANDS' },
      },
    ],
  };

  try {
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[discord-bridge] Post execution webhook failed:', err);
  }
}
