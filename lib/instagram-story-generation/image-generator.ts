/**
 * Instagram Story 画像生成
 *
 * 戦略:
 * 1. 主: Google Imagen 3 (Vertex AI経由、1080x1920ポートレート)
 * 2. フォールバック: ブログOG画像
 *
 * プラガブル設計: ImageGenerator インターフェースで将来的にプロバイダー交換可能
 */

// ============================================================
// インターフェース
// ============================================================

export interface ImageGeneratorResult {
  readonly imageUrl: string
  readonly source: 'imagen' | 'og_image' | 'placeholder'
}

export interface ImageGenerator {
  generate(prompt: string): Promise<ImageGeneratorResult>
}

// ============================================================
// Google Imagen 3 (Vertex AI)
// ============================================================

class GoogleImagenGenerator implements ImageGenerator {
  private readonly projectId: string
  private readonly location: string

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID ?? ''
    this.location = process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1'
  }

  isConfigured(): boolean {
    return !!(this.projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS)
  }

  async generate(prompt: string): Promise<ImageGeneratorResult> {
    if (!this.isConfigured()) {
      throw new Error('Google Cloud credentials not configured')
    }

    const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-generate-002:predict`

    // Use Google Auth library to get access token
    const accessToken = await this.getAccessToken()

    const body = {
      instances: [
        {
          prompt: `${prompt}. Style: modern tech, clean design, navy and gold brand colors, portrait orientation 9:16 ratio, Instagram story format`,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: '9:16',
        safetyFilterLevel: 'block_some',
      },
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Imagen API error (${response.status}): ${errorText}`)
      }

      const data = (await response.json()) as {
        predictions: readonly { bytesBase64Encoded: string; mimeType: string }[]
      }

      if (!data.predictions?.[0]) {
        throw new Error('No image generated')
      }

      // Upload base64 image to a temporary storage or return data URI
      const base64 = data.predictions[0].bytesBase64Encoded
      const mimeType = data.predictions[0].mimeType || 'image/png'
      const imageUrl = `data:${mimeType};base64,${base64}`

      return { imageUrl, source: 'imagen' }
    } finally {
      clearTimeout(timeout)
    }
  }

  private async getAccessToken(): Promise<string> {
    // Use gcloud auth or service account JWT
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    if (!credentialsPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set')
    }

    // Dynamic import to handle environments where google-auth-library isn't available
    const { GoogleAuth } = await import('google-auth-library')
    const auth = new GoogleAuth({
      keyFilename: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const client = await auth.getClient()
    const tokenResponse = await client.getAccessToken()
    if (!tokenResponse.token) {
      throw new Error('Failed to get Google Cloud access token')
    }
    return tokenResponse.token
  }
}

// ============================================================
// OG画像フォールバック
// ============================================================

class OgImageFallback implements ImageGenerator {
  async generate(_prompt: string): Promise<ImageGeneratorResult> {
    // Return a placeholder — the trigger will use the blog's OG image
    return {
      imageUrl: '',
      source: 'placeholder',
    }
  }
}

// ============================================================
// ファクトリー
// ============================================================

export function createImageGenerator(): ImageGenerator {
  const imagenGenerator = new GoogleImagenGenerator()
  if (imagenGenerator.isConfigured()) {
    return imagenGenerator
  }

  process.stdout.write(
    'Image generation: Google Imagen not configured, using OG image fallback\n',
  )
  return new OgImageFallback()
}

// ============================================================
// 便利関数
// ============================================================

export async function generateStoryImage(
  prompt: string,
  blogSlug: string,
): Promise<ImageGeneratorResult> {
  const generator = createImageGenerator()

  try {
    const result = await generator.generate(prompt)

    // If placeholder, try to use blog's OG image
    if (result.source === 'placeholder') {
      const ogUrl = `https://nands.tech/blog/${blogSlug}/opengraph-image`
      return { imageUrl: ogUrl, source: 'og_image' }
    }

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Image generation failed: ${message}, using OG fallback\n`)

    const ogUrl = `https://nands.tech/blog/${blogSlug}/opengraph-image`
    return { imageUrl: ogUrl, source: 'og_image' }
  }
}
