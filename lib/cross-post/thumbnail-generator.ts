/**
 * Cross-Post Thumbnail Generator
 *
 * Generates platform-specific thumbnails for cross-posted articles using OpenAI GPT Image 2.
 * Each platform (Zenn, Qiita, note) gets a neon infographic thumbnail.
 *
 * Storage: Supabase 'blog' bucket under images/cross-post/{platform}/
 */

import { createClient } from '@supabase/supabase-js'
import { generateNeonThumbnail } from '../ai-image/openai-image'
import type { CrossPostPlatform, CrossPostThumbnail } from './types'
import { THUMBNAIL_SPECS } from './types'

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
    )
  }
  return createClient(url, key)
}

// ============================================================
// Upload to Supabase Storage
// ============================================================

async function uploadToStorage(
  platform: CrossPostPlatform,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const supabase = getSupabaseClient()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const filePath = `images/cross-post/${platform}/thumb-${timestamp}-${random}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('blog')
    .upload(filePath, buffer, {
      contentType: mimeType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('blog').getPublicUrl(filePath)

  return publicUrl
}

// ============================================================
// Main Export
// ============================================================

export async function generateCrossPostThumbnail(
  platform: CrossPostPlatform,
  title: string,
  tags: readonly string[],
): Promise<CrossPostThumbnail | null> {
  try {
    const spec = THUMBNAIL_SPECS[platform]

    process.stdout.write(`Generating ${platform} thumbnail (${spec.width}x${spec.height})\n`)

    const result = await generateNeonThumbnail(
      {
        title,
        keywords: tags.slice(0, 5) as string[],
        theme: `${platform} tech blog thumbnail`,
        saveBadge: true,
      },
      { quality: 'high', size: '1536x1024' },
    )

    if (result.error || !result.buffer) {
      process.stdout.write(`OpenAI did not return an image for ${platform} thumbnail: ${result.error ?? 'no buffer'}\n`)
      return null
    }

    const imageUrl = await uploadToStorage(platform, result.buffer, 'image/png')

    process.stdout.write(`${platform} thumbnail uploaded: ${imageUrl}\n`)

    return { platform, imageUrl, imageBuffer: result.buffer }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`${platform} thumbnail generation failed: ${message}\n`)
    return null
  }
}
