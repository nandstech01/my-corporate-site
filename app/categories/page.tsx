import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// カテゴリー別の設定（個別ページと共通化）
const categoryConfig: Record<string, {
  gradient: string;
  color: string;
  concept: string;
  industry: string;
}> = {
  'finance': {
    gradient: 'from-blue-600 to-indigo-800',
    color: 'blue',
    concept: '金融業界のDX推進とAI活用で、次世代の金融サービスを創造',
    industry: '金融・保険'
  },
  'manufacturing': {
    gradient: 'from-gray-600 to-gray-800',
    color: 'gray',
    concept: '製造業の未来を切り拓く、スマートファクトリーとAI技術',
    industry: '製造業'
  },
  'healthcare': {
    gradient: 'from-green-600 to-teal-800',
    color: 'green',
    concept: 'ヘルスケア分野におけるAI革命で、人々の健康と未来を支える',
    industry: '医療・ヘルスケア'
  },
  'retail': {
    gradient: 'from-purple-600 to-pink-800',
    color: 'purple',
    concept: '小売・EC業界のカスタマーエクスペリエンス向上とデータ活用',
    industry: '小売・EC'
  },
  'education': {
    gradient: 'from-orange-600 to-red-800',
    color: 'orange',
    concept: '教育分野のAI活用で、個別最適化された学習体験を実現',
    industry: '教育・研修'
  },
  'logistics': {
    gradient: 'from-amber-600 to-orange-800',
    color: 'amber',
    concept: '物流・運輸業界の効率化と最適化を実現するAIソリューション',
    industry: '物流・運輸'
  },
  'construction': {
    gradient: 'from-yellow-600 to-amber-800',
    color: 'yellow',
    concept: '建設・不動産業界のDXとスマート化を推進',
    industry: '建設・不動産'
  },
  'it-software': {
    gradient: 'from-cyan-600 to-blue-800',
    color: 'cyan',
    concept: 'IT・ソフトウェア業界の革新と競争力強化',
    industry: 'IT・ソフトウェア'
  },
  'hr-service': {
    gradient: 'from-pink-600 to-rose-800',
    color: 'pink',
    concept: '人材サービス業界の変革とマッチング精度向上',
    industry: '人材サービス'
  },
  'marketing': {
    gradient: 'from-violet-600 to-purple-800',
    color: 'violet',
    concept: 'マーケティング業界のデータ活用と施策最適化',
    industry: '広告・マーケティング'
  },
  'government': {
    gradient: 'from-emerald-600 to-green-800',
    color: 'emerald',
    concept: '自治体・公共機関のデジタル化とサービス向上',
    industry: '自治体・公共'
  }
};

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  business_id: number;
  created_at: string;
  updated_at: string;
  business: {
    name: string;
    slug: string;
  };
  _count: {
    posts: number;
  };
}

// SSR最適化されたメタデータ
export const metadata: Metadata = {
  title: '業界別AIソリューション | カテゴリ一覧 | 株式会社エヌアンドエス',
  description: '金融、製造業、ヘルスケア、小売・EC、教育など、各業界に特化したAI導入支援・リスキリング研修・業務効率化ソリューションをご紹介。専門コンサルタントが御社の課題に最適な解決策をご提案いたします。',
  keywords: [
    '業界別AIソリューション',
    'AI導入支援',
    'リスキリング研修',
    '金融AI',
    '製造業DX',
    'ヘルスケアAI',
    '小売EC AI',
    '教育AI',
    '業務効率化',
    'デジタル変革',
    'AI人材育成',
    '株式会社エヌアンドエス'
  ],
  openGraph: {
    title: '業界別AIソリューション | カテゴリ一覧',
    description: '各業界に特化したAI導入支援・リスキリング研修・業務効率化ソリューション',
    type: 'website',
    url: 'https://nands.jp/categories',
    images: [
      {
        url: '/images/categories/categories-hero.jpg',
        width: 1200,
        height: 630,
        alt: '業界別AIソリューション'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '業界別AIソリューション | カテゴリ一覧',
    description: '各業界に特化したAI導入支援・リスキリング研修・業務効率化ソリューション',
    images: ['/images/categories/categories-hero.jpg']
  },
  alternates: {
    canonical: 'https://nands.jp/categories'
  }
};

// SSR データ取得関数
async function getCategoriesData() {
  const supabase = createClient();

  try {
    // カテゴリー一覧と関連データを並列取得
    const [categoriesResult, postsCountResult] = await Promise.all([
      supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          business_id,
          created_at,
          updated_at,
          businesses (
            name,
            slug
          )
        `)
        .order('business_id')
        .order('name'),
      
      supabase
        .from('chatgpt_posts')
        .select('category_id, id')
        .eq('status', 'published')
    ]);

    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error);
      return { categories: [], totalCategories: 0, totalPosts: 0 };
    }

    // 各カテゴリーの記事数をカウント
    const postsByCategory = (postsCountResult.data || []).reduce((acc: Record<number, number>, post) => {
      if (post.category_id) {
        acc[post.category_id] = (acc[post.category_id] || 0) + 1;
      }
      return acc;
    }, {});

    // カテゴリーデータに記事数を追加
    const categoriesWithCounts = (categoriesResult.data || []).map(category => ({
      ...category,
      business: Array.isArray(category.businesses) ? category.businesses[0] : category.businesses,
      _count: {
        posts: postsByCategory[category.id] || 0
      }
    }));

    return {
      categories: categoriesWithCounts as Category[],
      totalCategories: categoriesWithCounts.length,
      totalPosts: Object.values(postsByCategory).reduce((sum, count) => sum + count, 0)
    };
  } catch (error) {
    console.error('Error in getCategoriesData:', error);
    return { categories: [], totalCategories: 0, totalPosts: 0 };
  }
}

export default async function CategoriesPage() {
  const { categories, totalCategories, totalPosts } = await getCategoriesData();

  if (!categories || categories.length === 0) {
    notFound();
  }

  // 事業部別にカテゴリーをグループ化
  const categoriesByBusiness = categories.reduce((acc: Record<string, Category[]>, category) => {
    const businessName = category.business?.name || '未分類';
    if (!acc[businessName]) {
      acc[businessName] = [];
    }
    acc[businessName].push(category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション - ヘッダーとの適切なスペース確保 */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
        
        {/* 背景パターン */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center text-white">
            {/* タイトル */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              業界別AIソリューション
            </h1>
            
            {/* サブタイトル */}
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
              各業界の課題に特化したAI導入支援・リスキリング研修で、<br />
              デジタル変革を成功に導きます
            </p>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">{totalCategories}</div>
                <div className="text-sm opacity-80">対応業界</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">{totalPosts}</div>
                <div className="text-sm opacity-80">関連記事</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">13</div>
                <div className="text-sm opacity-80">導入企業</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {Object.entries(categoriesByBusiness).map(([businessName, businessCategories]) => (
            <div key={businessName} className="mb-16">
              {/* 事業部セクション */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {businessName}
                </h2>
                <p className="text-gray-600 text-lg">
                  {businessName === '法人向けリスキリング' && '各業界に特化したAI人材育成・組織変革支援'}
                  {businessName === '法人向けAI導入' && 'AI技術導入・システム開発・運用支援'}
                  {businessName === '副業支援' && '個人向けAIスキル習得・副業サポート'}
                </p>
              </div>

              {/* カテゴリーグリッド */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {businessCategories.map((category) => {
                  const config = categoryConfig[category.slug] || {
                    gradient: 'from-gray-600 to-gray-800',
                    color: 'gray',
                    concept: category.description || 'AI技術で業界の課題を解決',
                    industry: category.name
                  };

                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                        {/* カテゴリーヘッダー */}
                        <div className={`h-32 bg-gradient-to-br ${config.gradient} relative`}>
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="relative h-full flex items-center justify-center">
                            <div className="text-center text-white">
                              <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                              <span className="text-sm opacity-80">{config.industry}</span>
                            </div>
                          </div>
                        </div>

                        {/* カテゴリー詳細 */}
                        <div className="p-6">
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {category.description || config.concept}
                          </p>

                          {/* メトリクス */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`bg-${config.color}-100 text-${config.color}-800 px-3 py-1 rounded-full text-xs font-medium`}>
                                {category._count.posts}件の記事
                              </span>
                            </div>
                            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            御社の業界に最適なAIソリューションをお探しですか？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            専門コンサルタントが業界特有の課題を分析し、<br />
            最適なAI導入戦略をご提案いたします
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/corporate#contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              無料相談を申し込む
            </Link>
            <Link
              href="/corporate/case-studies"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              導入事例を見る
            </Link>
          </div>
        </div>
      </section>

      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "業界別AIソリューション",
            "description": "各業界に特化したAI導入支援・リスキリング研修・業務効率化ソリューション",
            "url": "https://nands.jp/categories",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": categories.map((category, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://nands.jp/categories/${category.slug}`,
                "name": category.name,
                "description": category.description || categoryConfig[category.slug]?.concept
              }))
            },
            "provider": {
              "@type": "Organization",
              "name": "株式会社エヌアンドエス",
              "url": "https://nands.jp"
            }
          })
        }}
      />
    </div>
  );
} 