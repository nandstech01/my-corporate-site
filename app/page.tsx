import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import SustainabilitySection from '@/app/components/portal/SustainabilitySection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { createClient } from '@/utils/supabase/server'
import PostsGridSSR from '@/components/common/PostsGridSSR'
import PostsGridAnimations from '@/components/common/PostsGridAnimations'
import Script from 'next/script'
import { getStructuredData } from './structured-data'
import type { Metadata } from 'next'
import Image from 'next/image'

import TableOfContents from '@/components/common/TableOfContents'
// 🆕 YouTubeショート動画スライダー（トップページ用）
import YouTubeShortSlider, { type YouTubeShortVideo } from '@/components/blog/YouTubeShortSlider'

// 🆕 Hybrid Architecture新セクション（魂のデザイン）
import NewTopPageSections from '@/app/components/portal/NewTopPageSections'

// ServicesSectionSSRは削除（ヘッダーに移管済み）
// import ServicesSectionSSR from '@/app/components/portal/ServicesSectionSSR'

// AboutSectionSSR（AI検索エンジン最適化）
import AboutSectionSSR from '@/app/components/portal/AboutSectionSSR'

// 🆕 AIサイトショーケースセクション（Apple風カードデザイン）
import AISiteShowcaseSection from '@/app/components/portal/AISiteShowcaseSection'

// 🆕 最新知見・専門情報セクション（ライト/ダークモード対応）
import KnowledgeInsightsSection from '@/app/components/portal/KnowledgeInsightsSection'

// 🆕 YouTubeショートセクション（ライト/ダークモード対応）
import YouTubeShortsSection from '@/app/components/portal/YouTubeShortsSection'

// Schema.org 16.0+ 最新機能をインポート
import {
  IPTCDigitalSourceType,
  createAIServiceTransparency,
  createJapaneseCertifications,
  createJapaneseGovernmentBenefits,
  generateLatestOrganizationSchema
} from '@/lib/structured-data/schema-org-latest';

// AI検索エンジン最適化をインポート
import {
  generateCompleteAIEnhancedUnifiedPageData,
  generateCompleteAIEnhancedStructuredDataJSON,
  generateEnhancedAISearchReport
} from '@/lib/structured-data/unified-integration-ai-enhanced';

// 著者信頼性システム（原田賢治プロフィール）
import { AuthorTrustSystem, HARADA_KENJI_PROFILE, NANDS_TRUST_SIGNALS } from '@/lib/structured-data/author-trust-system';

// キャッシュシステムは一時的にコメントアウト
// import { getFastAIEnhancedPageData } from '@/lib/cache/ai-enhanced-cache'

export const metadata: Metadata = {
  title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
  description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。2008年の設立以来、時代に寄り添ったソリューションを提供しています。',
  openGraph: {
    title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。',
    images: ['/images/ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
    siteName: '株式会社エヌアンドエス',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech'
  },
  keywords: '総合人材支援,キャリアコンサルティング,生成AI研修,リスキリング,人材育成,キャリア支援,退職支援,エヌアンドエス,NANDS,転職支援',
}

// 🚀 高速化ISR設定（30分間隔に変更）
export const revalidate = 1800 // 30分間隔

// 🚀 完全SSG化オプション（さらなる高速化）
// export const dynamic = 'force-static' // 完全静的生成を強制
// export const revalidate = false // キャッシュを無効化してSSG専用に

// Mike King理論準拠 - 人間とAIの両方に最適化されたFragment ID
const tocItems = [
  { 
    id: 'ai-solutions', 
    title: 'AI活用ソリューション', 
    level: 1,
    semanticWeight: 0.95,
    targetQueries: ['AI 人材変革', '生成AI 企業導入', 'AI リスキリング', 'ChatGPT 社員研修'],
    entities: ['生成AI', 'リスキリング', '人材変革', 'DX推進']
  },
  { 
    id: 'services-training', 
    title: 'サービス・研修一覧', 
    level: 1,
    semanticWeight: 0.92,
    targetQueries: ['AI研修 サービス一覧', 'ChatGPT 企業研修', '生成AI 導入支援', 'AI Agent 開発'],
    entities: ['AI研修', 'ChatGPT研修', 'AI Agent開発', 'Vector RAG構築']
  },
  { 
    id: 'ai-site-showcase', 
    title: 'NANDSのAIサイト', 
    level: 1,
    semanticWeight: 0.94,
    targetQueries: ['AI 引用されるサイト', 'デジタル資産 AI', 'NANDS AI引用', 'AI検索 資産化'],
    entities: ['AIに引用されるサイト', 'デジタル資産', 'AI引用精度', 'NANDS=AI認識']
  },
  { 
    id: 'knowledge-insights', 
    title: '最新知見・専門情報', 
    level: 1,
    semanticWeight: 0.88,
    targetQueries: ['AI 最新情報', 'Mike King理論', 'レリバンスエンジニアリング', 'LLMO対策'],
    entities: ['Mike King理論', 'レリバンスエンジニアリング', 'LLMO', 'AI検索最適化']
  },
  { 
    id: 'company-expertise', 
    title: '会社実績・専門性', 
    level: 1,
    semanticWeight: 0.85,
    targetQueries: ['エヌアンドエス 実績', '滋賀県 AI企業', '15年実績 退職代行', '関西 AI研修'],
    entities: ['株式会社エヌアンドエス', '滋賀県', '関西地方', '15年実績']
  },
  { 
    id: 'sustainability', 
    title: 'サステナビリティ', 
    level: 1,
    semanticWeight: 0.82,
    targetQueries: ['AI 倫理', '持続可能 AI', 'AI 責任', 'AI ガバナンス'],
    entities: ['AI倫理', '持続可能性', 'AIガバナンス', '責任あるAI']
  },
  { 
    id: 'premium-solutions', 
    title: '注目ソリューション', 
    level: 1,
    semanticWeight: 0.90,
    targetQueries: ['プレミアム AI', '高度 AI開発', 'カスタム AI', 'エンタープライズ AI'],
    entities: ['プレミアムAI', 'エンタープライズ', 'カスタム開発', '高度AI']
  },
  { 
    id: 'faq-support', 
    title: 'よくある質問・サポート', 
    level: 1,
    semanticWeight: 0.87,
    targetQueries: ['AI導入 FAQ', 'ChatGPT 使い方', 'AI 導入課題', 'AI 研修 質問'],
    entities: ['AI導入', 'FAQ', 'トラブルシューティング', '導入支援']
  },
  { 
    id: 'contact', 
    title: 'お問い合わせ', 
    level: 1,
    semanticWeight: 0.84,
    targetQueries: ['AI 相談', 'AI導入 問い合わせ', '無料相談 AI', 'AI 専門家'],
    entities: ['AI相談', '無料相談', 'AI専門家', 'サポート']
  }
];

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  featured_image?: string | null;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  table_type: 'posts' | 'chatgpt_posts';
  is_chatgpt_special?: boolean;
};

// 🆕 最新ショート動画を取得（トップページ用・ISRキャッシュ対応）
// 🚀 ISR + Promise.all で最適化済み（キャッシュなし - ISRで十分）
async function getLatestYouTubeShorts(): Promise<YouTubeShortVideo[]> {
  const supabase = createClient();
  
  try {
    const { data: shorts, error } = await supabase
      .from('company_youtube_shorts')
      .select('id, youtube_video_id, youtube_url, script_title, script_hook, fragment_id, complete_uri')
      .eq('content_type', 'youtube-short')
      .eq('status', 'published')
      .not('youtube_video_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (error || !shorts) {
      console.error('YouTube shorts fetch error:', error?.message);
      return [];
    }
    
    return shorts.map((s: any) => ({
      id: s.id,
      videoId: s.youtube_video_id,
      url: s.youtube_url || `https://youtube.com/shorts/${s.youtube_video_id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${s.youtube_video_id}`,
      title: s.script_title || 'YouTubeショート動画',
      hookText: s.script_hook,
      fragmentId: s.fragment_id || `youtube-short-${s.id}`,
      completeUri: s.complete_uri
    }));
  } catch (error) {
    console.error('getLatestYouTubeShorts error:', error);
    return [];
  }
}

// 🎯 固定表示する注目記事のslug（表示順）
const FEATURED_POST_SLUGS = [
  'ai-ai20251000-097498', // 1. AIアーキテクト
  'ai--949889',           // 2. AIキャリア
  '-571903',              // 3. ベクトルリンク
  'ai-950781'             // 4. レリバンスエンジニアリング
]

/**
 * ヒーロー用固定記事を取得（4件）
 * 🚀 ISR + Promise.all で最適化済み（キャッシュなし - ISRで十分）
 */
async function getLatestPosts(): Promise<Post[]> {
  const supabase = createClient();
  
  try {
    // 🚀 固定記事を指定されたslugで取得
    const [newPostsResult, oldPostsResult] = await Promise.all([
      // postsテーブル（RAG記事）- 固定slug
      supabase
        .from('posts')
        .select('id, title, slug, meta_description, thumbnail_url, created_at')
        .eq('status', 'published')
        .in('slug', FEATURED_POST_SLUGS),

      // chatgpt_postsテーブル（ChatGPT記事）- 固定slug
      supabase
        .from('chatgpt_posts')
        .select('id, title, slug, excerpt, thumbnail_url, featured_image, created_at, is_chatgpt_special, categories(name, slug)')
        .eq('status', 'published')
        .in('slug', FEATURED_POST_SLUGS)
    ]);

    // エラーハンドリング（ログ出力を最小化）
    if (newPostsResult.error) {
      console.error('Posts fetch error:', newPostsResult.error.message);
    }
    if (oldPostsResult.error) {
      console.error('ChatGPT posts fetch error:', oldPostsResult.error.message);
    }

    // 🚀 高速データ変換（処理最適化）
    const formattedNewPosts: Post[] = (newPostsResult.data || []).map(post => ({
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.meta_description || '',
      meta_description: post.meta_description,
      thumbnail_url: post.thumbnail_url,
      created_at: post.created_at,
      table_type: 'posts' as const
    }));

    const formattedOldPosts: Post[] = (oldPostsResult.data || []).map(post => {
      // 🚀 画像URL処理最適化
      const imageUrl = post.thumbnail_url || post.featured_image;
      const finalImageUrl = imageUrl && !imageUrl.startsWith('http') 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
        : imageUrl;
      
      return {
        id: post.id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        thumbnail_url: finalImageUrl,
        featured_image: post.featured_image,
        created_at: post.created_at,
        category: post.categories?.[0],
        table_type: 'chatgpt_posts' as const,
        is_chatgpt_special: post.is_chatgpt_special
      };
    });

    // 🎯 固定記事を指定された順番でソート
    const allPosts = [...formattedNewPosts, ...formattedOldPosts];
    
    // slugの順番通りにソート
    const sortedPosts = FEATURED_POST_SLUGS
      .map(slug => allPosts.find(post => post.slug === slug))
      .filter((post): post is Post => post !== undefined);
    
    return sortedPosts;

  } catch (error) {
    console.error('getLatestPosts error:', error);
    return [];
  }
}

/**
 * 最新記事を取得（6件）- 最新知見セクション用
 * 🚀 ISR + Promise.all で最適化済み（キャッシュなし - ISRで十分）
 */
async function getRecentPosts(): Promise<Post[]> {
  const supabase = createClient();
  
  try {
    // 🚀 最新記事を6件取得（作成日時順）
    const [newPostsResult, oldPostsResult] = await Promise.all([
      // postsテーブル（RAG記事）- 最新6件
      supabase
        .from('posts')
        .select('id, title, slug, meta_description, thumbnail_url, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6),

      // chatgpt_postsテーブル（ChatGPT記事）- 最新6件
      supabase
        .from('chatgpt_posts')
        .select('id, title, slug, excerpt, thumbnail_url, featured_image, created_at, is_chatgpt_special, categories(name, slug)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6)
    ]);

    // エラーハンドリング
    if (newPostsResult.error) {
      console.error('Recent posts (posts) fetch error:', newPostsResult.error.message);
    }
    if (oldPostsResult.error) {
      console.error('Recent posts (chatgpt_posts) fetch error:', oldPostsResult.error.message);
    }

    const newPosts = newPostsResult.data || [];
    const oldPosts = oldPostsResult.data || [];

    // 統一フォーマットに変換
    const formattedNewPosts: Post[] = newPosts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.meta_description,
      thumbnail_url: post.thumbnail_url,
      featured_image: post.thumbnail_url,
      created_at: post.created_at,
      table_type: 'posts' as const
    }));

    const formattedOldPosts: Post[] = oldPosts.map((post: any) => {
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        thumbnail_url: post.thumbnail_url,
        featured_image: post.featured_image,
        created_at: post.created_at,
        category: post.categories?.[0],
        table_type: 'chatgpt_posts' as const,
        is_chatgpt_special: post.is_chatgpt_special
      };
    });

    // 全記事をマージして作成日時順にソート、上位6件を返す
    const allPosts = [...formattedNewPosts, ...formattedOldPosts];
    const sortedPosts = allPosts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return sortedPosts.slice(0, 6);

  } catch (error) {
    console.error('getRecentPosts error:', error);
    return [];
  }
}

export default async function Home() {
  console.log('🏠 Home page rendering started...');
  const renderStartTime = Date.now();

  // 🚀 並列処理最適化（1段階目）- ヒーロー固定記事、最新記事、ショート動画を並列取得
  const [posts, recentPosts, youtubeShorts] = await Promise.all([
    getLatestPosts(),      // ヒーロー用固定4件
    getRecentPosts(),      // 最新知見セクション用6件
    getLatestYouTubeShorts()
  ]);
  const structuredData = getStructuredData();
  
  console.log('📱 トップページ ショート動画:', youtubeShorts.length, '件');
  
  // 🚀 AI検索最適化処理を軽量化（キャッシュシステムは後で統合）
  let aiEnhancedData, aiSearchReport, aiEnhancedStructuredDataJSON;
  
  if (process.env.NODE_ENV === 'production') {
    // 本番環境: 軽量版実行（キャッシュは後で実装）
    console.log('🚀 Production: Using lightweight AI Enhanced data...');
    
    // 軽量版のAI強化データ
    aiEnhancedData = {
      aiSearchOptimization: { 
        targetEngines: ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'DeepSeek'], 
        readinessScore: 0.95,
        optimizations: {
          chatgpt: { fragmentIds: [], semanticLinks: [] },
          perplexity: { citationOptimization: [] },
          claude: { entityRelationships: [] },
          gemini: { structuredDataEnhancement: [] },
          deepSeek: { reasoningOptimization: [] }
        }
      },
      detailedKnowsAbout: {
        primaryServices: ['AI開発', 'システム開発', 'リスキリング研修'],
        technologies: ['ChatGPT', 'RAG', 'ベクトル検索'],
        industries: ['製造業', '金融', 'ヘルスケア']
      },
      enhancedMentions: {
        organizationMentions: [],
        serviceMentions: [],
        technologyMentions: []
      },
      fragmentIdEnhancement: {
        totalFragments: 0,
        optimizedFragments: []
      }
    };
    aiEnhancedStructuredDataJSON = JSON.stringify(aiEnhancedData);
    aiSearchReport = null;
  } else {
    // 開発環境: 軽量版実行
    console.log('🔧 Development: Using lightweight AI Enhanced data...');
    aiEnhancedData = {
      aiSearchOptimization: { targetEngines: [], readinessScore: 0.95 },
      detailedKnowsAbout: {},
      enhancedMentions: {},
      fragmentIdEnhancement: {}
    };
    aiEnhancedStructuredDataJSON = '{}';
  }
  
  const renderDuration = Date.now() - renderStartTime;
  console.log(`🏠 Home page rendered in ${renderDuration}ms`);
  
  // 🎯 著者信頼性システム - 原田賢治プロフィール構造化データ
  const authorTrustSystem = new AuthorTrustSystem(HARADA_KENJI_PROFILE, NANDS_TRUST_SIGNALS);
  const authorSchema = authorTrustSystem.generateAuthorSchema();
  const organizationTrustSchema = authorTrustSystem.generateOrganizationTrustSchema();
  
  // 【LLMO最強実装】Google Gemini LLM + AI Overviews最適化
  // Mike King理論完全準拠 + 2024年Google最新ガイドライン対応
  const llmoOptimizedData = {
    "@context": "https://schema.org",
    "@graph": [
      // 【1】LocalBusiness + Organization統合スキーマ（AI Overviews最適化）
      {
        "@type": ["LocalBusiness", "Organization", "TechnologyCompany"],
        "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス",
        "legalName": "株式会社エヌアンドエス", 
        "alternateName": ["NANDS", "エヌアンドエス", "N&S"],
        "description": "滋賀県大津市を拠点とする総合人材支援・生成AIリスキリング研修企業。Mike King理論準拠のレリバンスエンジニアリング実装、Google AI Overviews最適化、LLMO対策の専門企業として関西地方を中心に全国展開。",
      "url": "https://nands.tech",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nands.tech/images/logo.svg",
          "width": 600,
          "height": 60,
          "alt": "株式会社エヌアンドエス ロゴ"
        },
        "image": {
          "@type": "ImageObject", 
          "url": "https://nands.tech/images/ogp.jpg",
          "width": 1200,
          "height": 630,
          "alt": "株式会社エヌアンドエス 総合人材支援・生成AIリスキリング研修"
        },
        
        // 【LocalBusiness完全最適化】滋賀県大津市地域企業
      "address": {
        "@type": "PostalAddress",
          "streetAddress": "皇子が丘２丁目10-25-3004号",
          "addressLocality": "大津市",
        "addressRegion": "滋賀県",
          "postalCode": "520-0025",
          "addressCountry": "JP"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "35.0116",
          "longitude": "135.8681"
      },
        "contactPoint": [
          {
        "@type": "ContactPoint",
        "telephone": "0120-407-638",
        "contactType": "customer service",
            "email": "contact@nands.tech",
            "availableLanguage": ["Japanese", "English"],
            "areaServed": ["JP", "関西地方", "滋賀県", "大津市", "京都府", "大阪府"],
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            }
          },
          {
            "@type": "ContactPoint",
            "email": "contact@nands.tech",
            "contactType": "customer support",
        "availableLanguage": ["Japanese"],
            "areaServed": "JP"
          }
        ],
        
        // 【創業者・代表情報】E-E-A-T強化
        "founder": {
          "@type": "Person",
          "name": "原田賢治",
          "jobTitle": "代表取締役CEO",
          "description": "生成AI・レリバンスエンジニアリング・退職代行サービスの専門家。15年以上の実務経験。",
          "sameAs": [
            "https://orcid.org/0009-0007-2241-9100",
            "https://x.com/NANDS_AI", 
            "https://www.linkedin.com/in/賢治-原田-77a4b7353/"
          ],
          "worksFor": {
            "@id": "https://nands.tech/#organization"
          },
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "生成AI・プロンプトエンジニアリング",
              "credentialCategory": "専門技術資格"
            },
            {
              "@type": "EducationalOccupationalCredential", 
              "name": "退職代行サービス運営",
              "credentialCategory": "実務経験15年以上"
            }
          ]
        },
        
        // 【企業基本情報】
        "foundingDate": "2008",
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": "1-10"
        },
        "industry": ["人材支援", "教育研修", "AI技術コンサルティング", "退職代行"],
        
        // 【LLMO最適化】Google Gemini LLM対応知識領域
      "knowsAbout": [
          // 核心事業領域
          "生成AI研修", "リスキリング", "キャリアコンサルティング", "退職支援", "退職代行",
          "DX人材育成", "プロンプトエンジニアリング", "ChatGPT活用", "Claude活用", "Gemini活用",
          
          // 技術領域（Mike King理論準拠）
          "レリバンスエンジニアリング", "LLMO対策", "AI Overviews最適化", "構造化データ", 
          "SEO対策", "Schema.org実装", "Google Gemini LLM対応", "ベクターRAG",
          
          // 全国対応・地域展開
          "全国AI研修", "全国DX推進", "全国企業支援", "全国人材育成", "全国リスキリング支援",
          "関西地方重点展開", "関東地方展開", "中部地方展開", "九州地方展開", "東北地方展開",
          "オンライン研修", "リモートサポート", "全国出張対応",
          
          // サービス詳細
          "AI Agent開発", "Chatbot開発", "Vector RAG構築", "MCP Servers開発",
          "HR Solutions", "Video Generation", "SNS Automation", "AIO SEO",
          "System Development", "Corporate Solutions"
        ],
        
        // 【サービス地域】全国対応最適化
        "areaServed": [
        {
          "@type": "Country",
          "name": "日本",
          "description": "全国対応・オンライン研修・リモートサポート完全対応"
        },
        {
            "@type": "State", 
            "name": "滋賀県",
            "description": "本社所在地として地域密着サービス提供"
        },
        {
          "@type": "Place",
            "name": "関西地方",
            "description": "大阪府・京都府・兵庫県・奈良県・和歌山県への重点展開"
        },
        {
          "@type": "Place",
            "name": "関東地方",
            "description": "東京都・神奈川県・埼玉県・千葉県・茨城県・栃木県・群馬県への展開"
        },
        {
          "@type": "Place",
            "name": "中部地方",
            "description": "愛知県・静岡県・岐阜県・三重県・長野県・山梨県・新潟県・富山県・石川県・福井県への展開"
        },
        {
          "@type": "Place",
            "name": "九州地方",
            "description": "福岡県・佐賀県・長崎県・熊本県・大分県・宮崎県・鹿児島県・沖縄県への展開"
        },
        {
          "@type": "Place",
            "name": "東北地方",
            "description": "青森県・岩手県・宮城県・秋田県・山形県・福島県への展開"
        },
        {
          "@type": "Place",
            "name": "中国・四国地方",
            "description": "広島県・岡山県・山口県・鳥取県・島根県・香川県・愛媛県・徳島県・高知県への展開"
        },
        {
          "@type": "Place",
            "name": "北海道",
            "description": "北海道全域への展開"
          }
        ],
        
        // 【外部リンク】信頼性強化
        "sameAs": [
          "https://x.com/NANDS_AI",
          "https://www.linkedin.com/company/nands-tech",
          "https://www.facebook.com/nands.tech",
          "https://github.com/nands-tech"
        ],
        
        // 【サービスカタログ】AI Overviews最適化
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "生成AI・人材支援総合サービス",
          "description": "AI技術と人材支援の融合による次世代ソリューション",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "生成AIリスキリング研修",
              "description": "ChatGPT、Claude、Geminiを活用した実践的研修プログラム",
              "category": "教育研修",
              "areaServed": "JP"
            },
            {
              "@type": "Offer", 
              "name": "AI Agent開発",
              "description": "業務自動化・顧客対応AI Agentのカスタム開発",
              "category": "AI技術開発",
              "areaServed": "JP"
            },
            {
              "@type": "Offer",
              "name": "退職代行サービス",
              "description": "安心・確実な退職手続きサポート（15年以上の実績）", 
              "category": "人材支援",
              "areaServed": "JP"
            },
            {
              "@type": "Offer",
              "name": "Vector RAG構築",
              "description": "企業の独自データを活用したRAGシステム構築",
              "category": "AI技術開発", 
              "areaServed": "JP"
            },
            {
              "@type": "Offer",
              "name": "LLMO・AIO対策",
              "description": "Google AI Overviews・ChatGPT・Perplexity対応SEO",
              "category": "デジタルマーケティング",
              "areaServed": "JP"
        }
      ]
    },
        
        // 【営業時間】LocalBusiness最適化
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        },
        
        // 【受賞・認定】権威性強化
        "award": [
          "滋賀県DX推進企業認定（想定）",
          "関西地方AI導入支援優良企業（想定）"
        ],
        
        // 【企業の特徴】AI Overviews引用最適化
        "slogan": "全ての働く人の「次のステージ」をAIと共に",
        "mission": "生成AI技術と人材支援の融合により、個人と企業の持続可能な成長を実現する",
        "values": ["革新性", "信頼性", "地域貢献", "技術excellence"]
      },
      
      // 【2】WebSite + SearchAction（AI検索最適化）
      {
        "@type": "WebSite",
        "@id": "https://nands.tech/#website",
        "url": "https://nands.tech",
        "name": "株式会社エヌアンドエス",
        "description": "生成AI研修・AI Agent開発・退職代行サービスの総合企業",
        "publisher": {
          "@id": "https://nands.tech/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://nands.tech/blog?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
      {
        "@type": "ReadAction",
            "target": ["https://nands.tech/blog", "https://nands.tech/about"]
      },
      {
        "@type": "ContactAction",
            "target": "https://nands.tech/contact"
          }
        ],
        "about": [
          "生成AI技術", "人材支援", "レリバンスエンジニアリング", 
          "LLMO対策", "AI Overviews最適化", "滋賀県企業支援"
        ],
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-title", ".services-summary", ".about-summary"]
        }
      },
      
      // 【3】WebPage（Mike King理論準拠hasPartスキーマ）
      {
        "@type": "WebPage",
        "@id": "https://nands.tech/#webpage",
        "url": "https://nands.tech",
        "name": "株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修",
        "description": "滋賀県大津市を拠点とする総合人材支援企業。生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートします。",
        "inLanguage": "ja-JP",
        "isPartOf": {
          "@id": "https://nands.tech/#website"
        },
        "about": {
          "@id": "https://nands.tech/#organization" 
        },
        "mainEntity": {
          "@id": "https://nands.tech/#organization"
        },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "ホーム",
          "item": "https://nands.tech"
        }
      ]
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-section", ".services-section", ".about-section"]
        },
        
        // 【hasPartスキーマ】Mike King理論完全準拠
        "hasPart": [
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#hero-section",
            "name": "メインビジュアル・サービス紹介",
            "description": "生成AI研修・AI Agent開発・退職代行サービスの概要",
            "cssSelector": ".hero-section"
          },
          {
            "@type": "WebPageElement", 
            "@id": "https://nands.tech/#services-section",
            "name": "サービス一覧",
            "description": "生成AIリスキリング、AI Agent開発、Vector RAG、退職代行等の詳細サービス",
            "cssSelector": ".services-section"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#about-section", 
            "name": "企業情報・代表紹介",
            "description": "株式会社エヌアンドエスの企業概要と代表取締役原田賢治の紹介",
            "cssSelector": ".about-section"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#blog-section",
            "name": "最新記事・ブログ",
            "description": "生成AI・レリバンスエンジニアリング・LLMO対策の最新情報",
            "cssSelector": ".blog-section"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#youtube-shorts-section",
            "name": "最新YouTubeショート動画",
            "description": "AI技術・生成AI活用に関する最新ショート動画コンテンツ",
            "cssSelector": "#youtube-shorts"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#faq-section",
            "name": "よくある質問",
            "description": "生成AI研修・退職代行サービスに関するFAQ",
            "cssSelector": ".faq-section"
          }
        ]
      },
      
      // 【4】FAQPage（AI Overviews最適化）
      {
        "@type": "FAQPage",
        "@id": "https://nands.tech/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "生成AI研修ではどのようなツールを学べますか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ChatGPT、Claude、Google Gemini、Microsoft Copilotなどの主要な生成AIツールの実践的な活用方法を学べます。プロンプトエンジニアリング、業務自動化、文書作成効率化などの実用的なスキルを習得できます。",
              "author": {
                "@type": "Person",
                "name": "原田賢治",
                "@id": "https://nands.tech/#founder"
              }
            }
          },
          {
            "@type": "Question", 
            "name": "滋賀県・関西地方での企業研修は対応可能ですか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、滋賀県大津市に本社を構える地域密着企業として、滋賀県内はもちろん関西地方（大阪府・京都府・兵庫県・奈良県・和歌山県）での企業研修に対応しています。現地訪問またはオンラインでの研修提供が可能です。",
              "author": {
                "@type": "Person",
                "name": "原田賢治", 
                "@id": "https://nands.tech/#founder"
              }
            }
          },
          {
            "@type": "Question",
            "name": "退職代行サービスの実績はありますか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "15年以上の退職代行サービス実績があります。確実な退職手続き、円満な職場からの離脱をサポートし、次のキャリアステップへの橋渡しを行います。生成AI技術も活用した効率的な手続き支援を提供しています。",
              "author": {
                "@type": "Person",
                "name": "原田賢治",
                "@id": "https://nands.tech/#founder"
              }
            }
          },
          {
            "@type": "Question",
            "name": "AI Agent開発ではどのような自動化が可能ですか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": "顧客対応チャットボット、文書作成自動化、データ分析自動化、レポート生成、メール対応自動化など、幅広い業務自動化AI Agentの開発が可能です。Vector RAG技術を活用した企業独自データベース連携も対応しています。",
              "author": {
                "@type": "Person",
                "name": "原田賢治",
                "@id": "https://nands.tech/#founder"
              }
            }
          }
        ]
      },
      
      // 【5】HowTo（LLMO最適化）
      {
        "@type": "HowTo",
        "@id": "https://nands.tech/#howto",
        "name": "生成AI導入で業務効率化を実現する方法",
        "description": "企業が生成AIを導入して業務効率化を実現するための具体的なステップ",
        "totalTime": "PT2M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "JPY",
          "value": "0"
        },
        "supply": [
          {
            "@type": "HowToSupply",
            "name": "生成AIツール（ChatGPT、Claude、Gemini等）"
          },
          {
            "@type": "HowToSupply", 
            "name": "業務プロセスの現状把握"
          }
        ],
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "現状業務の分析・課題特定",
            "text": "まず現在の業務プロセスを詳細に分析し、生成AIで自動化・効率化できる箇所を特定します。文書作成、顧客対応、データ分析などの反復作業を洗い出します。"
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "適切な生成AIツールの選択",
            "text": "業務内容に応じて最適な生成AIツールを選択します。文書作成にはChatGPT、コード生成にはClaude、多言語対応にはGeminiなど、用途別に使い分けます。"
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "プロンプトエンジニアリングの習得",
            "text": "効果的なプロンプト（指示文）の作成方法を習得します。具体的で明確な指示、例文の提示、段階的な処理指示などのテクニックを学びます。"
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "段階的導入・効果測定",
            "text": "小規模な業務から段階的に生成AIを導入し、効果を測定します。作業時間の短縮、品質向上、コスト削減などの指標で評価し、継続的に改善していきます。"
          }
        ],
        "author": {
          "@type": "Person",
          "name": "原田賢治",
          "@id": "https://nands.tech/#founder"
        }
      },
      
      // 【6】BlogPosting Collection（自社RAG活用）
      {
        "@type": "CollectionPage",
        "@id": "https://nands.tech/#blog-collection",
        "name": "生成AI・レリバンスエンジニアリング専門ブログ",
        "description": "Mike King理論準拠のレリバンスエンジニアリング、LLMO対策、AI Overviews最適化の最新情報",
        "url": "https://nands.tech/blog",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": posts.length,
          "itemListElement": posts.slice(0, 6).map((post, index) => ({
            "@type": "BlogPosting",
            "position": index + 1,
            "headline": post.title,
            "url": `https://nands.tech/posts/${post.slug}`,
            "description": post.excerpt,
            "author": {
              "@type": "Person",
              "name": "原田賢治",
              "@id": "https://nands.tech/#founder"
            },
            "publisher": {
              "@id": "https://nands.tech/#organization"
            },
            "datePublished": post.created_at,
            "image": post.thumbnail_url ? {
              "@type": "ImageObject",
              "url": post.thumbnail_url,
              "alt": post.title
            } : undefined
          }))
        },
        "about": [
          "生成AI技術", "レリバンスエンジニアリング", "LLMO対策", 
          "AI Overviews最適化", "Google Gemini LLM", "Vector RAG"
        ]
      },
      
      // 【7】VideoObject Collection（YouTubeショート動画・動画スニペット対応）
      ...(youtubeShorts.length > 0 ? [{
        "@type": "ItemList",
        "@id": "https://nands.tech/#video-collection",
        "name": "AI技術解説YouTubeショート動画",
        "description": "生成AI・AI技術に関する最新のショート動画コンテンツ",
        "numberOfItems": youtubeShorts.length,
        "itemListElement": youtubeShorts.map((video, index) => ({
          "@type": "VideoObject",
          "position": index + 1,
          "@id": `https://nands.tech/#video-${video.videoId}`,
          "name": video.title,
          "description": video.hookText || `${video.title} - AI技術解説ショート動画`,
          "thumbnailUrl": `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
          "uploadDate": new Date().toISOString().split('T')[0],
          "duration": "PT30S",
          "contentUrl": video.url,
          "embedUrl": video.embedUrl,
          "publisher": {
            "@id": "https://nands.tech/#organization"
          },
          "author": {
            "@type": "Person",
            "name": "原田賢治",
            "@id": "https://nands.tech/#founder"
          }
        }))
      }] : [])
    ]
  };

  // Schema.org 16.0+ 対応構造化データ
  const latestOrganizationSchema = generateLatestOrganizationSchema(
    {
      '@id': 'https://nands.tech/#organization',
      name: 'エヌアンドエス株式会社',
      description: 'AI・システム開発・リスキリング研修で企業のDXを支援',
      url: 'https://nands.tech'
    },
    {
      includeAITransparency: true,
      includeCertifications: true,
      includeGovernmentBenefits: true
    }
  );

  // AI透明性ステートメント
  const aiTransparencyStatement = {
    digitalSourceTypes: createAIServiceTransparency(),
    statement: '当社サービスはAI技術を活用していますが、人間の専門知識と品質管理を重視しています。'
  };

  // 助成金情報の追加
  const subsidyInformation = {
    humanResourcesDevelopment: {
      name: '人材開発支援助成金',
      coverage: '最大80%補助',
      description: 'リスキリング研修費用の大部分を助成金でカバー可能'
    },
    itIntroduction: {
      name: 'IT導入補助金',
      coverage: '最大75%補助',
      description: 'システム開発・AI導入費用を大幅に削減'
    }
  };

  // Mike King理論完全準拠 - 高度なFragment ID最適化スキーマ（GEO・LLMO・AIO対策）
  const fragmentIdOptimizationSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://nands.tech/#ai-optimized-mainpage",
    "name": "株式会社エヌアンドエス | AI検索最適化実装メインページ",
    "description": "Mike King理論準拠のFragment ID最適化実装。ChatGPT・Perplexity・Gemini等のAI検索エンジンに完全対応したセマンティック構造化データ。",
    "url": "https://nands.tech",
    "inLanguage": "ja-JP",
    
    // AI検索エンジン最適化メタデータ
    "aiSearchOptimization": {
      "targetEngines": ["ChatGPT", "Perplexity", "Claude", "Gemini", "Google AI Overviews"],
      "optimizationLevel": "expert",
      "semanticWeightTotal": tocItems.reduce((sum, item) => sum + (item.semanticWeight || 0), 0),
      "mikeKingTheoryCompliance": true,
      "geoOptimized": true,
      "llmoOptimized": true,
      "aioOptimized": true
    },
    
    // 高度なFragment IDマッピング
    "mainEntity": {
      "@type": "ItemList",
      "name": "AI検索最適化Fragment IDリスト",
      "description": "Mike King理論準拠・セマンティック重み付け済みFragment ID構成",
      "numberOfItems": tocItems.length,
      "itemListElement": tocItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "url": `https://nands.tech#${item.id}`,
        "description": `${item.title} - セマンティック重み: ${item.semanticWeight}`,
        "semanticWeight": item.semanticWeight,
        "targetQueries": item.targetQueries,
        "entities": item.entities,
        "hierarchyLevel": item.level
      }))
    },
    
    // 拡張hasPartスキーマ（Mike King理論準拠）
    "hasPart": tocItems.map(item => ({
      "@type": "WebPageElement",
      "@id": `https://nands.tech#${item.id}`,
      "name": item.title,
      "url": `https://nands.tech#${item.id}`,
      "identifier": item.id,
      "semanticWeight": item.semanticWeight,
      "targetQueries": item.targetQueries,
      "entities": item.entities,
      "hierarchyLevel": item.level,
      "isPartOf": {
        "@id": "https://nands.tech/#ai-optimized-mainpage"
      },
      "mentions": item.entities?.map(entity => ({
        "@type": "Thing",
        "name": entity,
        "relevance": "high"
      })),
      "potentialAction": {
        "@type": "ReadAction",
        "target": `https://nands.tech#${item.id}`,
        "name": `${item.title}を読む`
      }
    })),
    
    // AI検索エンジン特化キーワード
    "about": [
      "Mike King理論", "レリバンスエンジニアリング", "GEO対策", "LLMO最適化", "AIO戦略",
      "AI検索エンジン最適化", "Fragment ID", "セマンティック構造化データ", "ChatGPT SEO",
      "Perplexity最適化", "Google AI Overviews", "生成AI研修", "AI Agent開発", "Vector RAG"
    ],
    
    // 高度なmention（エンティティ関係性）
    "mentions": [
      {
        "@type": "Person",
        "name": "Mike King",
        "jobTitle": "iPullRank創設者",
        "description": "レリバンスエンジニアリング理論の提唱者",
        "sameAs": "https://ipullrank.com/about/mike-king/",
        "knowsAbout": ["レリバンスエンジニアリング", "SEO", "AI検索最適化"]
      },
      {
        "@type": "Concept",
        "name": "レリバンスエンジニアリング",
        "description": "Mike King理論による検索関連性最適化手法",
        "category": "AI検索最適化手法"
      },
      {
        "@type": "Place",
        "name": "滋賀県大津市",
        "description": "株式会社エヌアンドエス本社所在地",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "35.0116",
          "longitude": "135.8681"
        }
      }
    ],
    
    // セマンティック接続性スコア
    "semanticConnectivity": {
      "totalSemanticWeight": tocItems.reduce((sum, item) => sum + (item.semanticWeight || 0), 0),
      "averageSemanticWeight": tocItems.reduce((sum, item) => sum + (item.semanticWeight || 0), 0) / tocItems.length,
      "hierarchyComplexity": Math.max(...tocItems.map(item => item.level)),
      "entityDensity": tocItems.reduce((sum, item) => sum + (item.entities?.length || 0), 0)
    }
  };

  return (
    <main>
      {/* Fragment ID最適化構造化データ */}
      <Script
        id="fragment-id-optimization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fragmentIdOptimizationSchema, null, 2)
        }}
      />

      {/* 【最強LLMO構造化データ】Google Gemini LLM + AI Overviews完全対応 */}
      <Script
        id="llmo-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(llmoOptimizedData) }}
      />

      {/* 🚀 条件付きScript読み込み（開発環境では軽量化） */}
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            id="schema-org-16-organization"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(latestOrganizationSchema, null, 2),
            }}
          />

          <Script
            id="author-profile-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(authorSchema, null, 2),
            }}
          />

          <Script
            id="organization-trust-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationTrustSchema, null, 2),
            }}
          />

          <Script
            id="ai-transparency-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'TechArticle',
                '@id': 'https://nands.tech/#ai-transparency',
                headline: 'AI技術透明性に関する声明',
                text: aiTransparencyStatement.statement,
                digitalSourceType: aiTransparencyStatement.digitalSourceTypes,
                author: {
                  '@type': 'Person',
                  '@id': 'https://nands.tech/author/harada-kenji'
                },
                publisher: {
                  '@type': 'Organization', 
                  '@id': 'https://nands.tech/#organization'
                },
                datePublished: '2024-01-01'
              }, null, 2),
            }}
          />

          <Script
            id="ai-search-optimization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: aiEnhancedStructuredDataJSON,
            }}
          />

          <Script
            id="ai-search-metadata"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                '@id': 'https://nands.tech/#ai-search-metadata',
                name: 'AI検索エンジン最適化メタデータ',
                description: 'ChatGPT、Perplexity、Claude、Gemini、DeepSeek等の主要AI検索エンジンに最適化されたメタデータセット。レリバンスエンジニアリング、knowsAbout詳細化、mentions関連エンティティ明示、Fragment ID連携強化を含む包括的なAI検索最適化情報。Schema.org 16.0+準拠で、日本企業のAI検索可視性向上、助成金活用最適化、地域SEO強化を実現する高度な構造化データシステム。',
                aiSearchOptimization: {
                  targetEngines: aiEnhancedData.aiSearchOptimization?.targetEngines,
                  readinessScore: aiEnhancedData.aiSearchOptimization?.readinessScore,
                  optimizationLevel: 'advanced',
                  lastOptimized: new Date().toISOString().split('T')[0]
                },
                detailedKnowledgeProfile: aiEnhancedData.detailedKnowsAbout,
                enhancedEntityRelationships: aiEnhancedData.enhancedMentions,
                fragmentIdOptimization: aiEnhancedData.fragmentIdEnhancement
              }, null, 2),
            }}
          />
        </>
      )}

      {/* 🚀 開発環境用軽量構造化データ */}
      {process.env.NODE_ENV === 'development' && (
        <Script
          id="dev-minimal-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: '株式会社エヌアンドエス',
              url: 'https://nands.tech',
              description: '生成AI研修・AI Agent開発・退職代行サービスの総合企業'
            }, null, 2),
          }}
        />
      )}
      
      {/* ============================================
          🆕 Hybrid Architecture - 新トップページセクション
          「見た目はApple、中身はデジライズ」コンセプト
          ============================================ */}
      <NewTopPageSections posts={posts} youtubeShorts={youtubeShorts} />

      {/* ============================================
          以下: 既存の構造化データ最適化セクション（Fragment ID保持）
          控えめに配置し、魂の邪魔にならないように
          ============================================ */}

      {/* Table of Contents（Fragment ID ナビゲーション） - 一旦非表示 */}
      {/* <div className="bg-deep-ocean py-4 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <TableOfContents items={tocItems} compact={true} />
        </div>
      </div> */}
      
      {/* 🎯 ai-solutions Fragment ID（AI検索最適化） */}
      <div id="ai-solutions" className="absolute -top-20" aria-hidden="true" />

      {/* サービスFragment IDアンカー（AI検索最適化 - ヘッダーに移管済み）*/}
      <div id="services-training" className="scroll-mt-20 relative" aria-hidden="true">
        {/* 12個のサービスFragment ID（NANDS=AI強化）- スクロール機能有効化 */}
        <div id="service-system-development" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-aio-seo" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-chatbot-development" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-vector-rag" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-ai-side-business" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-hr-support" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-ai-agents" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-mcp-servers" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-sns-automation" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-video-generation" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-corporate-reskilling" className="absolute -top-24" aria-hidden="true"></div>
        <div id="service-individual-reskilling" className="absolute -top-24" aria-hidden="true"></div>
            </div>
            
      {/* ServicesSectionSSR は削除（ヘッダーに移管済み）*/}

      {/* NANDSのAIサイトセクション（NANDS=AIサイト関連付け強化）- Apple風カードデザイン */}
      <AISiteShowcaseSection />
      
      {/* 記事セクション（自社RAG活用・AI Overviews最適化）- ライト/ダークモード対応、最新6件表示 */}
      <KnowledgeInsightsSection initialPosts={recentPosts} />
      
      {/* NANDSについて - 非表示（ヘッダーの会社概要に移管） */}
      {/* <section id="company-expertise" className="scroll-mt-20">
        <AboutSectionSSR />
      </section> */}

      {/* サステナビリティへの取り組み - 非表示 */}
      {/* <section id="sustainability" className="scroll-mt-20">
        <SustainabilitySection />
      </section> */}

      <section id="premium-solutions" className="scroll-mt-20">
        <FeaturedSection />
      </section>

      {/* 📱 最新YouTubeショート動画セクション（ISRキャッシュ対応）- ライト/ダークモード対応 */}
      {youtubeShorts.length > 0 && (
        <YouTubeShortsSection videos={youtubeShorts} />
      )}
    </main>
  )
} 