import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer'
import { UnifiedStructuredDataSystem } from '@/lib/structured-data/index'
import { generateBlogFAQEntities } from '@/lib/structured-data/entity-relationships'
import {
  generateCompleteAIEnhancedUnifiedPageData,
  generateCompleteAIEnhancedStructuredDataJSON,
} from '@/lib/structured-data/unified-integration-ai-enhanced'
import {
  generateH2DiagramsAuto,
  isH2DiagramGenerationEnabled,
} from '@/lib/ai-image/h2-diagram-auto-generator'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabaseServiceRole = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export const maxDuration = 300
export const dynamic = 'force-dynamic'

interface PostProcessRequest {
  postId: number
  content: string
  slug: string
  categorySlug: string
  topic: string
  targetKeyword: string
  seoKeywords: string[]
  enableH2Diagrams?: boolean
  maxH2Diagrams?: number
  title?: string
  metaDescription?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify internal API secret (fail-closed)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.BLOG_WORKER_API_SECRET
    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: PostProcessRequest = await request.json()
    const {
      postId,
      content,
      slug,
      categorySlug,
      topic,
      targetKeyword,
      seoKeywords,
      enableH2Diagrams = true,
      maxH2Diagrams = 5,
      title = '',
      metaDescription = '',
    } = body

    if (!postId || !content || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, content, slug' },
        { status: 400 }
      )
    }

    let enhancedContent = content
    const extractedFragmentIds: string[] = []

    // Step 1: H2 diagram auto-generation
    if (enableH2Diagrams && isH2DiagramGenerationEnabled()) {
      try {
        const diagramResult = await generateH2DiagramsAuto(enhancedContent, {
          maxDiagrams: maxH2Diagrams,
          skipFAQ: true,
        })
        if (diagramResult.generatedDiagrams.length > 0) {
          enhancedContent = diagramResult.updatedContent
        }
      } catch (err) {
        console.error('[blog-post-process] Step 1 H2 diagram failed:', (err as Error).message)
      }
    }

    // Step 2: Thumbnail auto-assignment
    try {
      const { data: availableThumbnail } = await supabaseServiceRole
        .from('thumbnail_stock')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: true })
        .limit(1)
        .single()

      if (availableThumbnail) {
        await supabaseServiceRole.rpc('increment_thumbnail_usage', {
          thumbnail_id: availableThumbnail.id,
        })
        await supabaseServiceRole
          .from('posts')
          .update({ thumbnail_url: availableThumbnail.url })
          .eq('id', postId)
      }
    } catch (err) {
      console.error('[blog-post-process] Step 2 thumbnail failed:', (err as Error).message)
    }

    // Step 3: Vector links (related articles)
    try {
      const vectorLinks = generateVectorLinks(categorySlug, topic, targetKeyword)
      const vectorLinksSection = `\n\n---\n\n## 関連記事・おすすめコンテンツ {#related-content}\n\n${vectorLinks.map((link, index) => `${index + 1}. **[${link.title}](${link.url})** - ${link.description}`).join('\n')}\n\n---\n`
      enhancedContent = enhancedContent + vectorLinksSection
    } catch (err) {
      console.error('[blog-post-process] Step 3 vector links failed:', (err as Error).message)
    }

    // Step 4: Fragment ID extraction + vectorization
    try {
      const fragmentVectorizer = new FragmentVectorizer()
      const fragmentResult =
        await fragmentVectorizer.extractAndVectorizeFromMarkdown(
          enhancedContent,
          {
            post_id: postId,
            post_title: title,
            slug: slug,
            page_path: `/posts/${slug}`,
            category: categorySlug,
            seo_keywords: seoKeywords,
          }
        )

      if (fragmentResult.success) {
        extractedFragmentIds.push(
          ...fragmentResult.extractedFragments.map(
            (f: { fragment_id: string }) => f.fragment_id
          )
        )
      }
    } catch (err) {
      console.error('[blog-post-process] Step 4 fragment vectorization failed:', (err as Error).message)
    }

    // Step 5: FAQ entity generation
    let faqEntities: unknown[] = []
    try {
      const faqSectionRegex = /## よくある質問[\s\S]*?(?=\n##[^#]|$)/i
      const faqMatch = enhancedContent.match(faqSectionRegex)

      if (faqMatch) {
        const faqItems: Array<{
          question: string
          answer: string
          index: number
        }> = []
        const faqQARegex =
          /### Q:\s*([^{]+?)(?:\s*\{#faq-(\d+)\})?\s*\n\s*A:\s*([^#]+?)(?=\n\s*###|\n\s*##|$)/g
        let faqMatchInner
        let faqIndex = 1

        while (
          (faqMatchInner = faqQARegex.exec(faqMatch[0])) !== null
        ) {
          faqItems.push({
            question: faqMatchInner[1].trim(),
            answer: faqMatchInner[3].trim(),
            index: faqMatchInner[2]
              ? parseInt(faqMatchInner[2])
              : faqIndex,
          })
          faqIndex++
        }

        if (faqItems.length > 0) {
          faqEntities = generateBlogFAQEntities(
            {
              id: postId,
              title: title,
              slug: slug,
              content: enhancedContent,
            },
            faqItems
          )
        }
      }
    } catch (err) {
      console.error('[blog-post-process] Step 5 FAQ entities failed:', (err as Error).message)
    }

    // Step 6: Unified structured data (Mike King theory)
    let pageSchema: unknown = null
    try {
      const structuredDataSystem = new UnifiedStructuredDataSystem(
        'https://nands.tech'
      )
      pageSchema =
        structuredDataSystem.generateWebPageSchemaWithHasPart({
          path: `/posts/${slug}`,
          title: title,
          description: metaDescription || title,
          serviceType: 'BlogPost',
          fragmentIds: extractedFragmentIds,
          lastModified: new Date().toISOString(),
        })
    } catch (err) {
      console.error('[blog-post-process] Step 6 structured data failed:', (err as Error).message)
    }

    // Step 7: AI search optimization (4 AI search engines)
    let aiEnhancedData: unknown = null
    let aiEnhancedStructuredDataJSON: unknown = null
    try {
      aiEnhancedData = await generateCompleteAIEnhancedUnifiedPageData(
        {
          pageSlug: `posts/${slug}`,
          pageTitle: title,
          keywords: seoKeywords.length > 0
            ? seoKeywords
            : [targetKeyword, topic],
          category: categorySlug,
        },
        ['ChatGPT', 'Perplexity', 'Claude', 'Gemini']
      )
      aiEnhancedStructuredDataJSON =
        generateCompleteAIEnhancedStructuredDataJSON(aiEnhancedData as any)
    } catch (err) {
      console.error('[blog-post-process] Step 7 AI search optimization failed:', (err as Error).message)
    }

    // Step 8: Save metadata + update content
    try {
      await supabaseServiceRole
        .from('posts')
        .update({
          content: enhancedContent,
          metadata: {
            structuredData: pageSchema,
            faqEntities: faqEntities,
            fragmentIds: extractedFragmentIds,
            generatedAt: new Date().toISOString(),
            aiEnhancedData: aiEnhancedData,
            aiEnhancedStructuredDataJSON: aiEnhancedStructuredDataJSON,
            aiSearchOptimizedAt: new Date().toISOString(),
            generationType: 'worker-pipeline',
          },
        })
        .eq('id', postId)
    } catch (err) {
      console.error('[blog-post-process] Step 8 metadata save failed:', (err as Error).message)
    }

    // Step 9: Clean up temporary RAG data
    try {
      await supabaseServiceRole
        .from('hybrid_scraped_keywords')
        .delete()
        .gte('id', 0)
      await supabaseServiceRole
        .from('hybrid_deep_research')
        .delete()
        .gte('id', 0)
    } catch (err) {
      console.error('[blog-post-process] Step 9 cleanup failed:', (err as Error).message)
    }

    return NextResponse.json({
      success: true,
      fragmentIds: extractedFragmentIds,
      structuredData: pageSchema,
      aiEnhancedData: aiEnhancedData,
      faqEntityCount: faqEntities.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Post-processing failed',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}

// Vector link generation (same logic as generate-hybrid-blog/route.ts)
interface VectorLink {
  title: string
  url: string
  description: string
}

function generateVectorLinks(
  categorySlug: string,
  _topic: string,
  _targetKeyword: string
): VectorLink[] {
  const mandatoryLinks: VectorLink[] = [
    {
      title: 'NANDSトップページ',
      url: 'https://nands.tech/',
      description:
        'AI時代のキャリア支援から最新技術開発まで、包括的なソリューションを提供',
    },
    {
      title: 'NANDSのAIサイト',
      url: 'https://nands.tech/ai-site',
      description:
        'AIに引用されるサイト構築。ChatGPT・Claude・Perplexityが正確に理解・引用するデジタル資産',
    },
  ]

  const categoryRelatedLinks: Record<string, VectorLink[]> = {
    marketing: [
      {
        title: 'AIO対策・SEO最適化',
        url: 'https://nands.tech/aio-seo',
        description:
          'レリバンスエンジニアリングによるAI時代のSEO最適化サービス',
      },
      {
        title: 'SNS自動化',
        url: 'https://nands.tech/sns-automation',
        description:
          'AI活用のSNS投稿自動化とコンテンツ生成。ブランド認知度向上を実現',
      },
      {
        title: '動画生成サービス',
        url: 'https://nands.tech/video-generation',
        description:
          'AI技術を活用した動画コンテンツ生成。マーケティング効果を最大化',
      },
    ],
    programming: [
      {
        title: 'システム開発',
        url: 'https://nands.tech/system-development',
        description:
          'Webアプリケーション開発からAI統合システムまで幅広く対応',
      },
      {
        title: 'AIエージェント開発',
        url: 'https://nands.tech/ai-agents',
        description:
          'Mastra Framework活用の自律型AIエージェント開発。業務自動化を実現',
      },
      {
        title: 'MCPサーバー開発',
        url: 'https://nands.tech/mcp-servers',
        description:
          'Model Context Protocol対応のカスタムサーバー開発',
      },
    ],
    'ai-technology': [
      {
        title: 'AIエージェント開発',
        url: 'https://nands.tech/ai-agents',
        description:
          'Mastra Framework活用の自律型AIエージェント開発。業務自動化を実現',
      },
      {
        title: 'チャットボット開発',
        url: 'https://nands.tech/chatbot-development',
        description:
          'ChatGPT・Claude統合チャットボット。顧客対応を24時間自動化',
      },
      {
        title: 'ベクトルRAG検索',
        url: 'https://nands.tech/vector-rag',
        description:
          '企業内文書の意味的検索システム。検索精度95%向上を実現',
      },
    ],
    business: [
      {
        title: '法人向けリスキリング',
        url: 'https://nands.tech/reskilling',
        description:
          '企業のDX推進を支援する法人向け人材育成プログラム',
      },
      {
        title: '人材ソリューション',
        url: 'https://nands.tech/hr-solutions',
        description:
          'AIを活用した人事・労務支援サービス。法令準拠で安心サポート',
      },
      {
        title: 'システム開発',
        url: 'https://nands.tech/system-development',
        description:
          'Webアプリケーション開発からAI統合システムまで幅広く対応',
      },
    ],
    career: [
      {
        title: '個人向けリスキリング',
        url: 'https://nands.tech/fukugyo',
        description:
          'AI副業・キャリアアップを支援するスキル習得プログラム',
      },
      {
        title: '法人向けリスキリング',
        url: 'https://nands.tech/reskilling',
        description:
          '企業のDX推進を支援する法人向け人材育成プログラム',
      },
      {
        title: '人材ソリューション',
        url: 'https://nands.tech/hr-solutions',
        description: 'AIを活用した人事・労務支援サービス',
      },
    ],
  }

  const defaultLinks: VectorLink[] = [
    {
      title: 'システム開発',
      url: 'https://nands.tech/system-development',
      description:
        'Webアプリケーション開発からAI統合システムまで幅広く対応',
    },
    {
      title: 'AIO対策・SEO最適化',
      url: 'https://nands.tech/aio-seo',
      description:
        'レリバンスエンジニアリングによるAI時代のSEO最適化サービス',
    },
    {
      title: '法人向けリスキリング',
      url: 'https://nands.tech/reskilling',
      description:
        '企業のDX推進を支援する法人向け人材育成プログラム',
    },
  ]

  const relatedLinks = categoryRelatedLinks[categorySlug] || defaultLinks
  return [...mandatoryLinks, ...relatedLinks.slice(0, 3)]
}