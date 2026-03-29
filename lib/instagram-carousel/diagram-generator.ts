/**
 * Instagram Carousel テック系背景画像生成
 *
 * Gemini画像生成APIを使用して、カルーセルのコンテンツスライド用の
 * テック系背景画像を生成する（テキストなし、Satoriで重ねる）
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const SCENES = [
  'Dark modern office with glowing monitors showing code, blue ambient light',
  'Server room corridor with cyan LED strips, rows of servers, perspective view',
  'Abstract circuit board patterns with glowing cyan trace lines, macro view',
  'Digital network visualization, connected nodes with blue glow, dark space',
  'Holographic UI dashboard floating in dark space, cyan wireframes',
  'Deep space with data streams and particle effects, blue-cyan gradient',
  'Glass office building at night with cyan interior lighting, reflections',
  'AI microprocessor chip extreme closeup with glowing circuits, blue light',
  'City skyline at night with digital data overlay, cyberpunk aesthetic',
  'Laboratory with scientific visualization screens, blue-cyan ambient light',
] as const

function buildPrompt(sceneIndex: number): string {
  const scene = SCENES[sceneIndex % SCENES.length]
  return `Instagram carousel slide background image.
IMPORTANT: No text, no labels, no words, no characters, no letters, no numbers. Clean visual elements only.

Scene: ${scene}
Style: Modern, professional tech aesthetic. Premium quality. Cinematic.
Lighting: Soft studio lighting with subtle rim highlights, high dynamic range.
Color palette: navy (#0F172A), cyan (#06B6D4), blue (#2563EB) accents on dark background.
Aspect ratio: 4:5 portrait (1080x1350px).
Mood: Professional, futuristic, innovative.

High resolution, sharp focus, shallow depth of field, cinematic quality.
No watermarks, no logos, no text overlays.`
}

function extractImageData(response: unknown): { buffer: Buffer; mimeType: string } | null {
  const resp = response as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data: string; mimeType: string }
        }>
      }
    }>
  }

  for (const candidate of resp.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png'
        const normalizedMime = mimeType.includes('jpeg') || mimeType.includes('jpg')
          ? 'image/jpeg'
          : mimeType.includes('webp') ? 'image/webp' : 'image/png'
        return {
          buffer: Buffer.from(part.inlineData.data, 'base64'),
          mimeType: normalizedMime,
        }
      }
    }
  }
  return null
}

export async function generateBackgroundImage(
  slideIndex: number,
): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    process.stdout.write('GOOGLE_AI_API_KEY not set, skipping background generation\n')
    return null
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-image-preview',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.8,
      } as Record<string, unknown>,
    })

    const prompt = buildPrompt(slideIndex)
    const result = await model.generateContent(prompt)
    const imageData = extractImageData(result.response)

    if (imageData) {
      process.stdout.write(`Background ${slideIndex}: ${imageData.buffer.length} bytes (${imageData.mimeType})\n`)
      return imageData.buffer
    }

    process.stdout.write(`Background ${slideIndex}: no image in response\n`)
    return null
  } catch (err) {
    process.stdout.write(`Background ${slideIndex} failed: ${err}\n`)
    return null
  }
}

export async function generateMultipleBackgrounds(
  count: number,
): Promise<(Buffer | null)[]> {
  // Generate in parallel for speed
  const promises = Array.from({ length: count }, (_, i) =>
    generateBackgroundImage(i + Math.floor(Math.random() * 10))
  )
  return Promise.all(promises)
}
