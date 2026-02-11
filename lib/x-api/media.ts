/**
 * X投稿用メディア取得 + アップロード
 *
 * 4段フォールバック:
 *   1. og:video (記事の動画) → 直接MP4ダウンロード
 *   2. Brave Video Search → 関連動画のMP4取得
 *   3. og:image (記事の画像) → ダウンロード
 *   4. Puppeteerスクリーンショット → キャプチャ
 *   5. 全失敗 → null (テキストのみ投稿)
 */

import * as cheerio from 'cheerio'
import { getTwitterClient } from './client'

// ============================================================
// 定数
// ============================================================

const MAX_VIDEO_SIZE = 512 * 1024 * 1024 // 512MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_DURATION = 140 // 秒

const VIDEO_DOWNLOAD_TIMEOUT = 30_000
const IMAGE_DOWNLOAD_TIMEOUT = 10_000
const OG_FETCH_TIMEOUT = 5_000
const SCREENSHOT_TIMEOUT = 10_000
const UPLOAD_TIMEOUT = 30_000

const USER_AGENT = 'Mozilla/5.0 (compatible; NandsTechBot/1.0)'

// HLS/DASH/埋め込みをスキップするパターン
const NON_DIRECT_VIDEO_PATTERNS = [
  /\.m3u8/i,
  /\.mpd/i,
  /youtube\.com/i,
  /youtu\.be/i,
  /vimeo\.com/i,
  /dailymotion\.com/i,
  /facebook\.com\/video/i,
]

// ============================================================
// 型定義
// ============================================================

export interface MediaResult {
  mediaId: string | null
  type: 'video' | 'image'
  buffer: Buffer
  mimeType: string
  source: string
}

export interface FetchMediaParams {
  sourceUrl: string
  topic?: string
}

interface DownloadedMedia {
  buffer: Buffer
  mimeType: string
}

// ============================================================
// 動画取得
// ============================================================

/**
 * HTMLからog:video / twitter:player:stream / <video src> を抽出してMP4をダウンロード
 */
export async function fetchOgVideo(
  url: string,
): Promise<DownloadedMedia | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), OG_FETCH_TIMEOUT)

    let html: string
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      })
      if (!response.ok) return null
      html = await response.text()
    } finally {
      clearTimeout(timeout)
    }

    const $ = cheerio.load(html)

    // 優先順位: og:video → twitter:player:stream → <video src>
    const videoUrl =
      $('meta[property="og:video"]').attr('content') ??
      $('meta[property="og:video:url"]').attr('content') ??
      $('meta[name="twitter:player:stream"]').attr('content') ??
      $('video source[type="video/mp4"]').first().attr('src') ??
      $('video[src]').first().attr('src')

    if (!videoUrl) return null

    // 絶対URLに変換
    const absoluteUrl = new URL(videoUrl, url).href

    // 非直接ダウンロード可能なURLをスキップ
    if (NON_DIRECT_VIDEO_PATTERNS.some((p) => p.test(absoluteUrl))) {
      console.log(`[media] Skipping non-direct video URL: ${absoluteUrl}`)
      return null
    }

    return await downloadVideo(absoluteUrl)
  } catch (error) {
    console.error('[media] fetchOgVideo failed:', error)
    return null
  }
}

/**
 * Brave Video Search APIで関連動画を検索
 * 直接DL可能なMP4 URLの動画を優先
 */
export async function searchBraveVideo(
  topic: string,
): Promise<{ url: string; thumbnail: string } | null> {
  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey || !topic) return null

  try {
    const params = new URLSearchParams({
      q: topic,
      count: '5',
      result_filter: 'videos',
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    let response: Response
    try {
      response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?${params}`,
        {
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': apiKey,
          },
          signal: controller.signal,
        },
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) return null

    const data = await response.json()

    interface BraveVideoResult {
      url?: string
      thumbnail?: { src?: string }
      video?: { url?: string }
    }

    const videos: BraveVideoResult[] = data.videos?.results ?? []

    // 直接MP4 URLの動画を優先
    for (const video of videos) {
      const videoUrl = video.video?.url ?? video.url
      if (videoUrl && /\.mp4(\?|$)/i.test(videoUrl)) {
        return {
          url: videoUrl,
          thumbnail: video.thumbnail?.src ?? '',
        }
      }
    }

    // MP4なければサムネイルURLを返す（画像として使用可能）
    const firstWithThumb = videos.find((v) => v.thumbnail?.src)
    if (firstWithThumb?.thumbnail?.src) {
      return {
        url: '',
        thumbnail: firstWithThumb.thumbnail.src,
      }
    }

    return null
  } catch (error) {
    console.error('[media] searchBraveVideo failed:', error)
    return null
  }
}

/**
 * URLから動画をダウンロード
 * Content-Typeがvideo/mp4であることを確認、512MB制限チェック
 */
export async function downloadVideo(
  url: string,
): Promise<DownloadedMedia | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), VIDEO_DOWNLOAD_TIMEOUT)

    let response: Response
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) return null

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('video/mp4')) {
      console.log(`[media] Not MP4: ${contentType} for ${url}`)
      return null
    }

    const contentLength = parseInt(
      response.headers.get('content-length') ?? '0',
      10,
    )
    if (contentLength > MAX_VIDEO_SIZE) {
      console.log(`[media] Video too large: ${contentLength} bytes`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length > MAX_VIDEO_SIZE) {
      console.log(`[media] Video too large after download: ${buffer.length}`)
      return null
    }

    return { buffer, mimeType: 'video/mp4' }
  } catch (error) {
    console.error('[media] downloadVideo failed:', error)
    return null
  }
}

// ============================================================
// 画像取得
// ============================================================

/**
 * HTMLからog:image / twitter:imageを抽出してダウンロード
 */
export async function fetchOgImage(
  url: string,
): Promise<DownloadedMedia | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), OG_FETCH_TIMEOUT)

    let html: string
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      })
      if (!response.ok) return null
      html = await response.text()
    } finally {
      clearTimeout(timeout)
    }

    const $ = cheerio.load(html)

    const imageUrl =
      $('meta[property="og:image"]').attr('content') ??
      $('meta[name="twitter:image"]').attr('content') ??
      $('meta[property="og:image:url"]').attr('content')

    if (!imageUrl) return null

    const absoluteUrl = new URL(imageUrl, url).href

    return await downloadImage(absoluteUrl)
  } catch (error) {
    console.error('[media] fetchOgImage failed:', error)
    return null
  }
}

/**
 * URLから画像をダウンロード、5MB制限チェック
 */
async function downloadImage(url: string): Promise<DownloadedMedia | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), IMAGE_DOWNLOAD_TIMEOUT)

    let response: Response
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) return null

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) {
      console.log(`[media] Not image: ${contentType} for ${url}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length > MAX_IMAGE_SIZE) {
      console.log(`[media] Image too large: ${buffer.length} bytes`)
      return null
    }

    // MIMEタイプを正規化
    const mimeType = contentType.includes('png')
      ? 'image/png'
      : contentType.includes('gif')
        ? 'image/gif'
        : contentType.includes('webp')
          ? 'image/webp'
          : 'image/jpeg'

    return { buffer, mimeType }
  } catch (error) {
    console.error('[media] downloadImage failed:', error)
    return null
  }
}

/**
 * Puppeteerでページ上部をスクリーンショット (1280x720 PNG)
 */
export async function screenshotUrl(url: string): Promise<Buffer | null> {
  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 720 })
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: SCREENSHOT_TIMEOUT,
      })

      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 1280, height: 720 },
      })

      return Buffer.from(screenshot)
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('[media] screenshotUrl failed:', error)
    return null
  }
}

// ============================================================
// X アップロード
// ============================================================

/**
 * BufferをX APIにアップロードしてmedia_idを返す
 * 画像: 直接アップロード、動画: チャンクアップロード (twitter-api-v2が自動処理)
 */
export async function uploadMediaToX(
  buffer: Buffer,
  mimeType: string,
): Promise<string | null> {
  try {
    const client = getTwitterClient()

    const mediaId = await client.v1.uploadMedia(buffer, {
      mimeType,
      ...(mimeType.startsWith('video/') && {
        additionalOwners: [],
        longVideo: buffer.length > 15 * 1024 * 1024,
      }),
    })

    console.log(`[media] Uploaded to X: media_id=${mediaId}`)
    return mediaId
  } catch (error) {
    console.error('[media] uploadMediaToX failed:', error)
    return null
  }
}

// ============================================================
// オーケストレーター
// ============================================================

/**
 * 4段フォールバックでメディアを取得
 *
 * メディアが見つかったら:
 *   - buffer を返す (Slack送信用 → ユーザーがダウンロードして手動投稿)
 *   - X upload も試みる (成功すれば mediaId 付き → 自動添付)
 *
 * 1. og:video → 動画
 * 2. Brave Video Search → 動画
 * 3. og:image → 画像
 * 4. Puppeteerスクリーンショット → 画像
 * 5. 全失敗 → null
 */
export async function fetchMediaForPost(
  params: FetchMediaParams,
): Promise<MediaResult | null> {
  const { sourceUrl, topic } = params

  // 1. og:video (記事の動画)
  if (sourceUrl) {
    console.log(`[media] Step 1: Trying og:video from ${sourceUrl}`)
    const video = await fetchOgVideo(sourceUrl)
    if (video) {
      const mediaId = await uploadMediaToX(video.buffer, video.mimeType)
      console.log(`[media] og:video found, X upload: ${mediaId ? 'success' : 'failed (Slack fallback)'}`)
      return {
        mediaId,
        type: 'video',
        buffer: video.buffer,
        mimeType: video.mimeType,
        source: 'og:video',
      }
    }
  }

  // 2. Brave Video Search (関連動画MP4)
  if (topic) {
    console.log(`[media] Step 2: Trying Brave Video Search for "${topic}"`)
    const braveResult = await searchBraveVideo(topic)
    if (braveResult) {
      if (braveResult.url) {
        const video = await downloadVideo(braveResult.url)
        if (video) {
          const mediaId = await uploadMediaToX(video.buffer, video.mimeType)
          console.log(`[media] Brave video found, X upload: ${mediaId ? 'success' : 'failed (Slack fallback)'}`)
          return {
            mediaId,
            type: 'video',
            buffer: video.buffer,
            mimeType: video.mimeType,
            source: 'brave_video',
          }
        }
      }

      if (braveResult.thumbnail) {
        const image = await downloadImage(braveResult.thumbnail)
        if (image) {
          const mediaId = await uploadMediaToX(image.buffer, image.mimeType)
          return {
            mediaId,
            type: 'image',
            buffer: image.buffer,
            mimeType: image.mimeType,
            source: 'brave_thumbnail',
          }
        }
      }
    }
  }

  // 3. og:image (記事の画像)
  if (sourceUrl) {
    console.log(`[media] Step 3: Trying og:image from ${sourceUrl}`)
    const image = await fetchOgImage(sourceUrl)
    if (image) {
      const mediaId = await uploadMediaToX(image.buffer, image.mimeType)
      console.log(`[media] og:image found, X upload: ${mediaId ? 'success' : 'failed (Slack fallback)'}`)
      return {
        mediaId,
        type: 'image',
        buffer: image.buffer,
        mimeType: image.mimeType,
        source: 'og:image',
      }
    }
  }

  // 4. Puppeteerスクリーンショット
  if (sourceUrl) {
    console.log(`[media] Step 4: Trying Puppeteer screenshot of ${sourceUrl}`)
    const screenshot = await screenshotUrl(sourceUrl)
    if (screenshot) {
      const mediaId = await uploadMediaToX(screenshot, 'image/png')
      console.log(`[media] Screenshot taken, X upload: ${mediaId ? 'success' : 'failed (Slack fallback)'}`)
      return {
        mediaId,
        type: 'image',
        buffer: screenshot,
        mimeType: 'image/png',
        source: 'screenshot',
      }
    }
  }

  // 5. 全失敗
  console.log('[media] All media fetch methods failed')
  return null
}
