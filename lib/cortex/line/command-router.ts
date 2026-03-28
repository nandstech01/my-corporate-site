import { replyToLine } from './webhook-handler';

// Command routing
export async function routeCommand(text: string, replyToken: string, userId: string): Promise<void> {
  const normalizedText = text.trim().toLowerCase();

  try {
    if (normalizedText.includes('バズ') || normalizedText.includes('buzz')) {
      await handleBuzzCommand(replyToken, userId);
    } else if (normalizedText.includes('投稿') || normalizedText.includes('post')) {
      await handlePostCommand(text, replyToken, userId);
    } else if (normalizedText.includes('成績') || normalizedText.includes('performance') || normalizedText.includes('振り返り')) {
      await handlePerformanceCommand(replyToken);
    } else if (normalizedText.includes('トレンド') || normalizedText.includes('trend')) {
      await handleTrendCommand(replyToken);
    } else if (normalizedText.includes('ルール') || normalizedText.includes('guideline')) {
      await handleGuidelineCommand(text, replyToken);
    } else if (normalizedText.includes('分析') || normalizedText.includes('analyze')) {
      await handleAnalyzeCommand(text, replyToken);
    } else {
      await replyToLine(replyToken, [{
        type: 'text',
        text: 'CORTEX コマンド一覧:\n\n' +
          '📊 「バズ」→ 今日のバズネタ\n' +
          '✍️ 「投稿して [テーマ]」→ AI投稿案生成\n' +
          '📈 「成績」→ 週間パフォーマンス\n' +
          '🔥 「トレンド」→ ディープトレンド分析\n' +
          '📋 「ルール [X/LinkedIn]」→ ガイドライン確認\n' +
          '🔍 「分析して [URL or テキスト]」→ 構造分析',
      }]);
    }
  } catch (err) {
    console.error('[line-command] Error:', err);
    await replyToLine(replyToken, [{ type: 'text', text: 'エラーが発生しました。もう一度お試しください。' }]);
  }
}

// Handle postback actions (from Flex Message buttons)
export async function handlePostback(data: string, replyToken: string, userId: string): Promise<void> {
  try {
    const params = new URLSearchParams(data);
    const action = params.get('action');

    switch (action) {
      case 'generate': {
        // Generate AI post from buzz content
        const platform = params.get('platform') || 'x';
        const buzzIdx = params.get('buzz_idx') || '0';
        await replyToLine(replyToken, [{ type: 'text', text: `✍️ ${platform.toUpperCase()}用の投稿を生成中...` }]);
        try {
          const { handleLiveGenerate } = await import('./live-handlers');
          // Fetch buzz content from stored data
          const { getSupabase } = await import('../discord/context-builder');
          const supabase = getSupabase();
          const { data: buzzes } = await supabase
            .from('buzz_posts')
            .select('post_text')
            .order('buzz_score', { ascending: false })
            .limit(5);
          const buzzContent = buzzes?.[parseInt(buzzIdx)]?.post_text || 'AI最新動向';
          await handleLiveGenerate(userId, platform, buzzContent);
        } catch (err) {
          console.error('[line-postback] Generate failed:', err);
        }
        break;
      }
      case 'execute': {
        // Actually post to SNS
        const pendingId = params.get('pending_id') || '';
        await replyToLine(replyToken, [{ type: 'text', text: '🚀 投稿中...' }]);
        try {
          const { handleLiveExecute } = await import('./live-handlers');
          await handleLiveExecute(userId, pendingId);
        } catch (err) {
          console.error('[line-postback] Execute failed:', err);
        }
        break;
      }
      case 'reject': {
        const pendingId = params.get('pending_id') || '';
        if (pendingId) {
          const { getSupabase } = await import('../discord/context-builder');
          const supabase = getSupabase();
          await supabase.from('cortex_pending_posts').update({ status: 'rejected' }).eq('id', pendingId);
        }
        await replyToLine(replyToken, [{ type: 'text', text: '❌ 投稿を却下しました。' }]);
        break;
      }
      case 'approve_post': {
        // Legacy approval (from old flow) - redirect to execute
        const pendingId = params.get('pending_id') || '';
        if (pendingId) {
          await replyToLine(replyToken, [{ type: 'text', text: '🚀 投稿中...' }]);
          try {
            const { handleLiveExecute } = await import('./live-handlers');
            await handleLiveExecute(userId, pendingId);
          } catch (err) {
            console.error('[line-postback] Execute failed:', err);
          }
        } else {
          await replyToLine(replyToken, [{ type: 'text', text: '❌ 投稿データが見つかりません。もう一度生成してください。' }]);
        }
        break;
      }
      case 'reject_post':
        await replyToLine(replyToken, [{ type: 'text', text: '❌ 投稿を却下しました。' }]);
        break;
      case 'edit_post':
        await replyToLine(replyToken, [{ type: 'text', text: '✏️ 修正テキストを送信してください。' }]);
        break;
      default:
        await replyToLine(replyToken, [{ type: 'text', text: '不明なアクションです。' }]);
    }
  } catch (err) {
    console.error('[line-postback] Error:', err);
    await replyToLine(replyToken, [{ type: 'text', text: 'エラーが発生しました。' }]);
  }
}

// ---- Command Handlers ----

async function handleBuzzCommand(replyToken: string, userId: string): Promise<void> {
  // Immediate feedback (free replyMessage)
  await replyToLine(replyToken, [{ type: 'text', text: '📊 バズ分析中...\nリアルタイムデータを取得しています。' }]);

  // Real data fetch + Flex Carousel via pushMessage
  try {
    const { handleLiveBuzz } = await import('./live-handlers');
    await handleLiveBuzz(userId);
  } catch (err) {
    console.error('[line-command] Live buzz failed:', err);
  }
}

async function handlePostCommand(text: string, replyToken: string, userId: string): Promise<void> {
  const topic = text.replace(/投稿(して)?/g, '').replace(/post/gi, '').trim() || 'AI最新動向';

  // Immediate feedback (free replyMessage)
  await replyToLine(replyToken, [{ type: 'text', text: '✍️ AI投稿生成中...\n既存パターンDB + Thompson Samplingで最適な投稿を生成しています。\n10-15秒お待ちください。' }]);

  // Real AI generation via existing post-graph pipeline + pushMessage
  try {
    const { handleLiveGenerate } = await import('./live-handlers');
    await handleLiveGenerate(userId, 'x', topic);
  } catch (err) {
    console.error('[line-command] Live generate failed:', err);
  }
}

async function handlePerformanceCommand(replyToken: string): Promise<void> {
  const { handlePerformanceReview } = await import('../discord/command-handler');
  const report = await handlePerformanceReview(7);

  const lines = [
    `📊 週間パフォーマンスレポート`,
    `\n${report.executive_summary}`,
    `\n🏆 Wins:`,
    ...report.wins.map((w: string) => `  • ${w}`),
    `\n📌 改善点:`,
    ...report.improvements.map((i: string) => `  • ${i}`),
  ];

  await replyToLine(replyToken, [{ type: 'text', text: lines.join('\n').slice(0, 5000) }]);
}

async function handleTrendCommand(replyToken: string): Promise<void> {
  const { handleTrendQuery } = await import('../discord/command-handler');
  const result = await handleTrendQuery();

  const lines = ['🔥 ディープトレンド分析\n'];
  for (const trend of result.trends.slice(0, 5)) {
    lines.push(`■ ${trend.topic} [${trend.maturity}]`);
    lines.push(`  未開拓角度: ${trend.unexplored_angles[0] || 'N/A'}`);
    lines.push(`  日本市場: ${trend.japan_specific_angle || 'N/A'}`);
    lines.push('');
  }

  await replyToLine(replyToken, [{ type: 'text', text: lines.join('\n').slice(0, 5000) }]);
}

async function handleGuidelineCommand(text: string, replyToken: string): Promise<void> {
  const { handleGuidelineCheck } = await import('../discord/command-handler');
  const platform = text.includes('linkedin') || text.includes('LinkedIn') ? 'linkedin' as const
    : text.includes('threads') || text.includes('Threads') ? 'threads' as const
    : text.includes('instagram') || text.includes('Instagram') ? 'instagram' as const
    : 'x' as const;

  const report = await handleGuidelineCheck(platform);

  const lines = [`📋 ${platform.toUpperCase()} ガイドライン (${report.active_rules.length}件)\n`];
  for (const rule of report.active_rules.slice(0, 10)) {
    lines.push(`[${rule.rule_category}] ${rule.rule_title}`);
    lines.push(`  ${rule.rule_description.slice(0, 100)}...`);
    lines.push(`  信頼度: ${(rule.confidence * 100).toFixed(0)}% | 検証済: ${rule.verified_by_data ? '✅' : '未'}`);
    lines.push('');
  }

  if (report.recent_changes.length > 0) {
    lines.push(`\n⚠️ 最近の変更 (${report.recent_changes.length}件):`);
    for (const change of report.recent_changes) {
      lines.push(`  • ${change.rule_title}`);
    }
  }

  await replyToLine(replyToken, [{ type: 'text', text: lines.join('\n').slice(0, 5000) }]);
}

async function handleAnalyzeCommand(text: string, replyToken: string): Promise<void> {
  const input = text.replace(/分析(して)?/g, '').replace(/analyze/gi, '').trim();

  if (!input) {
    await replyToLine(replyToken, [{ type: 'text', text: '分析対象のテキストまたはURLを送信してください。' }]);
    return;
  }

  const { handleContentReview } = await import('../discord/command-handler');
  const result = await handleContentReview(input, 'x');

  const lines = [
    `🔍 コンテンツ分析結果`,
    `\n総合スコア: ${result.overall_score}/100`,
    `\nバイラルポテンシャル: ${result.viral_potential.score}/100`,
    `\n改善提案:`,
    ...result.viral_potential.improvement_suggestions.map((s: string) => `  • ${s}`),
    `\n根拠:`,
    ...result.evidence_sources.slice(0, 3).map((s: string) => `  📎 ${s}`),
  ];

  await replyToLine(replyToken, [{ type: 'text', text: lines.join('\n').slice(0, 5000) }]);
}

// ---- Flex Message Builders ----

function buildTrendBubble(trend: any, index: number): Record<string, unknown> {
  const maturityEmoji = trend.maturity === 'emerging' ? '🌱' : trend.maturity === 'growing' ? '🚀' : '⚠️';
  return {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: `${maturityEmoji} ${trend.topic}`, weight: 'bold', size: 'md', wrap: true }],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm',
      contents: [
        { type: 'text', text: trend.unexplored_angles?.[0] || '', size: 'sm', wrap: true, color: '#666666' },
        { type: 'text', text: `日本角度: ${trend.japan_specific_angle || 'N/A'}`, size: 'xs', wrap: true, color: '#999999' },
      ],
    },
    footer: {
      type: 'box', layout: 'horizontal', spacing: 'sm',
      contents: [
        { type: 'button', style: 'primary', height: 'sm', action: { type: 'postback', label: '投稿する', data: `action=approve_post&topic=${encodeURIComponent(trend.topic)}` } },
      ],
    },
  };
}

function buildPostPreviewBubble(text: string, hookType: string, confidence: number): Record<string, unknown> {
  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical',
      contents: [
        { type: 'text', text: '✍️ 投稿プレビュー', weight: 'bold', size: 'lg' },
        { type: 'text', text: `Hook: ${hookType} | 信頼度: ${(confidence * 100).toFixed(0)}%`, size: 'xs', color: '#999999' },
      ],
    },
    body: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: text, wrap: true, size: 'sm' }],
    },
    footer: {
      type: 'box', layout: 'horizontal', spacing: 'sm',
      contents: [
        { type: 'button', style: 'primary', height: 'sm', action: { type: 'postback', label: '投稿', data: `action=approve_post&platform=x&text=${encodeURIComponent(text.slice(0, 200))}` } },
        { type: 'button', style: 'secondary', height: 'sm', action: { type: 'postback', label: '修正', data: 'action=edit_post' } },
        { type: 'button', style: 'secondary', height: 'sm', action: { type: 'postback', label: '却下', data: 'action=reject_post' } },
      ],
    },
  };
}
