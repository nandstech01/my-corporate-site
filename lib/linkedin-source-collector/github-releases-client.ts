/**
 * GitHub Releases クライアント
 *
 * 主要AIリポジトリの最新リリースを監視。
 * 認証不要（60 req/hr のレート制限内で運用）。
 */

// ============================================================
// 型定義
// ============================================================

export interface GitHubRelease {
  readonly repo: string
  readonly tagName: string
  readonly name: string
  readonly body: string
  readonly publishedAt: string
  readonly htmlUrl: string
}

interface GitHubReleaseResponse {
  readonly tag_name: string
  readonly name: string
  readonly body: string
  readonly published_at: string
  readonly html_url: string
}

// ============================================================
// 定数
// ============================================================

const WATCHED_REPOS: readonly string[] = [
  'anthropics/claude-code',
  'langchain-ai/langchain',
  'openai/openai-python',
  'run-llama/llama_index',
  'microsoft/autogen',
  'crewAIInc/crewAI',
  'huggingface/transformers',
  'ollama/ollama',
]

const FRESHNESS_HOURS = 48

// ============================================================
// メイン: 直近48時間のリリースを取得
// ============================================================

async function fetchLatestRelease(repo: string): Promise<GitHubRelease | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  let response: Response
  try {
    response = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'NandsTechBot/1.0',
        },
        signal: controller.signal,
      },
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    // 404 = no releases, skip silently
    if (response.status === 404) return null
    return null
  }

  const data = (await response.json()) as GitHubReleaseResponse

  // 直近48時間以内のリリースのみ
  const publishedAt = new Date(data.published_at)
  const cutoff = new Date(Date.now() - FRESHNESS_HOURS * 60 * 60 * 1000)

  if (publishedAt < cutoff) return null

  return {
    repo,
    tagName: data.tag_name,
    name: data.name || data.tag_name,
    body: data.body?.slice(0, 2000) ?? '',
    publishedAt: data.published_at,
    htmlUrl: data.html_url,
  }
}

export async function fetchRecentGitHubReleases(): Promise<readonly GitHubRelease[]> {
  const results = await Promise.allSettled(
    WATCHED_REPOS.map((repo) => fetchLatestRelease(repo)),
  )

  return results
    .filter(
      (r): r is PromiseFulfilledResult<GitHubRelease | null> =>
        r.status === 'fulfilled',
    )
    .map((r) => r.value)
    .filter((r): r is GitHubRelease => r !== null)
}
