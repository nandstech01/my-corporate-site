import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Script from 'next/script'
import PostsGridSSR from '@/components/common/PostsGridSSR'
import PostsGridAnimations from '@/components/common/PostsGridAnimations'
import TableOfContents from '@/components/common/TableOfContents'
import { getUnifiedSupabaseClient } from '@/lib/supabase/unified-client'
import { UnifiedStructuredDataSystem } from '@/lib/structured-data/index'
import type { TOCItem } from '@/components/common/TableOfContents'

// SSR ラッパー（各セクションはテキストSSR・アニメCSR方針）
import AIHeader from '../../components/ai-site/AIHeader'
import AIHeroSectionSSR from '../../components/ai-site/AIHeroSectionSSR'
import EmpathySectionSSR from '../../components/ai-site/EmpathySectionSSR'
import MechanismSectionSSR from '../../components/ai-site/MechanismSectionSSR'
import FeaturesSectionSSR from '../../components/ai-site/FeaturesSectionSSR'
import AutoRAGGenerationSectionSSR from '../../components/ai-site/AutoRAGGenerationSectionSSR'
import OptionsSectionSSR from '../../components/ai-site/OptionsSectionSSR'
import DemoSectionSSR from '../../components/ai-site/DemoSectionSSR'
import PricingSectionSSR from '../../components/ai-site/PricingSectionSSR'
import SubsidySectionSSR from '../../components/ai-site/SubsidySectionSSR'
import ROISectionSSR from '../../components/ai-site/ROISectionSSR'
import UseCasesSectionSSR from '../../components/ai-site/UseCasesSectionSSR'
import FAQSectionSSR from '../../components/ai-site/FAQSectionSSR'
import ContactSectionSSR from '../../components/ai-site/ContactSectionSSR'

export const revalidate = 300

export const metadata: Metadata = {
	metadataBase: new URL('https://nands.tech'),
	title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン搭載の“AIに引用される”サイト',
	description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに引用される設計を標準搭載。IT補助金活用可。まずは30分デモ。',
	openGraph: {
		title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン',
		description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに“引用され続ける”設計を標準搭載。',
		url: 'https://nands.tech/ai-site',
		siteName: '株式会社エヌアンドエス',
		images: [{ url: '/og-ai-site.jpg', width: 1200, height: 630, alt: 'AIサイト' }],
		locale: 'ja_JP',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン',
		description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに“引用され続ける”設計を標準搭載。',
		images: ['/og-ai-site.jpg']
	},
	alternates: { canonical: 'https://nands.tech/ai-site' },
	robots: { index: true, follow: true }
}

// 記事データ取得（/lp と同等）

type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	thumbnail_url: string | null;
	featured_image?: string | null;
	created_at: string;
	category?: { name: string; slug: string };
	table_type: 'posts' | 'chatgpt_posts';
	is_chatgpt_special?: boolean;
};

async function getLatestPosts(): Promise<Post[]> {
	const supabase = getUnifiedSupabaseClient();
	try {
		const { data: newPosts } = await supabase
			.from('posts')
			.select('id,title,slug,meta_description,thumbnail_url,created_at')
			.eq('status', 'published')
			.order('created_at', { ascending: false })
			.limit(10);

		const { data: oldPosts } = await supabase
			.from('chatgpt_posts')
			.select(`
				id,title,slug,excerpt,thumbnail_url,featured_image,created_at,is_chatgpt_special,
				categories ( name, slug )
			`)
			.eq('status', 'published')
			.order('created_at', { ascending: false })
			.limit(10);

		const formattedNew: Post[] = (newPosts || []).map(p => ({
			id: p.id.toString(),
			title: p.title,
			slug: p.slug,
			excerpt: p.meta_description || '',
			thumbnail_url: p.thumbnail_url,
			created_at: p.created_at,
			table_type: 'posts'
		}));

		const formattedOld: Post[] = (oldPosts || []).map(p => {
			const imageUrl = p.thumbnail_url || p.featured_image;
			const final = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`) : null;
			return {
				id: p.id.toString(),
				title: p.title,
				slug: p.slug,
				excerpt: p.excerpt || '',
				thumbnail_url: final,
				featured_image: p.featured_image,
				created_at: p.created_at,
				category: p.categories?.[0],
				table_type: 'chatgpt_posts',
				is_chatgpt_special: p.is_chatgpt_special
			};
		});

		const all = [...formattedNew, ...formattedOld].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		return all.slice(0, 6);
	} catch (e) {
		console.error('getLatestPosts error (ai-site):', e);
		return [];
	}
}

// AI-site専用目次（Mike King理論準拠 - レリバンスエンジニアリング最適化）
const aiSiteTocItems: TOCItem[] = [
  { 
    id: 'main-title', 
    title: 'AIサイト - 24時間365日無人営業システム', 
    level: 1,
    semanticWeight: 0.98,
    targetQueries: ['AIサイト とは', 'AI引用される サイト', 'レリバンスエンジニアリング', '24時間365日 無人営業'],
    entities: ['AIサイト', 'AI引用', 'レリバンスエンジニアリング', '無人営業', 'nands.tech']
  },
  { 
    id: 'features-title', 
    title: '機能一覧 - Triple RAG & Fragment ID', 
    level: 1,
    semanticWeight: 0.95,
    targetQueries: ['Triple RAG システム', 'Fragment ID 実装', '構造化データ 自動生成', 'ベクトル検索'],
    entities: ['Triple RAG', 'Fragment ID', '構造化データ', 'Complete URI', 'ベクトル検索']
  },
  { 
    id: 'pricing-title', 
    title: '価格・プラン - IT補助金対応', 
    level: 1,
    semanticWeight: 0.92,
    targetQueries: ['AIサイト 価格', 'レリバンスエンジニアリング 費用', 'IT補助金 活用', 'ROI 投資対効果'],
    entities: ['価格設定', 'IT補助金', 'ROI', '投資対効果', '月額運用']
  },
  { 
    id: 'faq-title', 
    title: 'よくある質問 - AI引用最適化の全て', 
    level: 1,
    semanticWeight: 0.94,
    targetQueries: ['AIサイト FAQ', 'AI引用 方法', 'Mike King理論 質問', 'レリバンスエンジニアリング 効果'],
    entities: ['AI引用FAQ', 'Mike King理論', 'AI検索最適化', 'Fragment ID効果', 'Complete URI']
  },
  { 
    id: 'latest-blog-posts', 
    title: '最新記事 - AI技術・実装事例', 
    level: 1,
    semanticWeight: 0.90,
    targetQueries: ['AI技術 最新情報', '実装事例', 'レリバンスエンジニアリング 記事', 'AI検索 対策'],
    entities: ['AI技術記事', '実装事例', '技術情報', 'ブログ記事', '最新トレンド']
  },
  { 
    id: 'contact', 
    title: 'お問い合わせ - 30分無料デモ', 
    level: 1,
    semanticWeight: 0.88,
    targetQueries: ['AIサイト 相談', '無料デモ', 'レリバンスエンジニアリング 導入', 'AI引用 問い合わせ'],
    entities: ['お問い合わせ', '無料デモ', '導入相談', 'コンタクト', '30分デモ']
  }
];

// 構造化データ用のTOCアイテム（anchorプロパティ追加）
const aiSiteTocItemsForStructuredData = aiSiteTocItems.map(item => ({
  id: item.id,
  title: item.title,
  level: item.level,
  anchor: `#${item.id}`
}));

export default async function AISitePage() {
	const posts = await getLatestPosts();
	
	// AI-site専用構造化データ生成（原田賢治の権威性含む）
	const structuredDataSystem = new UnifiedStructuredDataSystem();
	const aiSiteStructuredData = structuredDataSystem.generateWebPageSchemaWithHasPart({
		path: '/ai-site',
		title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン搭載の"AIに引用される"サイト',
		description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに引用される設計を標準搭載。IT補助金活用可。まずは30分デモ。',
		serviceType: 'AISiteService',
		toc: aiSiteTocItemsForStructuredData,
		fragmentIds: [
			'main-title', 'features-title', 'pricing-title', 'faq-title',
			'faq-1', 'faq-2', 'faq-3', 'faq-4', 'faq-5', 'faq-6', 'faq-7', 'faq-8', 'faq-9', 'faq-10',
			'faq-11', 'faq-12', 'faq-13', 'faq-14', 'faq-15', 'faq-16', 'faq-17', 'faq-18', 'faq-19', 'faq-20',
			'faq-21', 'faq-22', 'faq-23', 'faq-24', 'faq-25', 'faq-26', 'faq-27', 'faq-28', 'faq-29', 'faq-30'
		]
	});

	return (
		<>
			{/* AI-site専用構造化データ（原田賢治の権威性・FAQ・hasPartスキーマ統合） */}
			<Script
				id="ai-site-structured-data"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(aiSiteStructuredData, null, 2)
				}}
			/>
			
			{/* 🚀 Fragment Feed API Discovery - AIエンジン向け */}
			<link 
				rel="alternate" 
				type="application/json" 
				href="/api/ai-site/fragments" 
				title="Fragment Feed - AI引用最適化マップ"
			/>
			<meta 
				name="fragment-feed" 
				content="/api/ai-site/fragments" 
			/>
			<meta 
				name="ai-optimization" 
				content="mike-king-theory,relevance-engineering,fragment-ids" 
			/>
			
		<main className="relative min-h-screen overflow-hidden">
			{/* Fragment ID for Entity Map - Hidden from users */}
			<div id="service" style={{ display: 'none' }} aria-hidden="true" />
			
			{/* 背景（/lp と同等の黒×シアン基調） */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3b] via-[#0a1b33] to-[#08152a]" />
				<div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
			</div>

			<AIHeader />
			
			{/* Table of Contents（メインページ同様のおしゃれなナビゲーション） */}
			<div className="bg-black py-1 border-b border-gray-800">
				<div className="container mx-auto px-4">
					<TableOfContents items={aiSiteTocItems} compact={true} />
				</div>
			</div>
			<AIHeroSectionSSR />
			<EmpathySectionSSR />
			<MechanismSectionSSR />
			<FeaturesSectionSSR />
			<AutoRAGGenerationSectionSSR />
			<OptionsSectionSSR />
			<DemoSectionSSR />
			<PricingSectionSSR />
			<SubsidySectionSSR />
			<ROISectionSSR />
			<UseCasesSectionSSR />
			<FAQSectionSSR />

			{/* ブログ記事セクション（お問い合わせ直前） */}
			<section id="latest-blog-posts" className="relative py-20 bg-gradient-to-b from-gray-900 via-slate-900 to-black blog-section" role="region" aria-labelledby="latest-posts-heading">
				<div className="container mx-auto px-4">
					<h2 id="latest-posts-heading" className="text-3xl font-bold text-center mb-12 text-white">最新の記事 - 生成AI・企業研修・技術情報</h2>
					<p className="text-center text-slate-300 mb-8 max-w-3xl mx-auto">
						AI活用事例、企業研修の実績、最新技術情報など、法人のAI導入に役立つ情報をお届けします。
						業界別の活用事例や導入効果についても詳しく解説しています。
					</p>
					<PostsGridSSR initialPosts={posts} />
					<Suspense fallback={null}>
						<PostsGridAnimations />
					</Suspense>
					<div className="pointer-events-none absolute inset-0 -z-10">
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.12),transparent_60%)]" />
					</div>
				</div>
			</section>

			<ContactSectionSSR />
		</main>
		</>
	)
} 