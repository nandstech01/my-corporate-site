'use client'

import { motion } from 'framer-motion'
import EngagementMiniChart from './EngagementMiniChart'
import type {
  XPostAnalytics,
  LinkedInPostAnalytics,
  InstagramPostAnalytics,
  InstagramStoryQueue,
  BlogTopicQueue,
  SlackPendingAction,
} from '../types'

interface PlatformDetailCardsProps {
  readonly xPosts: readonly XPostAnalytics[]
  readonly linkedinPosts: readonly LinkedInPostAnalytics[]
  readonly instagramPosts: readonly InstagramPostAnalytics[]
  readonly storyQueue: readonly InstagramStoryQueue[]
  readonly blogTopics: readonly BlogTopicQueue[]
  readonly pendingActions: readonly SlackPendingAction[]
}

const COLORS = {
  cardBg: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
  x: '#FFFFFF',
  linkedin: '#0077B5',
  instagram: '#E1306C',
  blogRss: '#F97316',
} as const

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)

  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return `${Math.floor(diffSec / 604800)}w ago`
}

function groupPostsByDay(
  posts: readonly { posted_at: string; likes: number; impressions: number }[]
): { date: string; value: number }[] {
  const groups: Record<string, number> = {}

  for (const post of posts) {
    const day = post.posted_at.slice(0, 10)
    const engagement = (post.likes ?? 0) + (post.impressions ?? 0)
    groups[day] = (groups[day] ?? 0) + engagement
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

const cardAnimation = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease: 'easeOut' },
}

function PendingBadge({ count }: { readonly count: number }) {
  if (count === 0) return null
  return (
    <span
      style={{ backgroundColor: '#F97316' }}
      className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white"
    >
      {count} pending
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  X Card                                                            */
/* ------------------------------------------------------------------ */
function XCard({
  posts,
  pendingCount,
}: {
  readonly posts: readonly XPostAnalytics[]
  readonly pendingCount: number
}) {
  const recent = posts.slice(0, 5)
  const topPost = [...posts].sort(
    (a, b) => b.engagement_rate - a.engagement_rate
  )[0]
  const chartData = groupPostsByDay(posts)

  return (
    <motion.div
      id="platform-x"
      {...cardAnimation}
      style={{
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border,
        borderTopColor: COLORS.x,
        borderTopWidth: 3,
      }}
      className="rounded-xl border p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={COLORS.x}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <h3 style={{ color: COLORS.text }} className="text-lg font-bold">
          X (Twitter)
        </h3>
        <PendingBadge count={pendingCount} />
      </div>

      {/* Recent posts */}
      <div
        style={{ backgroundColor: COLORS.cardInner }}
        className="mb-4 rounded-lg p-3"
      >
        <p
          style={{ color: COLORS.textMuted }}
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
        >
          Recent Posts
        </p>
        <ul className="space-y-2">
          {recent.map((post) => (
            <li key={post.id} className="flex items-center justify-between">
              <span
                style={{ color: COLORS.text }}
                className="line-clamp-1 flex-1 text-sm"
              >
                {post.post_text}
              </span>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                {post.post_mode && (
                  <span
                    style={{
                      backgroundColor: COLORS.border,
                      color: COLORS.textMuted,
                    }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    {post.post_mode}
                  </span>
                )}
                <span
                  style={{ color: COLORS.textDim }}
                  className="text-xs whitespace-nowrap"
                >
                  {post.engagement_rate.toFixed(1)}% ER
                </span>
                <span
                  style={{ color: COLORS.textDim }}
                  className="text-xs whitespace-nowrap"
                >
                  {formatRelativeTime(post.posted_at)}
                </span>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li style={{ color: COLORS.textDim }} className="text-sm">
              No posts yet
            </li>
          )}
        </ul>
      </div>

      {/* Engagement chart */}
      <div className="mb-4">
        <EngagementMiniChart data={chartData} color={COLORS.x} />
      </div>

      {/* Top performer */}
      {topPost && (
        <div
          style={{ backgroundColor: COLORS.cardInner }}
          className="rounded-lg p-3"
        >
          <p
            style={{ color: COLORS.textMuted }}
            className="mb-1 text-xs font-semibold"
          >
            Top Performer
          </p>
          <p style={{ color: COLORS.text }} className="line-clamp-1 text-sm">
            <span className="mr-1">&#127942;</span>
            {topPost.post_text}
          </p>
          <p style={{ color: COLORS.textDim }} className="mt-1 text-xs">
            {topPost.engagement_rate.toFixed(2)}% engagement &middot;{' '}
            {topPost.impressions.toLocaleString()} impressions
          </p>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  LinkedIn Card                                                     */
/* ------------------------------------------------------------------ */
function LinkedInCard({
  posts,
  pendingCount,
}: {
  readonly posts: readonly LinkedInPostAnalytics[]
  readonly pendingCount: number
}) {
  const recent = posts.slice(0, 5)
  const topPost = [...posts].sort(
    (a, b) =>
      b.likes + b.comments + b.reposts - (a.likes + a.comments + a.reposts)
  )[0]
  const chartData = groupPostsByDay(posts)

  return (
    <motion.div
      id="platform-linkedin"
      {...cardAnimation}
      style={{
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border,
        borderTopColor: COLORS.linkedin,
        borderTopWidth: 3,
      }}
      className="rounded-xl border p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={COLORS.linkedin}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        <h3 style={{ color: COLORS.text }} className="text-lg font-bold">
          LinkedIn
        </h3>
        <PendingBadge count={pendingCount} />
      </div>

      <div
        style={{ backgroundColor: COLORS.cardInner }}
        className="mb-4 rounded-lg p-3"
      >
        <p
          style={{ color: COLORS.textMuted }}
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
        >
          Recent Posts
        </p>
        <ul className="space-y-2">
          {recent.map((post) => (
            <li key={post.id} className="flex items-center justify-between">
              <span
                style={{ color: COLORS.text }}
                className="line-clamp-1 flex-1 text-sm"
              >
                {post.post_text}
              </span>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                {post.ml_prediction !== null && (
                  <span
                    style={{
                      backgroundColor:
                        post.ml_prediction > 0.5
                          ? 'rgba(34,197,94,0.2)'
                          : 'rgba(239,68,68,0.2)',
                      color:
                        post.ml_prediction > 0.5 ? '#22c55e' : '#ef4444',
                    }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    ML {(post.ml_prediction * 100).toFixed(0)}%
                  </span>
                )}
                {post.ml_confidence !== null && (
                  <span
                    style={{
                      backgroundColor: COLORS.border,
                      color: COLORS.textMuted,
                    }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    conf {(post.ml_confidence * 100).toFixed(0)}%
                  </span>
                )}
                <span
                  style={{ color: COLORS.textDim }}
                  className="text-xs whitespace-nowrap"
                >
                  {formatRelativeTime(post.posted_at)}
                </span>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li style={{ color: COLORS.textDim }} className="text-sm">
              No posts yet
            </li>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <EngagementMiniChart data={chartData} color={COLORS.linkedin} />
      </div>

      {topPost && (
        <div
          style={{ backgroundColor: COLORS.cardInner }}
          className="rounded-lg p-3"
        >
          <p
            style={{ color: COLORS.textMuted }}
            className="mb-1 text-xs font-semibold"
          >
            Top Performer
          </p>
          <p style={{ color: COLORS.text }} className="line-clamp-1 text-sm">
            <span className="mr-1">&#127942;</span>
            {topPost.post_text}
          </p>
          <p style={{ color: COLORS.textDim }} className="mt-1 text-xs">
            {topPost.likes} likes &middot; {topPost.comments} comments &middot;{' '}
            {topPost.reposts} reposts
          </p>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Instagram Card                                                    */
/* ------------------------------------------------------------------ */
function InstagramCard({
  posts,
  storyQueue,
  pendingCount,
}: {
  readonly posts: readonly InstagramPostAnalytics[]
  readonly storyQueue: readonly InstagramStoryQueue[]
  readonly pendingCount: number
}) {
  const recent = posts.slice(0, 5)
  const topPost = [...posts].sort(
    (a, b) => b.engagement_rate - a.engagement_rate
  )[0]
  const chartData = groupPostsByDay(posts)

  const draftCount = storyQueue.filter(
    (s) => s.status === 'draft'
  ).length
  const pendingApprovalCount = storyQueue.filter(
    (s) => s.status === 'pending_approval' || s.status === 'approved' || s.status === 'ready_to_post'
  ).length
  const postedCount = storyQueue.filter(
    (s) => s.status === 'posted'
  ).length

  return (
    <motion.div
      id="platform-instagram"
      {...cardAnimation}
      style={{
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border,
        borderTopColor: COLORS.instagram,
        borderTopWidth: 3,
      }}
      className="rounded-xl border p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={COLORS.instagram}>
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
        </svg>
        <h3 style={{ color: COLORS.text }} className="text-lg font-bold">
          Instagram
        </h3>
        <PendingBadge count={pendingCount} />
      </div>

      {/* Story queue status */}
      <div className="mb-4 flex gap-2">
        <span
          style={{ backgroundColor: COLORS.border, color: COLORS.textMuted }}
          className="rounded-full px-2.5 py-1 text-xs font-medium"
        >
          Draft: {draftCount}
        </span>
        <span
          style={{
            backgroundColor: 'rgba(234,179,8,0.15)',
            color: '#eab308',
          }}
          className="rounded-full px-2.5 py-1 text-xs font-medium"
        >
          Pending: {pendingApprovalCount}
        </span>
        <span
          style={{
            backgroundColor: 'rgba(34,197,94,0.15)',
            color: '#22c55e',
          }}
          className="rounded-full px-2.5 py-1 text-xs font-medium"
        >
          Posted: {postedCount}
        </span>
      </div>

      <div
        style={{ backgroundColor: COLORS.cardInner }}
        className="mb-4 rounded-lg p-3"
      >
        <p
          style={{ color: COLORS.textMuted }}
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
        >
          Recent Posts
        </p>
        <ul className="space-y-2">
          {recent.map((post) => (
            <li key={post.id} className="flex items-center justify-between">
              <span
                style={{ color: COLORS.text }}
                className="line-clamp-1 flex-1 text-sm"
              >
                {post.caption}
              </span>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                <span
                  style={{ color: COLORS.textDim }}
                  className="text-xs whitespace-nowrap"
                >
                  {post.engagement_rate.toFixed(1)}% ER
                </span>
                <span
                  style={{ color: COLORS.textDim }}
                  className="text-xs whitespace-nowrap"
                >
                  {formatRelativeTime(post.posted_at)}
                </span>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li style={{ color: COLORS.textDim }} className="text-sm">
              No posts yet
            </li>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <EngagementMiniChart data={chartData} color={COLORS.instagram} />
      </div>

      {topPost && (
        <div
          style={{ backgroundColor: COLORS.cardInner }}
          className="rounded-lg p-3"
        >
          <p
            style={{ color: COLORS.textMuted }}
            className="mb-1 text-xs font-semibold"
          >
            Top Performer
          </p>
          <p style={{ color: COLORS.text }} className="line-clamp-1 text-sm">
            <span className="mr-1">&#127942;</span>
            {topPost.caption}
          </p>
          <p style={{ color: COLORS.textDim }} className="mt-1 text-xs">
            {topPost.engagement_rate.toFixed(2)}% engagement &middot;{' '}
            {topPost.reach.toLocaleString()} reach
          </p>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Blog RSS Card                                                     */
/* ------------------------------------------------------------------ */
function BlogRssCard({
  topics,
  pendingCount,
}: {
  readonly topics: readonly BlogTopicQueue[]
  readonly pendingCount: number
}) {
  const recent = topics.slice(0, 5)
  const topTopic = [...topics].sort(
    (a, b) => b.buzz_score - a.buzz_score
  )[0]
  const maxBuzz = Math.max(...topics.map((t) => t.buzz_score), 1)

  return (
    <motion.div
      id="platform-blog-rss"
      {...cardAnimation}
      style={{
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border,
        borderTopColor: COLORS.blogRss,
        borderTopWidth: 3,
      }}
      className="rounded-xl border p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={COLORS.blogRss}
        >
          <path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93v-2.83z" />
        </svg>
        <h3 style={{ color: COLORS.text }} className="text-lg font-bold">
          Blog RSS
        </h3>
        <PendingBadge count={pendingCount} />
      </div>

      <div
        style={{ backgroundColor: COLORS.cardInner }}
        className="mb-4 rounded-lg p-3"
      >
        <p
          style={{ color: COLORS.textMuted }}
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
        >
          Recent Topics
        </p>
        <ul className="space-y-2">
          {recent.map((topic) => (
            <li key={topic.id} className="flex items-center justify-between">
              <span
                style={{ color: COLORS.text }}
                className="line-clamp-1 flex-1 text-sm"
              >
                {topic.suggested_topic ?? topic.source_title}
              </span>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                <span
                  style={{
                    backgroundColor: COLORS.border,
                    color: COLORS.textMuted,
                  }}
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                >
                  {topic.status}
                </span>
                <span
                  style={{ color: COLORS.textDim }}
                  className="text-xs whitespace-nowrap"
                >
                  {formatRelativeTime(topic.created_at)}
                </span>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li style={{ color: COLORS.textDim }} className="text-sm">
              No topics yet
            </li>
          )}
        </ul>
      </div>

      {/* Buzz score bar chart */}
      <div
        style={{ backgroundColor: COLORS.cardInner }}
        className="mb-4 rounded-lg p-3"
      >
        <p
          style={{ color: COLORS.textMuted }}
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
        >
          Buzz Score
        </p>
        <div className="space-y-1.5">
          {recent.map((topic) => (
            <div key={topic.id} className="flex items-center gap-2">
              <span
                style={{ color: COLORS.textDim }}
                className="w-6 shrink-0 text-right text-[10px]"
              >
                {topic.buzz_score.toFixed(0)}
              </span>
              <div
                className="h-3 flex-1 overflow-hidden rounded-sm"
                style={{ backgroundColor: COLORS.border }}
              >
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${Math.max((topic.buzz_score / maxBuzz) * 100, 2)}%`,
                    backgroundColor: COLORS.blogRss,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {topTopic && (
        <div
          style={{ backgroundColor: COLORS.cardInner }}
          className="rounded-lg p-3"
        >
          <p
            style={{ color: COLORS.textMuted }}
            className="mb-1 text-xs font-semibold"
          >
            Top Performer
          </p>
          <p style={{ color: COLORS.text }} className="line-clamp-1 text-sm">
            <span className="mr-1">&#127942;</span>
            {topTopic.suggested_topic ?? topTopic.source_title}
          </p>
          <p style={{ color: COLORS.textDim }} className="mt-1 text-xs">
            Buzz score: {topTopic.buzz_score.toFixed(1)} &middot;{' '}
            {topTopic.source_feed}
          </p>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Grid                                                         */
/* ------------------------------------------------------------------ */
export function PlatformDetailCards({
  xPosts,
  linkedinPosts,
  instagramPosts,
  storyQueue,
  blogTopics,
  pendingActions,
}: PlatformDetailCardsProps) {
  const xPending = pendingActions.filter(
    (a) => a.action_type === 'post_x' || a.action_type === 'post_x_long'
  ).length
  const linkedinPending = pendingActions.filter(
    (a) => a.action_type === 'post_linkedin'
  ).length
  const instagramPending = pendingActions.filter(
    (a) => a.action_type === 'post_instagram_story'
  ).length
  const blogPending = pendingActions.filter(
    (a) => a.action_type === 'trigger_blog'
  ).length

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <XCard posts={xPosts} pendingCount={xPending} />
      <LinkedInCard posts={linkedinPosts} pendingCount={linkedinPending} />
      <InstagramCard
        posts={instagramPosts}
        storyQueue={storyQueue}
        pendingCount={instagramPending}
      />
      <BlogRssCard topics={blogTopics} pendingCount={blogPending} />
    </div>
  )
}
