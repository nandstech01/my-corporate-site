import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarkdownContent from '@/components/blog/MarkdownContent'
import TOCComponent from '@/components/blog/TOCComponent'
// 🆕 YouTubeショート動画スライダー
import YouTubeShortSlider, { type YouTubeShortVideo } from '@/components/blog/YouTubeShortSlider'

// 関連情報抽出関数
interface RelatedInfoLink {
  title: string;
  url: string;
  type: 'related' | 'faq';
}

function extractRelatedInfo(content: string): RelatedInfoLink[] {
  let relatedInfoSection = content.match(/###\s*📚\s*関連情報[\s\S]*?(?=\n##|\n---|\n$)/i);
  
  if (!relatedInfoSection) {
    const altPattern = content.match(/📚\s*関連情報[\s\S]*$/i);
    if (!altPattern) return [];
    relatedInfoSection = altPattern;
  }

  const links = relatedInfoSection[0].match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/g);
  if (!links) return [];

  const result: RelatedInfoLink[] = [];
  for (const link of links) {
    const match = link.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      const title = match[1];
      const url = match[2];
      const type: 'related' | 'faq' = title.includes('よくある質問') ? 'faq' : 'related';
      result.push({ title, url, type });
    }
  }
  return result;
}
import Script from 'next/script'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'
import { RefreshCw } from 'lucide-react'
import { UnifiedStructuredDataSystem } from '@/lib/structured-data'
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system'
import { HowToFAQSchemaSystem } from '@/lib/structured-data/howto-faq-schema'
import { HARADA_KENJI_PROFILE, AuthorTrustSystem } from '@/lib/structured-data/author-trust-system'
// 🆕 YouTubeショート動画4大AI検索エンジン最適化
import { generateAIOptimizedYouTubeShortSchema, type YouTubeShortEntity } from '@/lib/structured-data/youtube-short-schema'
import type { YouTubeShortInfo } from '@/lib/youtube/youtube-data-api'

// BreadcrumbItemの型定義
interface BreadcrumbItem {
  name: string;
  path: string;
}

// 型定義
interface Post {
  id: number | string
  title: string
  content: string
  slug: string
  business_id?: number
  category_id?: number
  thumbnail_url?: string
  featured_image?: string
  meta_description?: string
  meta_keywords?: string[]
  canonical_url?: string
  status: string
  published_at: string
  created_at: string
  updated_at: string
  author_id?: number
  section_id?: number
  categories?: any[]
  excerpt?: string
  tags?: string[]
  seo_keywords?: string[]
  youtube_script_id?: number | null
}

// YouTube動画情報の型定義
interface YouTubeScriptInfo {
  id: number
  youtube_video_id: string | null
  youtube_url: string | null
  script_title: string
  script_hook: string
  thumbnail_url: string | null
  embed_url: string | null
  status: string
  fragment_id?: string | null  // 🆕 Fragment ID（ディープリンク用）
  complete_uri?: string | null  // 🆕 Complete URI（ベクトルリンク用）
}

interface PageProps {
  params: {
    slug: string
  }
}

// 🚀 記事取得（ISR最適化 - キャッシュなしでISR十分）
async function getPost(slug: string): Promise<Post | null> {
  const supabase = createClient()
  
  // URLデコードを安全に実行
  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (error) {
    console.error('❌ URL decode error:', error);
    decodedSlug = slug;
  }
  
  try {
    const isLongSlug = decodedSlug.length > 50 || slug.length > 100;
    
    // まず正確なslugで検索（新しいpostsテーブル）
    let { data: newPost, error: newError } = await supabase
      .from('posts')
      .select('*, youtube_script_id')
      .eq('status', 'published')
      .eq('slug', decodedSlug)
      .single()
    
    if (newError && newError.code !== 'PGRST116') {
      console.error('❌ postsテーブル検索エラー:', newError)
    }
    
    if (newPost) {
      return newPost
    }
    
    // 新しいテーブルで見つからない場合、古いテーブルを検索
    let { data: oldPost, error: oldError } = await supabase
      .from('chatgpt_posts')
      .select('*')
      .eq('status', 'published')
      .eq('slug', decodedSlug)
      .single()
    
    if (oldError && oldError.code !== 'PGRST116') {
      console.error('❌ chatgpt_postsテーブル検索エラー:', oldError)
    }
    
    if (oldPost) {
      return oldPost
    }
    
    // 長いslugの場合は部分検索を実行
    if (isLongSlug) {
      const { data: partialResults } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .or(`slug.ilike.%${decodedSlug.substring(0, 40)}%,slug.ilike.%${slug.substring(0, 40)}%`)
        .limit(5)
      
      if (partialResults && partialResults.length > 0) {
        return partialResults[0]
      }
    }
    
    return null
    
  } catch (error) {
    console.error('❌ getPost完全失敗:', error)
    return null
  }
}

// フォールバック検索関数
async function performFallbackSearch(supabase: any, decodedSlug: string): Promise<Post | null> {
  try {
    console.log('🔄 フォールバック: 全記事検索を実行');
    const { data: allPosts, error: allError } = await supabase
      .from('chatgpt_posts')
      .select(`
        *,
        categories:category_id(name, slug)
      `)
      .eq('status', 'published');
    
    if (allError) {
      console.error('全記事取得エラー:', allError);
      return null;
    }
    
    // JavaScriptで完全一致検索
    const matchedPost = allPosts?.find((post: any) => post.slug === decodedSlug);
    if (matchedPost) {
      console.log('✅ フォールバック検索で記事を発見');
      return matchedPost;
    }
      
  } catch (fallbackError) {
    console.error('フォールバック検索エラー:', fallbackError);
  }
  
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: '記事が見つかりません | 株式会社エヌアンドエス',
      description: 'お探しの記事が見つかりませんでした。'
    }
  }
  
  const title = post.title
  const description = post.meta_description || post.excerpt || `${post.content.substring(0, 160)}...`
  const keywords = post.meta_keywords || post.seo_keywords || []
  const imageUrl = post.thumbnail_url || post.featured_image || '/images/default-post.jpg'
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
  
  return {
    title: `${title} | 株式会社エヌアンドエス`,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${title} | 株式会社エヌアンドエス`,
      description,
      type: 'article',
      url: `https://nands.tech/posts/${params.slug}`,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      siteName: '株式会社エヌアンドエス',
      locale: 'ja_JP',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: ['株式会社エヌアンドエス'],
      tags: ['AI', 'ビジネス', 'テクノロジー', ...keywords].filter(Boolean)
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nands_tech',
      creator: '@nands_tech',
      title: `${title} | 株式会社エヌアンドエス`,
      description,
      images: [fullImageUrl]
    },
    alternates: {
      canonical: `https://nands.tech/posts/${params.slug}`
    }
  }
}

// 🚀 ISR（Incremental Static Regeneration）設定
// 本番環境でのSupabase+SSG問題を回避するため、一時的にISRのみ使用
export const revalidate = 300 // 5分間隔でISR実行

// 🚨 一時的にSSGを無効化 - generateStaticParamsをコメントアウト
// 本番環境でのSupabase cookiesエラーを回避
/*
export async function generateStaticParams() {
  const supabase = createClient()
  
  try {
    console.log('🔄 SSG: 記事一覧を取得中...')
    
    // postsテーブルから公開済み記事のslugを取得
    const { data: newPosts, error: newPostsError } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (newPostsError) {
      console.error('❌ SSG: postsテーブル取得エラー:', newPostsError)
    }
    
    // chatgpt_postsテーブルから公開済み記事のslugを取得
    const { data: oldPosts, error: oldPostsError } = await supabase
      .from('chatgpt_posts')
      .select('slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (oldPostsError) {
      console.error('❌ SSG: chatgpt_postsテーブル取得エラー:', oldPostsError)
    }
    
    // 安全にslugを結合（nullチェック追加）
    const allSlugs = [
      ...(newPosts || []).filter(post => post.slug).map(post => ({ slug: post.slug })),
      ...(oldPosts || []).filter(post => post.slug).map(post => ({ slug: post.slug }))
    ]
    
    // 重複するslugを除去
    const uniqueSlugs = allSlugs.filter((item, index, self) => 
      index === self.findIndex(t => t.slug === item.slug)
    )
    
    console.log(`✅ SSG: ${uniqueSlugs.length}件の記事をビルド時に静的生成`)
    console.log('📋 SSG対象記事:', uniqueSlugs.slice(0, 5).map(item => item.slug))
    
    return uniqueSlugs
    
  } catch (error) {
    console.error('❌ SSG: generateStaticParams完全失敗:', error)
    // エラー時は空配列を返して本番ビルドを続行
    return []
  }
}
*/

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  // 🎬 YouTube動画情報を取得（中尺動画 + ショート動画スライダー）
  let youtubeScript: YouTubeScriptInfo | null = null  // 中尺動画（サムネの代わり）
  let youtubeAIOptimizedSchema: any = null // 中尺動画の4大AI検索エンジン最適化Schema
  
  // 🆕 ショート動画スライダー用
  let youtubeShortVideos: YouTubeShortVideo[] = []
  let youtubeShortSchemas: any[] = []
  
  // ★ 記事IDで関連する全てのYouTube台本を取得
  if (post.id) {
    try {
      const supabase = createClient()
      const { data: allScripts, error } = await supabase
        .from('company_youtube_shorts')
        .select('*')
        .eq('related_blog_post_id', post.id)
        .eq('status', 'published')
      
      if (allScripts && !error && allScripts.length > 0) {
        // ★ 中尺動画とショート動画を分離
        const mediumScript = allScripts.find((s: any) => s.content_type === 'youtube-medium' && s.youtube_video_id)
        const shortScripts = allScripts.filter((s: any) => s.content_type === 'youtube-short' && s.youtube_video_id)
        
        console.log('📊 YouTube動画取得結果:', {
          medium: mediumScript ? `あり（ID: ${mediumScript.youtube_video_id}）` : 'なし',
          shorts: shortScripts.length > 0 ? `${shortScripts.length}件` : 'なし'
        })
        
        // 🎬 中尺動画の処理（既存ロジック維持）
        if (mediumScript) {
          youtubeScript = {
            id: mediumScript.id,
            youtube_video_id: mediumScript.youtube_video_id,
            youtube_url: mediumScript.youtube_url,
            script_title: mediumScript.script_title,
            script_hook: mediumScript.script_hook,
            thumbnail_url: mediumScript.thumbnail_url,
            embed_url: mediumScript.embed_url,
            status: mediumScript.status,
            fragment_id: mediumScript.fragment_id,
            complete_uri: mediumScript.complete_uri
          } as YouTubeScriptInfo
          
          console.log('✅ 中尺動画情報取得成功:', youtubeScript.script_title)
          
          // 中尺動画の4大AI検索エンジン最適化Schema生成
          try {
            const shortInfo: YouTubeShortInfo = {
              videoId: mediumScript.youtube_video_id || '',
              title: mediumScript.script_title || '',
              description: mediumScript.description || mediumScript.content || '',
              publishedAt: mediumScript.published_at || mediumScript.created_at,
              thumbnailUrl: mediumScript.thumbnail_url || '',
              duration: `PT${mediumScript.script_duration_seconds || 130}S`,
              durationSeconds: mediumScript.script_duration_seconds || 130,
              viewCount: mediumScript.view_count || 0,
              likeCount: mediumScript.like_count || 0,
              commentCount: mediumScript.comment_count || 0,
              tags: mediumScript.tags || [],
              videoUrl: mediumScript.youtube_url,
              embedUrl: mediumScript.embed_url || `https://www.youtube.com/embed/${mediumScript.youtube_video_id}`,
              shortUrl: mediumScript.youtube_url,
              contentForEmbedding: mediumScript.content_for_embedding || mediumScript.content || ''
            }
            
            const entity: YouTubeShortEntity = {
              fragmentId: mediumScript.fragment_id || '',
              completeUri: mediumScript.complete_uri || '',
              videoId: mediumScript.youtube_video_id || '',
              title: mediumScript.script_title || '',
              description: mediumScript.description || mediumScript.content || '',
              category: mediumScript.category || 'ai-technology',
              tags: mediumScript.tags || [],
              targetQueries: mediumScript.target_queries || [],
              relatedEntities: mediumScript.related_entities || [],
              relatedBlogPostId: typeof post.id === 'number' ? post.id : parseInt(String(post.id)),
              relatedBlogPostSlug: params.slug,
              relatedBlogPostUrl: `https://nands.tech/posts/${params.slug}`,
              viralityScore: mediumScript.virality_score,
              targetEmotion: mediumScript.target_emotion,
              hookType: mediumScript.hook_type
            }
            
            console.log('🔗 中尺動画 Fragment ID:', entity.fragmentId || '❌ 未設定')
            console.log('🔗 中尺動画 Complete URI:', entity.completeUri || '❌ 未設定')
            
            youtubeAIOptimizedSchema = generateAIOptimizedYouTubeShortSchema(
              shortInfo,
              entity,
              `https://nands.tech/posts/${params.slug}`
            )
            
            console.log('🎯 中尺動画の4大AI検索エンジン最適化Schema生成成功')
          } catch (schemaError) {
            console.error('⚠️ 中尺動画Schema生成エラー:', schemaError)
          }
        }
        
        // 📱 ショート動画スライダーの処理（関連動画 + 最新動画で3件表示）
        // Step 1: 関連ショート動画を取得
        let displayShorts: any[] = shortScripts.slice(0, 3)
        const relatedShortIds = shortScripts.map((s: any) => s.id)
        
        console.log('📱 関連ショート動画:', displayShorts.length, '件')
        
        // Step 2: 3件に満たない場合、最新のショート動画を追加取得
        if (displayShorts.length < 3) {
          const neededCount = 3 - displayShorts.length
          console.log('📱 最新ショート動画を', neededCount, '件追加取得します')
          
          const { data: latestShorts, error: latestError } = await supabase
            .from('company_youtube_shorts')
            .select('*')
            .eq('content_type', 'youtube-short')
            .eq('status', 'published')
            .not('youtube_video_id', 'is', null)
            .not('id', 'in', `(${relatedShortIds.join(',')})`)
            .order('created_at', { ascending: false })
            .limit(neededCount)
          
          if (latestShorts && !latestError) {
            displayShorts = [...displayShorts, ...latestShorts]
            console.log('📱 最新ショート動画追加後:', displayShorts.length, '件')
          }
        }
        
        if (displayShorts.length > 0) {
          youtubeShortVideos = displayShorts.map((s: any) => ({
            id: s.id,
            videoId: s.youtube_video_id,
            url: s.youtube_url || `https://youtube.com/shorts/${s.youtube_video_id}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${s.youtube_video_id}`,
            title: s.script_title || post.title,
            hookText: s.script_hook,
            fragmentId: s.fragment_id,
            completeUri: s.complete_uri
          }))
          
          console.log('📱 ショート動画スライダー合計:', youtubeShortVideos.length, '件')
          
          // 各ショート動画のSchema生成
          for (const shortData of displayShorts) {
            try {
              const shortInfo: YouTubeShortInfo = {
                videoId: shortData.youtube_video_id || '',
                title: shortData.script_title || '',
                description: shortData.description || shortData.content || '',
                publishedAt: shortData.published_at || shortData.created_at,
                thumbnailUrl: shortData.thumbnail_url || '',
                duration: `PT${shortData.script_duration_seconds || 30}S`,
                durationSeconds: shortData.script_duration_seconds || 30,
                viewCount: shortData.view_count || 0,
                likeCount: shortData.like_count || 0,
                commentCount: shortData.comment_count || 0,
                tags: shortData.tags || [],
                videoUrl: shortData.youtube_url,
                embedUrl: `https://www.youtube-nocookie.com/embed/${shortData.youtube_video_id}`,
                shortUrl: shortData.youtube_url,
                contentForEmbedding: shortData.content_for_embedding || shortData.content || ''
              }
              
              const entity: YouTubeShortEntity = {
                fragmentId: shortData.fragment_id || '',
                completeUri: shortData.complete_uri || '',
                videoId: shortData.youtube_video_id || '',
                title: shortData.script_title || '',
                description: shortData.description || shortData.content || '',
                category: shortData.category || 'ai-technology',
                tags: shortData.tags || [],
                targetQueries: shortData.target_queries || [],
                relatedEntities: shortData.related_entities || [],
                relatedBlogPostId: typeof post.id === 'number' ? post.id : parseInt(String(post.id)),
                relatedBlogPostSlug: params.slug,
                relatedBlogPostUrl: `https://nands.tech/posts/${params.slug}`,
                viralityScore: shortData.virality_score,
                targetEmotion: shortData.target_emotion,
                hookType: shortData.hook_type
              }
              
              const shortSchema = generateAIOptimizedYouTubeShortSchema(
                shortInfo,
                entity,
                `https://nands.tech/posts/${params.slug}`
              )
              
              youtubeShortSchemas.push(shortSchema)
              console.log('🔗 ショート動画 Fragment ID:', entity.fragmentId)
            } catch (schemaError) {
              console.error('⚠️ ショート動画Schema生成エラー:', schemaError)
            }
          }
          
          console.log('📱 ショート動画Schema生成完了:', youtubeShortSchemas.length, '件')
        }
      }
      
      // 📱 関連動画が0件の場合でも最新ショート動画を3件取得
      if (youtubeShortVideos.length === 0) {
        console.log('📱 関連ショート動画なし。最新ショート動画を3件取得します')
        
        const { data: latestShorts, error: latestError } = await supabase
          .from('company_youtube_shorts')
          .select('*')
          .eq('content_type', 'youtube-short')
          .eq('status', 'published')
          .not('youtube_video_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (latestShorts && !latestError && latestShorts.length > 0) {
          youtubeShortVideos = latestShorts.map((s: any) => ({
            id: s.id,
            videoId: s.youtube_video_id,
            url: s.youtube_url || `https://youtube.com/shorts/${s.youtube_video_id}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${s.youtube_video_id}`,
            title: s.script_title || post.title,
            hookText: s.script_hook,
            fragmentId: s.fragment_id,
            completeUri: s.complete_uri
          }))
          
          console.log('📱 最新ショート動画取得:', youtubeShortVideos.length, '件')
          
          // Schema生成
          for (const shortData of latestShorts) {
            try {
              const shortInfo: YouTubeShortInfo = {
                videoId: shortData.youtube_video_id || '',
                title: shortData.script_title || '',
                description: shortData.description || shortData.content || '',
                publishedAt: shortData.published_at || shortData.created_at,
                thumbnailUrl: shortData.thumbnail_url || '',
                duration: `PT${shortData.script_duration_seconds || 30}S`,
                durationSeconds: shortData.script_duration_seconds || 30,
                viewCount: shortData.view_count || 0,
                likeCount: shortData.like_count || 0,
                commentCount: shortData.comment_count || 0,
                tags: shortData.tags || [],
                videoUrl: shortData.youtube_url,
                embedUrl: `https://www.youtube-nocookie.com/embed/${shortData.youtube_video_id}`,
                shortUrl: shortData.youtube_url,
                contentForEmbedding: shortData.content_for_embedding || shortData.content || ''
              }
              
              const entity: YouTubeShortEntity = {
                fragmentId: shortData.fragment_id || '',
                completeUri: shortData.complete_uri || '',
                videoId: shortData.youtube_video_id || '',
                title: shortData.script_title || '',
                description: shortData.description || shortData.content || '',
                category: shortData.category || 'ai-technology',
                tags: shortData.tags || [],
                targetQueries: shortData.target_queries || [],
                relatedEntities: shortData.related_entities || [],
                relatedBlogPostId: typeof post.id === 'number' ? post.id : parseInt(String(post.id)),
                relatedBlogPostSlug: params.slug,
                relatedBlogPostUrl: `https://nands.tech/posts/${params.slug}`,
                viralityScore: shortData.virality_score,
                targetEmotion: shortData.target_emotion,
                hookType: shortData.hook_type
              }
              
              const shortSchema = generateAIOptimizedYouTubeShortSchema(
                shortInfo,
                entity,
                `https://nands.tech/posts/${params.slug}`
              )
              
              youtubeShortSchemas.push(shortSchema)
            } catch (schemaError) {
              console.error('⚠️ 最新ショート動画Schema生成エラー:', schemaError)
            }
          }
        }
      }
    } catch (error) {
      console.error('⚠️ YouTube動画情報取得エラー:', error)
      // エラーは無視して記事は表示
    }
  }
  
  // Mike King理論準拠: 統合構造化データシステム初期化
  const structuredDataSystem = new UnifiedStructuredDataSystem('https://nands.tech')
  const autoTOCSystem = new AutoTOCSystem({
    minLevel: 1,  // H1から含める
    maxLevel: 3   // H3まで含める
  })
  const howToFAQSystem = new HowToFAQSchemaSystem()

  // 記事内容からTOC抽出（見出し分析）
  const tocData = autoTOCSystem.generateTOCFromHTML(post.content)
  console.log('🔧 generateTOCFromHTML結果:', tocData);
  console.log('📋 tocData.toc:', tocData.toc);
  const hasFragmentIds = tocData.toc.length > 0

  // 関連情報抽出
  const relatedInfo = extractRelatedInfo(post.content)

  // 記事内容からFAQ・HOW TO自動抽出
  const faqData = howToFAQSystem.extractFAQFromContent(post.content)
  const howToData = howToFAQSystem.extractHowToFromContent(post.content, post.title)

  // 🎯 ベクトルブログ専用: 動的FAQ Fragment IDエンティティ生成
  const dynamicBlogSchema = faqData.length > 0 ? structuredDataSystem.generateBlogPageSchemaWithDynamicFAQs({
    path: `/posts/${params.slug}`,
    title: post.title,
    description: post.meta_description || post.excerpt || '',
    slug: params.slug,
    postId: typeof post.id === 'number' ? post.id : parseInt(String(post.id)),
    content: post.content,
    lastModified: post.updated_at,
    faqItems: faqData.map((faq: any, index: number) => ({
      question: faq.question,
      answer: faq.answer,
      index: index
    })),
    toc: tocData.toc.map((item: any) => ({
      id: item.anchor || item.id,
      title: item.title,
      level: item.level,
      anchor: item.anchor || item.id
    }))
  }) : null

  // パンくずリスト構造化データ
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '記事一覧', path: '/posts' }
  ];
  
  if (post.categories && post.categories.length > 0) {
    breadcrumbItems.push({ 
      name: post.categories[0].name, 
      path: `/categories/${post.categories[0].slug}` 
    });
  }
  
  breadcrumbItems.push({ name: post.title, path: `/posts/${params.slug}` });

  // BreadcrumbList構造化データ
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://nands.tech${item.path}`
    }))
  }

  // 著者情報（Google E-E-A-T準拠・ORCID対応・sameAs統合）
  const authorTrustSystem = new AuthorTrustSystem()
  const authorSchema = authorTrustSystem.generateAuthorSchema()

  // Mike King理論準拠: BlogPosting + hasPart + AIO LLMO最適化（Google 2024年ガイドライン対応）
  const enhancedStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://nands.tech/posts/${params.slug}#article`,
    "headline": post.title,
    "alternativeHeadline": post.meta_description || `${post.content.substring(0, 100)}...`,
    "description": post.meta_description || post.excerpt || `${post.content.substring(0, 160)}...`,
    "abstract": post.meta_description || post.excerpt || `${post.content.substring(0, 200)}...`,
    "image": {
      "@type": "ImageObject",
      "url": post.thumbnail_url || post.featured_image || "https://nands.tech/images/default-post.jpg",
      "width": 1200,
      "height": 630,
      "caption": post.title,
      "alt": post.title
    },
    
    // YouTube動画を関連メディアとして統合
    ...(youtubeAIOptimizedSchema && {
      "associatedMedia": {
        "@type": "VideoObject",
        "@id": youtubeAIOptimizedSchema["@id"],
        "name": youtubeAIOptimizedSchema.name,
        "description": youtubeAIOptimizedSchema.description,
        "thumbnailUrl": youtubeAIOptimizedSchema.thumbnailUrl,
        "contentUrl": youtubeAIOptimizedSchema.contentUrl,
        "embedUrl": youtubeAIOptimizedSchema.embedUrl,
        "uploadDate": youtubeAIOptimizedSchema.uploadDate,
        "duration": youtubeAIOptimizedSchema.duration
      }
    }),
    
    // 著者情報強化（E-E-A-T対策）
    "author": authorSchema,
    "publisher": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス",
      "legalName": "株式会社エヌアンドエス",
      "url": "https://nands.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nands.tech/logo.png",
        "width": 600,
        "height": 60
      },
      "foundingDate": "2008",
      "description": "Mike King理論準拠のレリバンスエンジニアリング実装企業。AI技術コンサルティング、退職代行サービス、生成AI最適化を提供。",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "皇子が丘２丁目10-25-3004号",
        "addressLocality": "大津市",
        "addressRegion": "滋賀県",
        "postalCode": "520-0025",
        "addressCountry": "JP"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@nands.tech",
        "contactType": "customer service",
        "availableLanguage": ["Japanese", "English"]
      },
      "areaServed": {
        "@type": "Country",
        "name": "日本"
      },
      "serviceArea": {
        "@type": "Country",
        "name": "日本"
      }
    },
    
    // 日時情報
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "dateCreated": post.created_at,
    
    // ページ情報
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nands.tech/posts/${params.slug}`,
      "url": `https://nands.tech/posts/${params.slug}`,
      "name": post.title,
      "description": post.meta_description || post.excerpt,
      "inLanguage": "ja-JP",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://nands.tech/#website",
        "name": "株式会社エヌアンドエス"
      }
    },

    // SEO & トピカルカバレッジ
    "keywords": post.meta_keywords || post.seo_keywords || [],
    "about": [
      {
        "@type": "Thing",
        "name": post.categories?.[0]?.name || "AI・ビジネス・テクノロジー"
      },
      // YouTube動画のトピック統合
      ...(youtubeAIOptimizedSchema ? [{
        "@type": "Thing",
        "name": "動画コンテンツ",
        "url": youtubeAIOptimizedSchema.contentUrl
      }] : [])
    ],
    "mentions": [
      {
        "@type": "Organization",
        "name": "OpenAI",
        "sameAs": "https://openai.com"
      },
      {
        "@type": "Organization", 
        "name": "ChatGPT",
        "sameAs": "https://chat.openai.com"
      },
      // YouTube中尺動画エンティティ統合（ベクトルリンク化済み）
      ...(youtubeAIOptimizedSchema ? [{
        "@type": "VideoObject",
        "@id": youtubeAIOptimizedSchema["@id"],
        "name": youtubeAIOptimizedSchema.name,
        "url": youtubeAIOptimizedSchema.contentUrl,
        "sameAs": youtubeAIOptimizedSchema.embedUrl
      }] : []),
      // 📱 YouTubeショート動画エンティティ統合（ベクトルリンク化済み）
      ...youtubeShortSchemas.map((shortSchema: any) => ({
        "@type": "VideoObject",
        "@id": shortSchema["@id"],
        "name": shortSchema.name,
        "url": shortSchema.contentUrl,
        "sameAs": shortSchema.embedUrl
      }))
    ],

    // 言語・地域情報
    "inLanguage": "ja-JP",
    "contentLocation": {
      "@type": "Place",
      "name": "日本"
    },
    "spatialCoverage": {
      "@type": "Place", 
      "name": "日本"
    },

    // カテゴリ・セクション
    "articleSection": post.categories?.[0]?.name || "記事",
    "genre": "Business Technology",
    "audience": {
      "@type": "Audience",
      "audienceType": "Business Professional",
      "geographicArea": {
        "@type": "Place",
        "name": "日本"
      }
    },

    // Word Count & Reading Time
    "wordCount": post.content.split(/\s+/).length,
    "timeRequired": `PT${Math.ceil(post.content.split(/\s+/).length / 200)}M`,

    // Mike King理論: hasPartスキーマ（GEO最適化 + YouTube動画統合）
    ...(hasFragmentIds && {
      "hasPart": [
        // TOCセクション
        ...tocData.toc.map((item: any, index: number) => ({
          "@type": "WebPageElement",
          "@id": `https://nands.tech/posts/${params.slug}#${item.anchor || item.id}`,
          "name": item.title,
          "description": `${post.title}の第${index + 1}セクション: ${item.title}`,
          "url": `https://nands.tech/posts/${params.slug}#${item.anchor || item.id}`,
          "position": index + 1,
          "mainContentOfPage": false,
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [`#${item.anchor || item.id}`]
          }
        })),
        // YouTube中尺動画セクション（ベクトルリンク化済み）
        ...(youtubeAIOptimizedSchema ? [{
          "@type": "VideoObject",
          "@id": youtubeAIOptimizedSchema["@id"],
          "name": youtubeAIOptimizedSchema.name,
          "description": youtubeAIOptimizedSchema.description,
          "thumbnailUrl": youtubeAIOptimizedSchema.thumbnailUrl,
          "uploadDate": youtubeAIOptimizedSchema.uploadDate,
          "duration": youtubeAIOptimizedSchema.duration,
          "contentUrl": youtubeAIOptimizedSchema.contentUrl,
          "embedUrl": youtubeAIOptimizedSchema.embedUrl,
          "position": tocData.toc.length + 1,
          "mainContentOfPage": false,
          "isPartOf": {
            "@type": "Article",
            "@id": `https://nands.tech/posts/${params.slug}#article`
          }
        }] : []),
        // 📱 YouTubeショート動画スライダー（新規追加・ベクトルリンク化済み）
        ...youtubeShortSchemas.map((shortSchema: any, index: number) => ({
          "@type": "VideoObject",
          "@id": shortSchema["@id"],
          "name": shortSchema.name,
          "description": shortSchema.description,
          "thumbnailUrl": shortSchema.thumbnailUrl,
          "uploadDate": shortSchema.uploadDate,
          "duration": shortSchema.duration || "PT30S",
          "contentUrl": shortSchema.contentUrl,
          "embedUrl": shortSchema.embedUrl,
          "position": tocData.toc.length + (youtubeAIOptimizedSchema ? 2 : 1) + index,
          "mainContentOfPage": false,
          "mentions": {
            "@type": "Article",
            "@id": `https://nands.tech/posts/${params.slug}#article`
          }
        })),
        // 著者セクション（E-E-A-T最適化・ベクトルリンク化）
        {
          "@type": "Person",
          "@id": `https://nands.tech/posts/${params.slug}#author-profile`,
          "name": authorSchema.name,
          "jobTitle": authorSchema.jobTitle,
          "description": authorSchema.description,
          "url": `https://nands.tech/posts/${params.slug}#author-profile`,
          "position": tocData.toc.length + (youtubeAIOptimizedSchema ? 2 : 1) + youtubeShortSchemas.length,
          "mainContentOfPage": false,
          "isPartOf": {
            "@type": "Article",
            "@id": `https://nands.tech/posts/${params.slug}#article`
          }
        }
      ]
    }),

    // AIO LLMO: FAQ構造化データ（自動抽出）
    ...(faqData.length > 0 && {
      "mainEntity": faqData.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
          "author": {
            "@type": "Person",
            "name": "原田賢治"
          }
        }
      }))
    }),

    // Google音声検索最適化
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".faq-section"]
    },

    // Googleニュース最適化
    "isAccessibleForFree": true,
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://nands.tech/#website"
    }
  }

  // HOW TO構造化データ（別スキーマ）
  const howToSchema = howToData.steps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `https://nands.tech/posts/${params.slug}#howto`,
    "name": `${post.title} - 実装ガイド`,
    "description": `${post.title}の具体的な実装手順をステップバイステップで解説`,
    "image": post.thumbnail_url || post.featured_image || "https://nands.tech/images/default-post.jpg",
    "totalTime": `PT${howToData.steps.length * 5}M`,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "JPY", 
      "value": "0"
    },
    "step": howToData.steps.map((step: any, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "url": `https://nands.tech/posts/${params.slug}#step-${index + 1}`
    }))
  } : null

  // 関連情報を抽出する関数
  interface RelatedInfoLink {
    title: string;
    url: string;
    type: 'related' | 'faq';
  }

  function extractRelatedInfo(content: string): RelatedInfoLink[] {
    let relatedInfoSection = content.match(/###\s*📚\s*関連情報[\s\S]*?(?=\n##|\n---|\n$)/i);
    if (!relatedInfoSection) {
      const altPattern = content.match(/📚\s*関連情報[\s\S]*$/i);
      if (!altPattern) return [];
      relatedInfoSection = altPattern;
    }

    const links = relatedInfoSection[0].match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/g);
    if (!links) return [];

    const result: RelatedInfoLink[] = [];
    for (const link of links) {
      const match = link.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const title = match[1];
        const url = match[2];
        const type: 'related' | 'faq' = title.includes('よくある質問') ? 'faq' : 'related';
        result.push({ title, url, type });
      }
    }
    return result;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      {/* Mike King理論準拠: 統合構造化データ */}
      <Script
        id="structured-data-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enhancedStructuredData) }}
      />
      
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Script
        id="structured-data-author"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      {howToSchema && (
        <Script
          id="structured-data-howto"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}

      {/* 🎯 動的FAQ Fragment ID構造化データ */}
      {dynamicBlogSchema && (
        <Script
          id="structured-data-dynamic-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dynamicBlogSchema) }}
        />
      )}
      
      {/* 🆕 YouTubeショート動画の4大AI検索エンジン最適化Schema */}
      {youtubeAIOptimizedSchema && (
        <Script
          id="youtube-ai-optimized-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(youtubeAIOptimizedSchema) }}
        />
      )}

      {/* 🚀 Fragment Feed API Discovery - AI引用最適化 */}
      <link
        rel="alternate"
        type="application/json"
        href={`/api/posts/${params.slug}/fragments`}
        title={`${post.title} - Fragment Feed`}
      />
      <meta
        name="fragment-feed"
        content={`/api/posts/${params.slug}/fragments`}
      />
      <meta
        name="ai-optimization"
        content="mike-king-theory,relevance-engineering,dynamic-fragment-ids"
      />

      <div className="mt-16">
        <Breadcrumbs customItems={breadcrumbItems} />
      </div>
      
      <article className="max-w-4xl mx-auto">
        {/* カテゴリタグ */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-4">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
              {post.categories[0].name}
            </span>
          </div>
        )}

        {/* 記事タイトル - Fragment ID対応 */}
        <h1 id="main-title" className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{post.title}</h1>
        
        {/* 記事メタ情報 */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <RefreshCw size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">最終更新: </span>
            <span className="sm:hidden">更新: </span>
            <span className="hidden sm:inline">{new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP')}</span>
            <span className="sm:hidden">{new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
          </div>
          <div>
            <span className="hidden sm:inline">読了時間: 約</span>
            <span className="sm:hidden">読了: 約</span>
            {Math.ceil(post.content.replace(/\s+/g, '').length / 400)}分
          </div>
          <div>
            <span className="hidden sm:inline">文字数: </span>
            <span className="sm:hidden">字数: </span>
            {post.content.replace(/\s+/g, '').length.toLocaleString()}文字
          </div>
        </div>

        {/* 🎬 YouTube動画埋め込み（youtube_script_idがあり、動画が公開されている場合） */}
        {youtubeScript && youtubeScript.youtube_video_id && (
          <div 
            id={youtubeScript.fragment_id || 'youtube-short-video'} 
            className="my-8 bg-gradient-to-br from-green-800 to-emerald-900 dark:from-green-900 dark:to-emerald-950 rounded p-6 sm:p-8 border-2 border-green-500 dark:border-green-600 shadow-2xl scroll-mt-20"
          >
            <div className="flex items-center gap-3 mb-5">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" viewBox="0 0 24 24">
                {/* YouTubeロゴ背景（赤色） */}
                <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                {/* 再生ボタン三角形（白色） */}
                <path fill="#FFFFFF" d="M9.545 8.432v7.136L15.818 12z"/>
              </svg>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                この記事を動画で見る（100秒）
              </h3>
            </div>
            
            <p className="text-sm sm:text-base text-green-100 dark:text-green-200 mb-5 leading-relaxed">
              {youtubeScript.script_hook || 'YouTube動画で要点を簡潔に解説しています'}
            </p>
            
            {/* スマホ対応強化：min-heightを追加 */}
            <div className="relative w-full bg-black rounded overflow-hidden" style={{ paddingBottom: '56.25%', minHeight: '200px' }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeScript.youtube_video_id}`}
                title={youtubeScript.script_title || post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 'none', minHeight: '200px' }}
              />
            </div>
            
            {/* 🎯 YouTube CTAボタン（魅力的なデザイン） */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${youtubeScript.youtube_video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="relative z-10 text-sm sm:text-base">高評価お願いします</span>
              </a>
              
              <a
                href="https://www.youtube.com/@kenjiharada_ai_site?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden border-2 border-red-500"
              >
                <span className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="relative z-10 text-sm sm:text-base">チャンネル登録</span>
              </a>
            </div>
            
            <div className="mt-5 pt-5 border-t border-green-600 dark:border-green-700">
              <p className="text-xs sm:text-sm text-green-200 dark:text-green-300 text-center font-medium">
                ✨ 詳細な解説はこの後のテキストで！動画とテキストで完全理解 ✨
              </p>
            </div>
          </div>
        )}
        
        {/* YouTube動画がない場合のみサムネイル画像を表示 */}
        {!youtubeScript?.youtube_video_id && (post.thumbnail_url || post.featured_image) && (
          <div className="relative mb-8">
            <Image
              src={post.thumbnail_url || post.featured_image || ''}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg shadow-md w-full"
              unoptimized={true}
              priority={true}
            />
            </div>
        )}

        {/* TOC表示（Fragment ID付き・水色デザイン） */}
        <TOCComponent toc={tocData.toc} relatedInfo={relatedInfo} />

        {post.content && (
          <div className="mt-8">
            <MarkdownContent content={post.content
              .replace(/---\s*$/i, '')
              .trim()
            } />
          </div>
        )}

        {/* FAQ表示（自動抽出） - 重複防止のため無効化（記事本文内FAQを使用） */}
        {/* {faqData.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 faq-section">
            <h2 className="text-xl font-bold mb-6 text-blue-900">よくある質問</h2>
            <div className="space-y-6">
              {faqData.map((faq: any, index: number) => (
                <div key={index} className="border-b border-blue-200 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-blue-800 mb-2">Q. {faq.question}</h3>
                  <p className="text-blue-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* HOW TO表示（自動抽出） - 非表示に変更 */}
        {/* {howToData.steps.length > 0 && (
          <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-green-900">実装ガイド</h2>
            <div className="space-y-4">
              {howToData.steps.map((step: any, index: number) => (
                <div key={index} className="flex gap-4" id={`step-${index + 1}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">{step.title}</h3>
                    <p className="text-green-700">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* 📱 YouTubeショート動画スライダー（新規追加） */}
        {youtubeShortVideos.length > 0 && (
          <YouTubeShortSlider 
            videos={youtubeShortVideos} 
            currentArticleTitle={post.title} 
          />
        )}

        {/* 著者セクション - Fragment ID付き */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6" id="author-profile">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">著者について</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/images/author/harada-kenji.jpg"
                alt="原田賢治"
                width={80}
                height={80}
                className="rounded-full border-2 border-gray-300"
                unoptimized={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">原田賢治</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">代表取締役・AI技術責任者</p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装、企業向けAI研修を手がける。
                15年以上のAI・システム開発経験を持ち、全国で企業のDX・AI活用、退職代行サービスを支援。
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a 
                  href="https://x.com/NANDS_AI" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </a>
                <a 
                  href="https://www.youtube.com/@kenjiharada_ai_site?sub_confirmation=1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
                <a 
                  href="https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="/about" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  詳細プロフィール
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* 記事タグがあれば表示 */}
        {(post.meta_keywords || post.seo_keywords) && (post.meta_keywords || post.seo_keywords)!.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {(post.meta_keywords || post.seo_keywords)!.map((keyword: string, index: number) => (
              <Link 
                key={index} 
                href={`/search?keyword=${encodeURIComponent(keyword)}`}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm transition-colors"
              >
                #{keyword}
              </Link>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
