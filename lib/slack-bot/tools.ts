/**
 * Slack Bot ツール定義 (8ツール)
 *
 * LangGraph ReAct エージェントにバインドする LangChain ツール群。
 * 既存モジュール (post-graph, x-api, data-fetchers) を再利用。
 */

import { z } from 'zod'
import { tool } from '@langchain/core/tools'
import { generateXPost } from '@/lib/x-post-generation/post-graph'
import { postTweet } from '@/lib/x-api/client'
import { fetchMediaForPost } from '@/lib/x-api/media'
import {
  fetchArticle,
  researchTopic as researchTopicFn,
  searchBrave,
} from '@/lib/x-post-generation/data-fetchers'
import {
  createPendingAction,
  saveMemory as saveMemoryDb,
  recallMemories,
  getPostAnalytics,
  savePostAnalytics,
  saveLinkedInPostAnalytics,
} from './memory'
import { generateLinkedInPost } from '@/lib/linkedin-post-generation/linkedin-graph'
import { sendMessage, buildApprovalBlocks, uploadFile } from './slack-client'
import type { AgentContext } from './types'

// ============================================================
// ツール生成 (AgentContextをクロージャで注入)
// ============================================================

export function createTools(ctx: AgentContext) {
  // ----------------------------------------------------------
  // 1. generate_x_post: X投稿文生成
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const generateXPostTool = tool(
    async (input) => {
      try {
        if (input.slug) {
          const article = await fetchArticle(input.slug)
          const result = await generateXPost({
            mode: 'article',
            content: article.content,
            title: article.title,
            slug: article.slug,
            tags: article.category_tags ?? undefined,
          })
          return JSON.stringify({
            success: true,
            post: result.finalPost,
            pattern: result.patternUsed,
            candidates: result.allCandidates,
            scores: result.scores,
          })
        }

        if (input.topic) {
          const research = await researchTopicFn(input.topic)
          // 検索結果のURLも含めて渡す（[URL]プレースホルダー防止）
          const sourceUrls = research.searchResults
            .filter((r) => r.url)
            .map((r) => r.url)
          const content = [
            `Topic: ${input.topic}`,
            ...research.searchResults.map(
              (r) =>
                `- ${r.title}: ${r.description}${r.url ? ` (${r.url})` : ''}`,
            ),
            research.urlContent ? `URL Content: ${research.urlContent}` : '',
            sourceUrls.length > 0
              ? `\nSource URLs (投稿に含める場合はこれを使え。[URL]プレースホルダーは絶対に使うな): ${sourceUrls[0]}`
              : '\n※参照URLなし。投稿にURLは含めるな。[URL]プレースホルダーも使うな。',
          ].join('\n')

          const result = await generateXPost({
            mode: input.mode,
            content,
            topic: input.topic,
          })
          return JSON.stringify({
            success: true,
            post: result.finalPost,
            pattern: result.patternUsed,
            candidates: result.allCandidates,
            scores: result.scores,
            sourceUrl: sourceUrls[0] ?? null,
            searchResultUrls: sourceUrls.slice(0, 5),
          })
        }

        return JSON.stringify({
          success: false,
          error: 'Either topic or slug must be provided',
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'generate_x_post',
      description:
        'X (Twitter) 投稿文を生成する。topicを指定するとリサーチモード、slugを指定すると記事モードで生成。3候補を生成しスコアリングでベストを選定。',
      schema: z.object({
        topic: z
          .string()
          .optional()
          .describe('リサーチモード: 調査するトピック'),
        slug: z
          .string()
          .optional()
          .describe('記事モード: ブログ記事のslug'),
        mode: z
          .enum(['article', 'research'])
          .default('research')
          .describe('生成モード'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 2. post_to_x: X投稿実行 (HITL承認)
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const postToXTool = tool(
    async (input) => {
      try {
        // メディア取得 (sourceUrl or topic があれば)
        let mediaIds: string[] | undefined
        let mediaInfo = ''
        if (input.sourceUrl || input.topic || input.searchResultUrls?.length) {
          const media = await fetchMediaForPost({
            sourceUrl: input.sourceUrl ?? '',
            topic: input.topic,
            searchResultUrls: input.searchResultUrls,
          })
          if (media) {
            // Slackにメディアファイルを送信 (ダウンロード用)
            const ext = media.type === 'video' ? 'mp4' : media.mimeType.split('/')[1] ?? 'png'
            try {
              await uploadFile({
                channelId: ctx.slackChannelId,
                buffer: media.buffer,
                filename: `x-post-media.${ext}`,
                title: `X投稿用${media.type === 'video' ? '動画' : '画像'} (${media.source})`,
                threadTs: ctx.slackThreadTs ?? undefined,
                initialComment: `:frame_with_picture: X投稿用の${media.type === 'video' ? '動画' : '画像'}だよ！ダウンロードして手動で添付できるよ`,
              })
              mediaInfo = ` [${media.type === 'video' ? '動画' : '画像'}をSlackに送信済み]`
            } catch (err) {
              console.error('[post_to_x] Slack file upload failed:', err)
            }

            // X API への自動アップロードも試みる (成功すれば自動添付)
            if (media.mediaId) {
              mediaIds = [media.mediaId]
              mediaInfo = ` [${media.type === 'video' ? '動画' : '画像'}自動添付予定]`
              console.log(`[post_to_x] Media auto-attach: ${media.type} (${media.mediaId})`)
            }
          }
        }

        const actionType = input.longForm ? 'post_x_long' : 'post_x'
        const action = await createPendingAction({
          slackChannelId: ctx.slackChannelId,
          slackUserId: ctx.slackUserId,
          slackThreadTs: ctx.slackThreadTs,
          actionType: actionType as 'post_x' | 'post_x_long',
          payload: {
            text: input.text,
            longForm: input.longForm ?? false,
            ...(mediaIds && { mediaIds }),
            ...(input.sourceUrl && { sourceUrl: input.sourceUrl }),
          },
          previewText: input.text,
        })

        const blocks = buildApprovalBlocks({
          title: ':memo: *X Post Preview*',
          previewText: input.text.length > 500
            ? `${input.text.slice(0, 500)}...`
            : input.text,
          actionId: action.id,
          actionType: 'post',
        })

        await sendMessage({
          channel: ctx.slackChannelId,
          text: `X Post Preview: ${input.text.slice(0, 100)}...`,
          threadTs: ctx.slackThreadTs ?? undefined,
          blocks,
        })

        return JSON.stringify({
          success: true,
          message: `Approval request sent.${mediaInfo} Waiting for user confirmation.`,
          actionId: action.id,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'post_to_x',
      description:
        'X (Twitter) に投稿する。投稿前にSlackの承認ボタンで確認を求める（HITL）。承認後に自動投稿される。',
      schema: z.object({
        text: z.string().describe('投稿テキスト'),
        longForm: z
          .boolean()
          .optional()
          .default(false)
          .describe('長文投稿モード（280文字以上）'),
        sourceUrl: z
          .string()
          .optional()
          .describe('メディア取得元の記事URL。画像/動画が自動添付される'),
        topic: z
          .string()
          .optional()
          .describe('動画検索用のトピック。Brave Video Searchで関連動画を探す'),
        searchResultUrls: z
          .array(z.string())
          .optional()
          .describe('検索結果の記事URLリスト。og:imageを順に試して高解像度画像を取得する'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 3. search_articles: 記事検索
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const searchArticlesTool = tool(
    async (input) => {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        const { data, error } = await supabase
          .from('posts')
          .select('title, slug, meta_description, category_tags, created_at')
          .eq('status', 'published')
          .ilike('title', `%${input.query}%`)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          throw new Error(error.message)
        }

        if (!data || data.length === 0) {
          // Fallback to chatgpt_posts
          const { data: oldData, error: oldError } = await supabase
            .from('chatgpt_posts')
            .select('title, slug, meta_description, created_at')
            .eq('status', 'published')
            .ilike('title', `%${input.query}%`)
            .order('created_at', { ascending: false })
            .limit(10)

          if (oldError) throw new Error(oldError.message)
          return JSON.stringify({
            success: true,
            articles: oldData ?? [],
            source: 'chatgpt_posts',
          })
        }

        return JSON.stringify({
          success: true,
          articles: data,
          source: 'posts',
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'search_articles',
      description:
        'ブログ記事をタイトルで検索する。X投稿用の記事を探す時に使用。',
      schema: z.object({
        query: z.string().describe('検索キーワード'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 4. research_topic: Brave Search調査
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const researchTopicTool = tool(
    async (input) => {
      try {
        const result = await researchTopicFn(input.topic, input.url)
        return JSON.stringify({
          success: true,
          topic: result.topic,
          results: result.searchResults,
          urlContent: result.urlContent
            ? result.urlContent.slice(0, 1000)
            : null,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'research_topic',
      description:
        'Brave Searchでトピックを調査し、最新情報を収集する。',
      schema: z.object({
        topic: z.string().describe('調査するトピック'),
        url: z.string().optional().describe('追加で取得するURL'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 5. trigger_blog_gen: ブログ記事生成トリガー (HITL)
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const triggerBlogGenTool = tool(
    async (input) => {
      try {
        const action = await createPendingAction({
          slackChannelId: ctx.slackChannelId,
          slackUserId: ctx.slackUserId,
          slackThreadTs: ctx.slackThreadTs,
          actionType: 'trigger_blog',
          payload: { title: input.title, outline: input.outline },
          previewText: `Title: ${input.title}\nOutline: ${input.outline}`,
        })

        const blocks = buildApprovalBlocks({
          title: ':notebook: *Blog Generation Request*',
          previewText: `*Title:* ${input.title}\n*Outline:*\n${input.outline}`,
          actionId: action.id,
          actionType: 'blog',
        })

        await sendMessage({
          channel: ctx.slackChannelId,
          text: `Blog generation request: ${input.title}`,
          threadTs: ctx.slackThreadTs ?? undefined,
          blocks,
        })

        return JSON.stringify({
          success: true,
          message: 'Blog generation approval request sent.',
          actionId: action.id,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'trigger_blog_gen',
      description:
        'ブログ記事の生成をトリガーする。承認後にGitHub Actionsでワークフローを起動。',
      schema: z.object({
        title: z.string().describe('記事タイトル'),
        outline: z.string().describe('記事のアウトライン'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 6. recall_memory: 記憶検索
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const recallMemoryTool = tool(
    async (input) => {
      try {
        const memories = await recallMemories({
          slackUserId: ctx.slackUserId,
          query: input.query,
          limit: 10,
        })

        return JSON.stringify({
          success: true,
          memories: memories.map((m) => ({
            type: m.memory_type,
            content: m.content,
            importance: m.importance,
            createdAt: m.created_at,
          })),
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'recall_memory',
      description:
        'ユーザーの好み、フィードバック、学習内容などの記憶を検索する。',
      schema: z.object({
        query: z.string().describe('検索キーワード'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 7. save_memory: 学習内容保存
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const saveMemoryTool = tool(
    async (input) => {
      try {
        const memory = await saveMemoryDb({
          slackUserId: ctx.slackUserId,
          memoryType: input.type,
          content: input.content,
          importance: input.importance,
        })

        return JSON.stringify({
          success: true,
          memoryId: memory.id,
          message: `Memory saved: ${input.content.slice(0, 50)}...`,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'save_memory',
      description:
        'ユーザーの好みや学習内容を記憶として保存する。重要な情報は importance を高く設定。',
      schema: z.object({
        content: z.string().describe('記憶する内容'),
        type: z
          .enum(['preference', 'feedback', 'fact', 'style', 'timing'])
          .describe('記憶の種類'),
        importance: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .default(0.5)
          .describe('重要度 (0-1)'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 8. fetch_x_analytics: X投稿パフォーマンス取得
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const fetchXAnalyticsTool = tool(
    async (input) => {
      try {
        const analytics = await getPostAnalytics({
          days: input.days,
          limit: 20,
        })

        if (analytics.length === 0) {
          return JSON.stringify({
            success: true,
            message: 'No analytics data found for the specified period.',
            analytics: [],
          })
        }

        const totalImpressions = analytics.reduce(
          (sum, a) => sum + a.impressions,
          0,
        )
        const totalEngagement = analytics.reduce(
          (sum, a) => sum + a.likes + a.retweets + a.replies,
          0,
        )
        const bestPost = [...analytics].sort(
          (a, b) => b.engagement_rate - a.engagement_rate,
        )[0]

        return JSON.stringify({
          success: true,
          summary: {
            postCount: analytics.length,
            totalImpressions,
            totalEngagement,
            avgEngagementRate:
              analytics.reduce((sum, a) => sum + a.engagement_rate, 0) /
              analytics.length,
          },
          bestPost: bestPost
            ? {
                text: bestPost.post_text.slice(0, 100),
                likes: bestPost.likes,
                retweets: bestPost.retweets,
                engagementRate: bestPost.engagement_rate,
              }
            : null,
          posts: analytics.map((a) => ({
            text: a.post_text.slice(0, 80),
            likes: a.likes,
            retweets: a.retweets,
            impressions: a.impressions,
            engagementRate: a.engagement_rate,
            postedAt: a.posted_at,
          })),
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'fetch_x_analytics',
      description:
        'X投稿のパフォーマンスデータ（いいね、RT、インプレッション等）を取得する。',
      schema: z.object({
        days: z
          .number()
          .optional()
          .default(7)
          .describe('取得期間（日数）'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 9. generate_linkedin_post: LinkedIn投稿文生成
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const generateLinkedInPostTool = tool(
    async (input) => {
      try {
        const result = await generateLinkedInPost({
          sourceData: input.sourceData,
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          sourceAuthor: input.sourceAuthor,
          japanAngle: input.japanAngle,
        })
        return JSON.stringify({
          success: true,
          post: result.finalPost,
          pattern: result.patternUsed,
          candidates: result.allCandidates,
          scores: result.scores,
          tags: result.tags,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'generate_linkedin_post',
      description:
        'LinkedIn バズ投稿文を生成する。海外事例（Reddit/HN/GitHub）を元に、日本市場の視点を加えた1000-1500文字の投稿を3候補生成しスコアリング。',
      schema: z.object({
        sourceData: z
          .string()
          .describe('元ソースの内容（記事テキスト、Reddit投稿文など）'),
        sourceType: z
          .enum(['practitioner_experience', 'new_release', 'trend_analysis', 'official_announcement'])
          .describe('ソースタイプ'),
        sourceUrl: z.string().describe('元ソースのURL'),
        sourceAuthor: z
          .string()
          .optional()
          .describe('元ソースの著者名'),
        japanAngle: z
          .string()
          .optional()
          .describe('日本市場への切り口ヒント'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 10. post_to_linkedin: LinkedIn投稿実行 (HITL承認)
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const postToLinkedInTool = tool(
    async (input) => {
      try {
        const action = await createPendingAction({
          slackChannelId: ctx.slackChannelId,
          slackUserId: ctx.slackUserId,
          slackThreadTs: ctx.slackThreadTs,
          actionType: 'post_linkedin',
          payload: {
            text: input.text,
            sourceType: input.sourceType ?? null,
            sourceUrl: input.sourceUrl ?? null,
            patternUsed: input.patternUsed ?? null,
            tags: input.tags ?? [],
          },
          previewText: input.text,
        })

        const blocks = buildApprovalBlocks({
          title: ':briefcase: *LinkedIn Post Preview*',
          previewText: input.text.length > 800
            ? `${input.text.slice(0, 800)}...`
            : input.text,
          actionId: action.id,
          actionType: 'linkedin',
        })

        await sendMessage({
          channel: ctx.slackChannelId,
          text: `LinkedIn Post Preview: ${input.text.slice(0, 100)}...`,
          threadTs: ctx.slackThreadTs ?? undefined,
          blocks,
        })

        return JSON.stringify({
          success: true,
          message: 'LinkedIn approval request sent. Waiting for user confirmation.',
          actionId: action.id,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'post_to_linkedin',
      description:
        'LinkedIn に投稿する。投稿前にSlackの承認ボタンで確認を求める（HITL）。承認後に自動投稿される。',
      schema: z.object({
        text: z.string().describe('投稿テキスト（1000-1500文字推奨）'),
        sourceType: z
          .string()
          .optional()
          .describe('ソースタイプ'),
        sourceUrl: z
          .string()
          .optional()
          .describe('元ソースURL'),
        patternUsed: z
          .string()
          .optional()
          .describe('使用テンプレートID'),
        tags: z
          .array(z.string())
          .optional()
          .describe('ハッシュタグ配列'),
      }),
    },
  )

  return [
    generateXPostTool,
    postToXTool,
    searchArticlesTool,
    researchTopicTool,
    triggerBlogGenTool,
    recallMemoryTool,
    saveMemoryTool,
    fetchXAnalyticsTool,
    generateLinkedInPostTool,
    postToLinkedInTool,
  ]
}
