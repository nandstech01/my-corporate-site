/**
 * Official-looking orange Anthropic-style banner thumbnail via OpenAI image.
 * White/cream background, Anthropic orange (#D97757) sparkle, bold JP title.
 * Standalone OpenAI client + own prompt (does NOT modify lib/ai-image).
 * Uploads to Supabase `blog` bucket → public URL. Best-effort (null on failure).
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import type { ContentKind } from './types'

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function buildPrompt(title: string, kind: ContentKind): string {
  const badge = kind === 'claude-code-news' ? '最新アップデート' : kind === 'company-ai' ? '技術解説' : '完全ガイド'
  return [
    'A clean, official-looking editorial blog banner in the style of Anthropic / Claude branding.',
    'Background: soft white / warm cream (#FAF7F2), lots of whitespace, flat modern design, NO neon, NO dark background, NO photo.',
    'Accent color: Anthropic orange (#D97757). A single small orange asterisk/sparkle mark as a logo accent near the title.',
    `Centerpiece: a BOLD, large Japanese headline reading exactly: 「${title}」`,
    `A small orange rounded badge with the Japanese text: 「${badge}」`,
    'Typography: heavy gothic Japanese sans-serif, crisp and legible, professional. Title must be the clear focal point.',
    'Subtle thin orange underline or simple geometric accents. Minimal, premium, trustworthy, official documentation vibe.',
    'No gibberish text, no English filler, no watermark, no UI chrome. Only the specified Japanese text.',
  ].join(' ')
}

/** Render the orange banner as a PNG buffer (no upload). */
export async function renderBannerBuffer(
  title: string,
  kind: ContentKind,
): Promise<Buffer | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    process.stdout.write('[blog-banner] OPENAI_API_KEY unset — skipping thumbnail\n')
    return null
  }
  try {
    const openai = new OpenAI({ apiKey })
    const res = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: buildPrompt(title, kind),
      size: '1536x1024',
      quality: 'high',
      n: 1,
    })
    const b64 = res.data?.[0]?.b64_json
    if (!b64) {
      process.stdout.write('[blog-banner] empty image data\n')
      return null
    }
    return Buffer.from(b64, 'base64')
  } catch (e) {
    process.stdout.write(`[blog-banner] render failed: ${e instanceof Error ? e.message : e}\n`)
    return null
  }
}

/** Generate the banner and upload it to Typefully → returns a Typefully media id (for createTypefullyDraft). */
export async function bannerToTypefullyMedia(
  title: string,
  kind: ContentKind,
): Promise<string | null> {
  const buffer = await renderBannerBuffer(title, kind)
  if (!buffer) return null
  try {
    const { uploadTypefullyMedia } = await import('../../typefully/client')
    const { mediaId, error } = await uploadTypefullyMedia(new Uint8Array(buffer), `banner-${Date.now()}.png`)
    if (!mediaId) {
      process.stdout.write(`[blog-banner] Typefully upload skipped: ${error}\n`)
      return null
    }
    return mediaId
  } catch (e) {
    process.stdout.write(`[blog-banner] Typefully upload failed: ${e instanceof Error ? e.message : e}\n`)
    return null
  }
}

export async function generateOrangeBanner(
  title: string,
  kind: ContentKind,
): Promise<string | null> {
  const buffer = await renderBannerBuffer(title, kind)
  if (!buffer) return null
  try {

    const sb = getSupabase()
    if (!sb) return null
    const ts = Date.now()
    const rand = Math.random().toString(36).slice(2, 8)
    const filePath = `images/claude-code-blog/banner-${ts}-${rand}.png`
    const { error } = await sb.storage.from('blog').upload(filePath, buffer, {
      contentType: 'image/png',
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) {
      process.stdout.write(`[blog-banner] upload failed: ${error.message}\n`)
      return null
    }
    return sb.storage.from('blog').getPublicUrl(filePath).data.publicUrl
  } catch (e) {
    process.stdout.write(`[blog-banner] failed: ${e instanceof Error ? e.message : e}\n`)
    return null
  }
}
