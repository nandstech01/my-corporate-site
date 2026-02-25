/**
 * Proactive Discussion Runner
 *
 * 他人の会話に価値ある返信で参加する。
 * 1日最大15件、同一著者1日3回・週7回まで。
 */

import { createClient } from '@supabase/supabase-js'
import { findRelevantDiscussions } from './discussion-finder'
import { generateProactiveReply } from './proactive-reply-graph'
import { replyToTweet } from '../x-api/client'
import { autoResolvePost } from '../ai-judge/auto-resolver'
import { isAiJudgeEnabled } from '../ai-judge/config'
import { closePlaywright } from '../x-playwright'

// ============================================================
// Constants
// ============================================================

const MAX_DAILY_PROACTIVE_REPLIES = 15
const MAX_REPLIES_PER_AUTHOR_PER_DAY = 3
const MAX_REPLIES_PER_AUTHOR_PER_WEEK = 7

// ============================================================
// Supabase
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return createClient(url, key)
}

// ============================================================
// Daily limit helpers
// ============================================================

async function getTodayProactiveReplyCount(): Promise<number> {
  const supabase = getSupabase()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('x_conversation_threads')
    .select('id', { count: 'exact', head: true })
    .eq('reply_type', 'proactive_discussion')
    .gte('posted_at', todayStart.toISOString())

  return count ?? 0
}

async function getAuthorReplyCountToday(authorUsername: string): Promise<number> {
  const supabase = getSupabase()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('x_conversation_threads')
    .select('id', { count: 'exact', head: true })
    .eq('reply_type', 'proactive_discussion')
    .eq('root_author_username', authorUsername)
    .gte('posted_at', todayStart.toISOString())

  return count ?? 0
}

async function getAuthorReplyCountThisWeek(authorUsername: string): Promise<number> {
  const supabase = getSupabase()
  const weekAgo = new Date()
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)

  const { count } = await supabase
    .from('x_conversation_threads')
    .select('id', { count: 'exact', head: true })
    .eq('reply_type', 'proactive_discussion')
    .eq('root_author_username', authorUsername)
    .gte('posted_at', weekAgo.toISOString())

  return count ?? 0
}

// ============================================================
// Main entry point
// ============================================================

export async function runProactiveDiscussion(): Promise<void> {
  process.stdout.write('Proactive Discussion: Starting\n')

  // 1. Check daily limit
  const todayCount = await getTodayProactiveReplyCount()
  if (todayCount >= MAX_DAILY_PROACTIVE_REPLIES) {
    process.stdout.write(`Proactive Discussion: Daily limit reached (${todayCount}/${MAX_DAILY_PROACTIVE_REPLIES})\n`)
    await closePlaywright()
    return
  }

  const remaining = MAX_DAILY_PROACTIVE_REPLIES - todayCount

  // 2. Find relevant discussions
  const candidates = await findRelevantDiscussions()
  process.stdout.write(`Proactive Discussion: Found ${candidates.length} candidates\n`)

  if (candidates.length === 0) {
    process.stdout.write('Proactive Discussion: No relevant discussions found\n')
    await closePlaywright()
    return
  }

  // 3. Track authors we've replied to in this run (count, not just presence)
  const repliedAuthorsThisRun = new Map<string, number>()
  let repliesPosted = 0

  for (const candidate of candidates) {
    if (repliesPosted >= remaining) break

    const inMemoryCount = repliedAuthorsThisRun.get(candidate.authorUsername) ?? 0

    // Author limit check (DB for previous runs today + in-memory for this run)
    const authorCount = await getAuthorReplyCountToday(candidate.authorUsername)
    if (authorCount + inMemoryCount >= MAX_REPLIES_PER_AUTHOR_PER_DAY) {
      process.stdout.write(`Proactive Discussion: Skipping ${candidate.authorUsername} (daily author limit: ${authorCount + inMemoryCount}/${MAX_REPLIES_PER_AUTHOR_PER_DAY})\n`)
      continue
    }

    const authorWeeklyCount = await getAuthorReplyCountThisWeek(candidate.authorUsername)
    if (authorWeeklyCount + inMemoryCount >= MAX_REPLIES_PER_AUTHOR_PER_WEEK) {
      process.stdout.write(`Proactive Discussion: Skipping ${candidate.authorUsername} (weekly author limit: ${authorWeeklyCount + inMemoryCount}/${MAX_REPLIES_PER_AUTHOR_PER_WEEK})\n`)
      continue
    }

    try {
      // 4. Generate proactive reply via LangGraph pipeline
      const result = await generateProactiveReply({
        tweetText: candidate.tweetText,
        authorUsername: candidate.authorUsername,
        topicMatch: candidate.topicMatch,
      })

      if (!result || !result.finalReply) {
        process.stdout.write(`Proactive Discussion: Pipeline decided not to engage with ${candidate.tweetId}\n`)
        continue
      }

      // 5. Final AI Judge gate (if enabled)
      if (isAiJudgeEnabled()) {
        const judgeResult = await autoResolvePost({
          platform: 'x',
          text: result.finalReply,
        })
        if (!judgeResult.success) {
          process.stdout.write(`Proactive Discussion: AI Judge rejected reply to ${candidate.tweetId}: ${judgeResult.verdict.reasoning}\n`)
          continue
        }
      }

      // 6. Post the reply
      const replyResult = await replyToTweet(result.finalReply, candidate.tweetId)

      if (replyResult.success && replyResult.tweetId) {
        // 7. Record in DB
        const supabase = getSupabase()
        await supabase.from('x_conversation_threads').insert({
          root_tweet_id: candidate.tweetId,
          root_tweet_text: candidate.tweetText,
          root_author_username: candidate.authorUsername,
          root_posted_at: new Date().toISOString(),
          reply_tweet_id: replyResult.tweetId,
          reply_text: result.finalReply,
          reply_type: 'proactive_discussion',
          depth_level: 1,
          posted_at: new Date().toISOString(),
          strategy_used: 'proactive',
          pipeline_scores: result.score,
        })

        repliedAuthorsThisRun.set(candidate.authorUsername, inMemoryCount + 1)
        repliesPosted++

        process.stdout.write(
          `Proactive Discussion: Replied to @${candidate.authorUsername}'s tweet ${candidate.tweetId} (${repliesPosted}/${remaining})\n`,
        )
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`Proactive Discussion: Error processing ${candidate.tweetId}: ${msg}\n`)
    }
  }

  await closePlaywright()
  process.stdout.write(`Proactive Discussion: Complete. ${repliesPosted} proactive replies posted\n`)
}
