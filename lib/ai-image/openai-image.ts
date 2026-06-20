/**
 * OpenAI GPT Image 2 サムネ/インフォグラフィック生成器
 *
 * 方針（ユーザー要件）:
 * - Gemini画像は廃止。画像は OpenAI GPT Image 2（高品質・横長1536x1024）に統一。
 * - 1投稿=勝負の1枚に集中（4-5枚作らない）。バズる「ネオン・インフォグラフィック」品質。
 * - 毎回同じ見た目にならないよう、配色/レイアウト/アイコン/seed を変動。
 * - 画像内テキストは短く（タイトル＋キーワード3-5語）。詳細は投稿本文側に置く。
 *
 * モデルID は OPENAI_IMAGE_MODEL で上書き可（既定 'gpt-image-2'）。
 * 料金目安(2026): high 1536x1024 ≈ $0.17-0.21 / medium 1024² ≈ $0.04 / 枚。
 */

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'

const PALETTES: readonly string[][] = [
  ['electric cyan', 'neon blue', 'magenta'],
  ['vivid purple', 'hot pink', 'orange'],
  ['teal', 'azure blue', 'violet'],
  ['lime green', 'cyan', 'deep blue'],
  ['amber orange', 'crimson', 'gold'],
]
const LAYOUTS: readonly string[] = [
  'glowing neon-outlined panels stacked as a clean numbered list',
  'a 2-column grid of neon-outlined cards with number badges',
  'a central glowing hero title with radiating neon sub-sections',
]
const ICON_SETS: readonly string[] = [
  'magnifier, gears, rocket, flame, bar-chart',
  'lightbulb, target, money-bag, trophy, lightning',
  'brain, link, shield, spark, upward-arrow',
]

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed)) % arr.length]
}

export interface NeonThumbnailInput {
  /** 画像に焼く短いタイトル（日本語可・短く） */
  title: string
  /** 短いキーワードラベル 3-5語（画像に焼く） */
  keywords?: readonly string[]
  /** 内容テーマ（英語説明に使用。画像の主旨） */
  theme?: string
  /** 【完全保存版】帯を出すか（既定 true） */
  saveBadge?: boolean
  /** 同じ見た目を避けるためのseed（未指定はランダム） */
  seed?: number
}

/**
 * ネオン・インフォグラフィック風のプロンプトを構築（毎回バリエーション）。
 */
export function buildNeonPrompt(input: NeonThumbnailInput): string {
  const seed = input.seed ?? Math.floor(Math.random() * 1e9)
  const palette = pick(PALETTES, seed).join(', ')
  const layout = pick(LAYOUTS, seed >> 3)
  const icons = pick(ICON_SETS, seed >> 5)
  const kw = (input.keywords ?? []).slice(0, 5).join('  /  ')
  const badge =
    input.saveBadge !== false
      ? 'A small glowing 「完全保存版」 ribbon banner at the very top. '
      : ''
  return [
    'A premium Japanese social-media thumbnail infographic, 16:9 landscape, dark navy-to-black background with subtle rain streaks and faint smoke texture, cinematic high contrast.',
    `Vibrant neon glow accents in ${palette}. Composition: ${layout}, with simple glowing line icons (${icons}).`,
    badge,
    `Large bold glowing Japanese headline near the top reading exactly: 「${input.title}」.`,
    kw ? `A few short glowing Japanese keyword labels placed in the sections: ${kw}.` : '',
    'Modern tech aesthetic, crisp and highly legible, professional, balanced composition, generous spacing, no watermark, no logos, no gibberish text.',
    `Subject/theme: ${input.theme ?? input.title}.`,
  ]
    .filter(Boolean)
    .join(' ')
}

export interface NeonThumbnailResult {
  buffer?: Buffer
  prompt: string
  model: string
  error?: string
}

/**
 * GPT Image 2 で 1枚の高品質サムネを生成し、PNG bufferを返す。
 */
export async function generateNeonThumbnail(
  input: NeonThumbnailInput,
  opts?: { quality?: 'high' | 'medium' | 'low'; size?: '1536x1024' | '1024x1024' | '1024x1536' },
): Promise<NeonThumbnailResult> {
  const prompt = buildNeonPrompt(input)
  if (!process.env.OPENAI_API_KEY) {
    return { prompt, model: IMAGE_MODEL, error: 'OPENAI_API_KEY未設定' }
  }
  try {
    const res = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: opts?.size ?? '1536x1024',
      quality: opts?.quality ?? 'high',
      n: 1,
    })
    const b64 = res.data?.[0]?.b64_json
    if (!b64) {
      return { prompt, model: IMAGE_MODEL, error: '画像データ(b64_json)が空' }
    }
    return { buffer: Buffer.from(b64, 'base64'), prompt, model: IMAGE_MODEL }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { prompt, model: IMAGE_MODEL, error: message }
  }
}
