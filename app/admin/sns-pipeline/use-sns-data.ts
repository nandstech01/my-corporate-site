'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import type {
  XPostAnalytics,
  LinkedInPostAnalytics,
  InstagramPostAnalytics,
  InstagramStoryQueue,
  BlogTopicQueue,
  SlackPendingAction,
  SnsData,
} from './types'

const THIRTY_DAYS_AGO = () => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString()
}

export function useSnsData(enabled = true): SnsData & { refetch: () => void } {
  const [xPosts, setXPosts] = useState<readonly XPostAnalytics[]>([])
  const [linkedinPosts, setLinkedinPosts] = useState<readonly LinkedInPostAnalytics[]>([])
  const [instagramPosts, setInstagramPosts] = useState<readonly InstagramPostAnalytics[]>([])
  const [storyQueue, setStoryQueue] = useState<readonly InstagramStoryQueue[]>([])
  const [blogTopics, setBlogTopics] = useState<readonly BlogTopicQueue[]>([])
  const [pendingActions, setPendingActions] = useState<readonly SlackPendingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const since = THIRTY_DAYS_AGO()

      const [
        xResult,
        linkedinResult,
        instagramResult,
        storyResult,
        blogResult,
        pendingResult,
      ] = await Promise.all([
        supabase
          .from('x_post_analytics')
          .select('id,tweet_id,tweet_url,post_text,post_mode,pattern_used,posted_at,likes,retweets,replies,impressions,engagement_rate,tags')
          .gte('posted_at', since)
          .order('posted_at', { ascending: false })
          .limit(100),

        supabase
          .from('linkedin_post_analytics')
          .select('id,linkedin_post_id,post_url,post_text,source_type,pattern_used,posted_at,likes,comments,reposts,impressions,tags,ml_prediction,ml_confidence')
          .gte('posted_at', since)
          .order('posted_at', { ascending: false })
          .limit(100),

        supabase
          .from('instagram_post_analytics')
          .select('id,instagram_media_id,media_type,post_url,caption,blog_slug,posted_at,reach,impressions,taps_forward,taps_back,exits,replies,likes,comments,saves,shares,engagement_rate,hashtags')
          .gte('posted_at', since)
          .order('posted_at', { ascending: false })
          .limit(100),

        supabase
          .from('instagram_story_queue')
          .select('id,blog_slug,blog_title,caption,status,score,created_at,approved_at,posted_at')
          .gte('created_at', since)
          .order('created_at', { ascending: false }),

        supabase
          .from('blog_topic_queue')
          .select('id,source_feed,source_url,source_title,source_published_at,suggested_topic,suggested_keyword,buzz_score,buzz_breakdown,status,created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: false }),

        supabase
          .from('slack_pending_actions')
          .select('id,action_type,preview_text,status,created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ])

      const errors = [
        xResult.error,
        linkedinResult.error,
        instagramResult.error,
        storyResult.error,
        blogResult.error,
        pendingResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        const msgs = errors.map(e => e?.message).join(', ')
        setError(`Some queries failed: ${msgs}`)
      }

      setXPosts((xResult.data ?? []) as XPostAnalytics[])
      setLinkedinPosts((linkedinResult.data ?? []) as LinkedInPostAnalytics[])
      setInstagramPosts((instagramResult.data ?? []) as InstagramPostAnalytics[])
      setStoryQueue((storyResult.data ?? []) as InstagramStoryQueue[])
      setBlogTopics((blogResult.data ?? []) as BlogTopicQueue[])
      setPendingActions((pendingResult.data ?? []) as SlackPendingAction[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SNS data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchAll()
    }
  }, [fetchAll, enabled])

  return {
    xPosts,
    linkedinPosts,
    instagramPosts,
    storyQueue,
    blogTopics,
    pendingActions,
    loading,
    error,
    refetch: fetchAll,
  }
}

export function computeEngagementRate(
  posts: readonly { likes: number; impressions: number; retweets?: number; replies?: number; comments?: number; reposts?: number; shares?: number; saves?: number }[]
): number {
  const withImpressions = posts.filter(p => p.impressions > 0)
  if (withImpressions.length === 0) return 0

  const totalEngagements = withImpressions.reduce((sum, p) => {
    const engagements =
      (p.likes ?? 0) +
      (p.retweets ?? 0) +
      (p.replies ?? 0) +
      (p.comments ?? 0) +
      (p.reposts ?? 0) +
      (p.shares ?? 0) +
      (p.saves ?? 0)
    return sum + engagements
  }, 0)

  const totalImpressions = withImpressions.reduce((sum, p) => sum + p.impressions, 0)
  return totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0
}

export function groupByDay(
  posts: readonly { posted_at: string; likes: number; impressions: number }[]
): { date: string; engagements: number }[] {
  const groups: Record<string, number> = {}

  for (const post of posts) {
    const day = post.posted_at.slice(0, 10)
    const eng = (post.likes ?? 0) + (post.impressions ?? 0)
    groups[day] = (groups[day] ?? 0) + eng
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, engagements]) => ({ date, engagements }))
}
