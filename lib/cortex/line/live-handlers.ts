/**
 * LINE Live Handlers
 *
 * Connects LINE commands to real data (Supabase) and actual SNS posting.
 * Three main flows:
 *   1. handleLiveBuzz   - Fetch top buzz posts, display as Flex Carousel
 *   2. handleLiveGenerate - AI-generate a post for a platform, show preview
 *   3. handleLiveExecute  - Post to the platform, log analytics, notify
 */

import { getSupabase } from '../discord/context-builder'
import { pushToLine } from './webhook-handler'
import { forwardToDiscord } from './discord-bridge'

// ============================================================
// Types
// ============================================================

interface BuzzPost {
  readonly post_text: string
  readonly author_handle: string
  readonly likes: number
  readonly reposts: number
  readonly replies: number
  readonly buzz_score: number
  readonly platform: string
}

interface ViralAnalysis {
  readonly primary_buzz_factor: string | null
  readonly emotional_trigger: string | null
  readonly replicability_score: number | null
}

interface PendingPost {
  readonly id: string
  readonly line_user_id: string
  readonly platform: string
  readonly post_text: string
  readonly pattern_used: string | null
  readonly scores: Record<string, unknown> | null
  readonly status: string
  readonly source_buzz_content: string | null
}

// ============================================================
// 1. handleLiveBuzz
// ============================================================

export async function handleLiveBuzz(lineUserId: string): Promise<void> {
  try {
    const supabase = getSupabase()

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: buzzPosts, error: buzzError } = await supabase
      .from('buzz_posts')
      .select('post_text, author_handle, likes, reposts, replies, buzz_score, platform')
      .gte('created_at', since24h)
      .order('buzz_score', { ascending: false })
      .limit(5)

    if (buzzError) {
      console.error('[live-handlers] buzz_posts query error:', buzzError)
      await pushToLine(lineUserId, [{ type: 'text', text: 'バズ投稿の取得に失敗しました' }])
      return
    }

    if (!buzzPosts || buzzPosts.length === 0) {
      await pushToLine(lineUserId, [{ type: 'text', text: '直近24時間のバズ投稿はありません' }])
      return
    }

    const typedPosts = buzzPosts as BuzzPost[]

    // Fetch viral analysis for context (last 7 days)
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: viralData } = await supabase
      .from('cortex_viral_analysis')
      .select('primary_buzz_factor, emotional_trigger, replicability_score')
      .gte('analyzed_at', since7d)
      .limit(20)

    const viralMap = new Map<string, ViralAnalysis>()
    if (viralData) {
      for (const v of viralData as ViralAnalysis[]) {
        if (v.primary_buzz_factor) {
          viralMap.set(v.primary_buzz_factor, v)
        }
      }
    }

    // Build Flex Carousel bubbles
    const bubbles = typedPosts.map((post, idx) => {
      const preview = post.post_text.length > 80
        ? post.post_text.slice(0, 80) + '...'
        : post.post_text

      const buzzFactor = viralMap.values().next().value?.primary_buzz_factor ?? '-'

      return {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `@${post.author_handle}`,
              size: 'sm',
              color: '#1DA1F2',
              weight: 'bold',
            },
          ],
          paddingBottom: '0px',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: preview,
              size: 'sm',
              wrap: true,
              maxLines: 4,
            },
            {
              type: 'separator',
              margin: 'md',
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: `${post.likes} likes`, size: 'xs', color: '#999999', flex: 1 },
                { type: 'text', text: `${post.reposts} RT`, size: 'xs', color: '#999999', flex: 1 },
                { type: 'text', text: `${post.replies} replies`, size: 'xs', color: '#999999', flex: 1 },
              ],
              margin: 'md',
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: `Buzz: ${post.buzz_score}`, size: 'xs', weight: 'bold', color: '#FF6B6B', flex: 1 },
                { type: 'text', text: buzzFactor, size: 'xs', color: '#666666', flex: 1 },
              ],
              margin: 'sm',
            },
          ],
          spacing: 'sm',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'postback',
                label: 'Xに投稿',
                data: `action=generate&platform=x&buzz_idx=${idx}`,
              },
              style: 'primary',
              height: 'sm',
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: 'LinkedInに投稿',
                data: `action=generate&platform=linkedin&buzz_idx=${idx}`,
              },
              height: 'sm',
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: 'Threadsに投稿',
                data: `action=generate&platform=threads&buzz_idx=${idx}`,
              },
              height: 'sm',
            },
          ],
          spacing: 'sm',
        },
      }
    })

    const carousel = {
      type: 'carousel',
      contents: bubbles,
    }

    await pushToLine(lineUserId, [{
      type: 'flex',
      altText: 'バズ速報',
      contents: carousel,
    }])
  } catch (err) {
    console.error('[live-handlers] handleLiveBuzz error:', err)
    await pushToLine(lineUserId, [{ type: 'text', text: 'バズ速報の取得中にエラーが発生しました' }]).catch(() => {})
  }
}

// ============================================================
// 2. handleLiveGenerate
// ============================================================

export async function handleLiveGenerate(
  lineUserId: string,
  platform: string,
  buzzContent: string,
): Promise<void> {
  try {
    // Immediate feedback
    await pushToLine(lineUserId, [{ type: 'text', text: '✍️ AI投稿生成中... (10-15秒)' }])

    let finalPost: string
    let patternUsed: string
    let scores: Record<string, unknown> | null = null

    const topic = buzzContent.slice(0, 50)

    if (platform === 'x') {
      const { generateXPost } = await import('../../x-post-generation/post-graph')
      const result = await generateXPost({
        mode: 'research',
        content: buzzContent,
        topic,
      })
      finalPost = result.finalPost
      patternUsed = result.patternUsed
      scores = result.scores.length > 0
        ? { topScore: result.scores[0] }
        : null
    } else if (platform === 'linkedin') {
      const { generateLinkedInPost } = await import('../../linkedin-post-generation/linkedin-graph')
      const result = await generateLinkedInPost({
        sourceData: buzzContent,
        sourceType: 'trend_analysis',
        sourceUrl: '',
      })
      finalPost = result.finalPost
      patternUsed = result.patternUsed
      scores = result.scores.length > 0
        ? { topScore: result.scores[0] }
        : null
    } else if (platform === 'threads') {
      const { generateThreadsPost } = await import('../../threads-post-generation/threads-graph')
      const result = await generateThreadsPost({
        content: buzzContent,
      })
      finalPost = result.finalPost
      patternUsed = result.patternUsed
      scores = result.scores && result.scores.length > 0
        ? { topScore: result.scores[0] }
        : null
    } else {
      await pushToLine(lineUserId, [{ type: 'text', text: `未対応のプラットフォーム: ${platform}` }])
      return
    }

    // Store as pending post
    const supabase = getSupabase()

    // Truncate buzz content for storage (avoid oversized rows)
    const sourceBuzzContent = buzzContent.slice(0, 2000)

    const { data: inserted, error: insertError } = await supabase
      .from('cortex_pending_posts')
      .insert({
        line_user_id: lineUserId,
        platform,
        post_text: finalPost,
        pattern_used: patternUsed,
        scores,
        status: 'pending',
        source_buzz_content: sourceBuzzContent,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('[live-handlers] Failed to insert pending post:', insertError)
      await pushToLine(lineUserId, [{ type: 'text', text: '投稿の保存に失敗しました' }])
      return
    }

    const pendingId = inserted.id as string
    const topScoreValue = scores ? JSON.stringify(scores).slice(0, 50) : '-'

    // Build preview Flex bubble
    const previewFlex = {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: 'AI生成プレビュー',
            weight: 'bold',
            size: 'lg',
            flex: 4,
          },
          {
            type: 'text',
            text: platform.toUpperCase(),
            size: 'sm',
            color: '#FFFFFF',
            align: 'center',
            gravity: 'center',
            flex: 2,
            backgroundColor: platform === 'x' ? '#1DA1F2' : platform === 'linkedin' ? '#0077B5' : '#000000',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: finalPost.length > 500 ? finalPost.slice(0, 500) + '...' : finalPost,
            size: 'sm',
            wrap: true,
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: `Pattern: ${patternUsed}`,
                size: 'xs',
                color: '#999999',
              },
              {
                type: 'text',
                text: `Score: ${topScoreValue}`,
                size: 'xs',
                color: '#999999',
              },
            ],
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '投稿\uD83D\uDE80',
              data: `action=execute&pending_id=${pendingId}`,
            },
            style: 'primary',
            height: 'sm',
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '再生成\uD83D\uDD04',
              data: `action=regenerate&pending_id=${pendingId}`,
            },
            height: 'sm',
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '却下',
              data: `action=reject&pending_id=${pendingId}`,
            },
            height: 'sm',
            color: '#999999',
          },
        ],
        spacing: 'sm',
      },
    }

    await pushToLine(lineUserId, [{
      type: 'flex',
      altText: `AI生成プレビュー (${platform})`,
      contents: previewFlex,
    }])
  } catch (err) {
    console.error('[live-handlers] handleLiveGenerate error:', err)
    await pushToLine(lineUserId, [{ type: 'text', text: '投稿の生成中にエラーが発生しました' }]).catch(() => {})
  }
}

// ============================================================
// 3. handleLiveExecute
// ============================================================

export async function handleLiveExecute(
  lineUserId: string,
  pendingId: string,
): Promise<void> {
  try {
    const supabase = getSupabase()

    // Fetch pending post
    const { data: pending, error: fetchError } = await supabase
      .from('cortex_pending_posts')
      .select('id, line_user_id, platform, post_text, pattern_used, scores, status, source_buzz_content')
      .eq('id', pendingId)
      .single()

    if (fetchError || !pending) {
      console.error('[live-handlers] Pending post not found:', fetchError)
      await pushToLine(lineUserId, [{ type: 'text', text: '投稿データが見つかりません' }])
      return
    }

    const typedPending = pending as PendingPost

    if (typedPending.status !== 'pending') {
      await pushToLine(lineUserId, [{
        type: 'text',
        text: `この投稿は既に処理済みです (status: ${typedPending.status})`,
      }])
      return
    }

    const { platform } = typedPending
    let postSuccess = false
    let postUrl: string | undefined
    let postId: string | undefined

    if (platform === 'x') {
      const { postTweet } = await import('../../x-api/client')
      const result = await postTweet(typedPending.post_text, { longForm: true })
      postSuccess = result.success
      postUrl = result.tweetUrl
      postId = result.tweetId
      if (!result.success) {
        console.error('[live-handlers] X post failed:', result.error)
      }
    } else if (platform === 'linkedin') {
      const { postToLinkedIn } = await import('../../linkedin-api/client')
      const result = await postToLinkedIn({ text: typedPending.post_text })
      postSuccess = result.success
      postUrl = result.postUrl
      postId = result.postId
      if (!result.success) {
        console.error('[live-handlers] LinkedIn post failed:', result.error)
      }
    } else if (platform === 'threads') {
      const { postToThreads } = await import('../../threads-api/client')
      const result = await postToThreads({ text: typedPending.post_text })
      postSuccess = result.success
      postUrl = result.permalinkUrl
      postId = result.mediaId
      if (!result.success) {
        console.error('[live-handlers] Threads post failed:', result.error)
      }
    } else {
      await pushToLine(lineUserId, [{ type: 'text', text: `未対応のプラットフォーム: ${platform}` }])
      return
    }

    if (postSuccess) {
      // Update pending post status
      await supabase
        .from('cortex_pending_posts')
        .update({
          status: 'posted',
          post_id: postId ?? null,
          post_url: postUrl ?? null,
          posted_at: new Date().toISOString(),
        })
        .eq('id', pendingId)

      // Insert analytics record
      const analyticsTable = platform === 'x'
        ? 'x_post_analytics'
        : platform === 'linkedin'
          ? 'linkedin_post_analytics'
          : 'threads_post_analytics'

      await supabase
        .from(analyticsTable)
        .insert({
          post_text: typedPending.post_text,
          pattern_used: typedPending.pattern_used,
          posted_at: new Date().toISOString(),
          post_id: postId ?? null,
          post_url: postUrl ?? null,
        })
        .catch((err: unknown) => {
          console.error(`[live-handlers] Failed to insert ${analyticsTable}:`, err)
        })

      // Forward to Discord
      await forwardToDiscord({
        userId: lineUserId,
        requestType: 'post_executed',
        content: `Posted to ${platform}: ${typedPending.post_text.slice(0, 100)}... URL: ${postUrl ?? 'N/A'}`,
      }).catch((err: unknown) => {
        console.error('[live-handlers] forwardToDiscord error:', err)
      })

      // Confirmation Flex
      const confirmFlex = {
        type: 'bubble',
        size: 'kilo',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '✅ 投稿完了!',
              weight: 'bold',
              size: 'xl',
              color: '#27AE60',
            },
            {
              type: 'text',
              text: platform.toUpperCase(),
              size: 'sm',
              color: '#666666',
              margin: 'sm',
            },
            ...(postUrl
              ? [{
                  type: 'button' as const,
                  action: {
                    type: 'uri' as const,
                    label: '投稿を見る',
                    uri: postUrl,
                  },
                  style: 'link' as const,
                  margin: 'lg' as const,
                }]
              : []),
            {
              type: 'text',
              text: '2時間後にエンゲージメント結果をお知らせします',
              size: 'xs',
              color: '#999999',
              wrap: true,
              margin: 'lg',
            },
          ],
        },
      }

      await pushToLine(lineUserId, [{
        type: 'flex',
        altText: '✅ 投稿完了!',
        contents: confirmFlex,
      }])
    } else {
      // Post failed
      await supabase
        .from('cortex_pending_posts')
        .update({ status: 'failed' })
        .eq('id', pendingId)

      await pushToLine(lineUserId, [{
        type: 'text',
        text: `❌ ${platform.toUpperCase()}への投稿に失敗しました。しばらく後に再試行してください。`,
      }])
    }
  } catch (err) {
    console.error('[live-handlers] handleLiveExecute error:', err)
    await pushToLine(lineUserId, [{ type: 'text', text: '投稿の実行中にエラーが発生しました' }]).catch(() => {})
  }
}
