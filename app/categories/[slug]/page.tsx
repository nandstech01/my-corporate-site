import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PostsGrid from '@/components/common/PostsGrid';
import { Metadata } from 'next';

// カテゴリー別のコンセプト画像とカラー設定
const categoryConfig: Record<string, {
  image: string;
  gradient: string;
  icon: string;
  concept: string;
  color: string;
}> = {
  'finance': {
    image: '/images/industries/finance.jpg',
    gradient: 'from-blue-600 to-indigo-800',
    icon: '',
    concept: '金融業界のDX推進とAI活用で、次世代の金融サービスを創造',
    color: 'blue'
  },
  'manufacturing': {
    image: '/images/industries/manufacturing.jpg',
    gradient: 'from-gray-600 to-gray-800',
    icon: '',
    concept: '製造業の未来を切り拓く、スマートファクトリーとAI技術',
    color: 'gray'
  },
  'healthcare': {
    image: '/images/industries/medical-care.jpg',
    gradient: 'from-green-600 to-teal-800',
    icon: '',
    concept: 'ヘルスケア分野におけるAI革命で、人々の健康と未来を支える',
    color: 'green'
  },
  'retail': {
    image: '/images/industries/retail.jpg',
    gradient: 'from-purple-600 to-pink-800',
    icon: '',
    concept: '小売・EC業界のカスタマーエクスペリエンス向上とデータ活用',
    color: 'purple'
  },
  'education': {
    image: '/images/industries/retail.jpg', // 教育は小売画像を流用
    gradient: 'from-orange-600 to-red-800',
    icon: '',
    concept: '教育分野のAI活用で、個別最適化された学習体験を実現',
    color: 'orange'
  },
  'logistics': {
    image: '/images/industries/logistics.jpg',
    gradient: 'from-amber-600 to-orange-800',
    icon: '',
    concept: '物流・運輸業界の効率化と最適化を実現するAIソリューション',
    color: 'amber'
  },
  'construction': {
    image: '/images/industries/construction.jpg',
    gradient: 'from-yellow-600 to-amber-800',
    icon: '',
    concept: '建設・不動産業界のDXとスマート化を推進',
    color: 'yellow'
  },
  'it-software': {
    image: '/images/industries/it-software.jpg',
    gradient: 'from-cyan-600 to-blue-800',
    icon: '',
    concept: 'IT・ソフトウェア業界の革新と競争力強化',
    color: 'cyan'
  },
  'hr-service': {
    image: '/images/industries/manufacturing.jpg', // 製造業画像を使用
    gradient: 'from-pink-600 to-rose-800',
    icon: '',
    concept: '人材サービス業界の変革とマッチング精度向上',
    color: 'pink'
  },
  'marketing': {
    image: '/images/industries/marketing.jpg',
    gradient: 'from-violet-600 to-purple-800',
    icon: '',
    concept: 'マーケティング業界のデータ活用と施策最適化',
    color: 'violet'
  },
  'government': {
    image: '/images/industries/government.jpg',
    gradient: 'from-emerald-600 to-green-800',
    icon: '',
    concept: '自治体・公共機関のデジタル化とサービス向上',
    color: 'emerald'
  },
  'default': {
    image: '/images/industries/manufacturing.jpg', // デフォルトは製造業画像を使用
    gradient: 'from-blue-600 to-cyan-800',
    icon: '',
    concept: 'AI技術で業界の常識を覆す、革新的なソリューション',
    color: 'blue'
  }
};

// 動的メタデータ生成
export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) {
    return {
      title: 'カテゴリが見つかりません',
    };
  }

  const config = categoryConfig[slug] || categoryConfig.default;

  return {
    title: `${category.name} | 業界別AIソリューション | 株式会社エヌアンドエス`,
    description: `${category.description || config.concept} 株式会社エヌアンドエスが提供する${category.name}分野のAI導入支援・リスキリング研修・業務効率化ソリューション。`,
    openGraph: {
      title: `${category.name} | 業界別AIソリューション`,
      description: category.description || config.concept,
      images: [config.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | 業界別AIソリューション`,
      description: category.description || config.concept,
      images: [config.image],
    },
  };
}

export default async function CategoryPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  // カテゴリー情報の取得
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError);
    notFound();
  }

  // カテゴリーに属する記事の取得
  const { data: postsData, error: postsError } = await supabase
    .from('chatgpt_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      thumbnail_url,
      featured_image,
      category:categories(name, slug)
    `)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return null;
  }

  // 画像URLの処理
  const posts = (postsData || []).map((post: any) => {
    const imageUrl = post.thumbnail_url || post.featured_image;
    const finalImageUrl = imageUrl 
      ? imageUrl.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
      : null;

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      thumbnail_url: finalImageUrl,
      featured_image: finalImageUrl,
      category: post.category?.[0] ? {
        name: post.category[0].name,
        slug: post.category[0].slug
      } : undefined
    };
  });

  const config = categoryConfig[slug] || categoryConfig.default;
  const postsCount = posts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション - ヘッダーとの適切なスペース確保 */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* 背景画像 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
          style={{
            backgroundImage: config.image ? `url(${config.image})` : 'none'
          }}
        ></div>
        
        {/* グラデーションオーバーレイ */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} ${config.image ? 'opacity-75' : 'opacity-90'}`}></div>
        
        {/* 追加のダークオーバーレイ（テキスト可読性向上） - 画像がある場合のみ */}
        {config.image && (
          <div className="absolute inset-0 bg-black opacity-20"></div>
        )}
        
        {/* 背景パターン（オプション） */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center text-white">
            {/* カテゴリーアイコン */}
            <div className="text-6xl mb-6">{config.icon}</div>
            
            {/* カテゴリー名 */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
              <span className="block sm:inline">
                {category.name.includes('向け') ? category.name.split('向け')[0] + '向け' : 
                 category.name.includes('業界') ? category.name.split('業界')[0] + '業界' :
                 category.name.includes('・') ? category.name.split('・')[0] :
                 category.name.split(' ')[0]}
              </span>
              {category.name.includes('向け') && (
                <span className="block sm:inline sm:ml-2">{category.name.split('向け')[1]}</span>
              )}
              {!category.name.includes('向け') && category.name.includes('業界') && (
                <span className="block sm:inline sm:ml-2">{category.name.split('業界')[1]}</span>
              )}
              {!category.name.includes('向け') && !category.name.includes('業界') && category.name.includes('・') && (
                <span className="block sm:inline sm:ml-2">・{category.name.split('・').slice(1).join('・')}</span>
              )}
              {!category.name.includes('向け') && !category.name.includes('業界') && !category.name.includes('・') && category.name.split(' ').length > 1 && (
                <span className="block sm:inline sm:ml-2">{category.name.split(' ').slice(1).join(' ')}</span>
              )}
            </h1>
            
            {/* コンセプト */}
            <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-95 drop-shadow-md leading-relaxed">
              {category.description || config.concept}
            </p>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">{postsCount}</div>
                <div className="text-sm opacity-90">関連記事</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">5+</div>
                <div className="text-sm opacity-90">年の実績</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">13</div>
                <div className="text-sm opacity-90">導入企業</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ナビゲーション・フィルター */}
      <section className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">記事一覧</span>
              <span className={`bg-${config.color}-100 text-${config.color}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                {postsCount}件の記事
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">並び順:</span>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>最新順</option>
                <option>人気順</option>
                <option>タイトル順</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 自治体・公共機関専門セクション - governmentの場合のみ表示 */}
      {slug === 'government' && (
        <>
          {/* 自治体・公共機関のDX変革とAI活用 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    自治体・公共機関DX革命：住民サービス向上と業務効率化
                  </h2>
                  <p className="text-xl text-gray-600">
                    AI申請処理、電子行政サービス、データ活用で住民満足度向上と職員負荷軽減を実現
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">自治体・公共機関の現状課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">紙ベース業務・手作業による非効率</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">窓口待ち時間・住民サービス品質低下</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">職員業務負荷増大・人材不足</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">情報共有・連携不足による重複業務</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">データ活用不足・政策立案の困難</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-emerald-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-emerald-800 mb-6">AI・DX化による解決策</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI申請処理・自動審査システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">24時間オンライン行政サービス</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AIチャットボット・市民相談自動化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">庁内業務システム統合・連携強化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">ビッグデータ活用・政策立案支援</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 導入実績データ */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">弊社自治体・公共機関DXソリューション導入実績</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-65%</div>
                      <p className="text-sm">申請処理時間短縮</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+180%</div>
                      <p className="text-sm">住民満足度向上</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">13団体</div>
                      <p className="text-sm">自治体・公共機関でのDX導入実績</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 電子行政・AI申請処理システム */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    自治体・公共機関向け統合DXソリューション
                  </h2>
                  <p className="text-xl text-gray-600">
                    住民サービスから職員業務まで、行政業務全体をデジタル化・効率化
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AI申請処理システム */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI申請処理システム</h3>
                    <p className="text-gray-600 mb-4">AIが申請内容を自動解析・審査。住民票・証明書発行を即座に処理</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 申請書類の自動読み取り・データ化</li>
                      <li>• AI審査による承認・却下判定</li>
                      <li>• 不備チェック・修正提案自動化</li>
                      <li>• 各種証明書の即時発行対応</li>
                    </ul>
                  </div>

                  {/* 住民サービスポータル */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">住民サービスポータル</h3>
                    <p className="text-gray-600 mb-4">24時間365日アクセス可能なワンストップ行政サービス。スマホ完結で手続き可能</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 各種申請・届出のオンライン完結</li>
                      <li>• マイページでの進捗確認・履歴管理</li>
                      <li>• 電子決済・手数料オンライン納付</li>
                      <li>• 多言語対応・アクセシビリティ配慮</li>
                    </ul>
                  </div>

                  {/* AIチャットボット・相談システム */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIチャットボット</h3>
                    <p className="text-gray-600 mb-4">24時間対応の市民相談AI。制度案内から手続き方法まで即座に回答</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 市民からの問い合わせ自動対応</li>
                      <li>• 手続き方法・必要書類の案内</li>
                      <li>• 制度・サービス内容の詳細説明</li>
                      <li>• 複雑な相談は職員へエスカレーション</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* データ活用・政策立案支援 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    ビッグデータ活用・政策立案支援システム
                  </h2>
                  <p className="text-xl text-gray-600">
                    住民データ・統計データを活用したエビデンスベース政策立案支援
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">データ統合・分析基盤</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>各部署データの統合・一元管理</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>人口動態・経済指標リアルタイム分析</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>予測モデルによる将来動向シミュレーション</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>ダッシュボードでの可視化・共有</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-green-800 mb-4">AI政策効果予測・最適化</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>政策実施前の効果予測・影響分析</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>予算配分最適化アルゴリズム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>地域特性に応じた施策カスタマイズ</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>成果指標の自動追跡・評価システム</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* DX効果実績 */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">自治体DX効果実績（過去12ヶ月）</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-65%</div>
                      <p className="text-sm">申請処理時間短縮</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+180%</div>
                      <p className="text-sm">住民満足度向上</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-45%</div>
                      <p className="text-sm">職員業務負荷軽減</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">24時間</div>
                      <p className="text-sm">サービス提供体制</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 情報セキュリティ・マイナンバー対応 */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    情報セキュリティ・法令遵守対応
                  </h2>
                  <p className="text-xl text-gray-600">
                    政府ガイドライン準拠のセキュリティ体制でマイナンバー・個人情報を安全に管理
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* セキュリティ対策 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">堅牢なセキュリティ対策</h3>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">政府セキュリティガイドライン準拠</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>自治体情報セキュリティポリシー完全対応</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>マイナンバー利用事務系・情報提供NW系対応</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>三層分離・無害化対応システム構築</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">法令遵守・監査対応</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>個人情報保護法・マイナンバー法対応</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>アクセスログ・操作ログ完全記録</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>定期監査・脆弱性診断実施</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 導入効果 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">導入による効果実績</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">-65%</div>
                        <div className="text-sm text-gray-600">申請処理時間</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">+180%</div>
                        <div className="text-sm text-gray-600">住民満足度</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">-45%</div>
                        <div className="text-sm text-gray-600">職員業務負荷</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">0件</div>
                        <div className="text-sm text-gray-600">情報漏洩事故</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">導入自治体の声</h4>
                      <blockquote className="text-gray-600 italic">
                        「DX導入により住民サービスが劇的に向上しました。24時間申請受付で住民の利便性が大幅に改善され、職員の業務負荷も軽減されています。セキュリティ面でも政府ガイドライン準拠で安心です。」
                        <footer className="text-sm text-gray-500 mt-2">- A市 情報政策課長</footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入プロセス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    自治体・公共機関DXソリューション導入の流れ
                  </h2>
                  <p className="text-xl text-gray-600">
                    6ヶ月で住民サービスから庁内業務まで完全DX化
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">現状分析・要件定義（第1-2ヶ月）</h3>
                      <p className="text-gray-600 mb-3">既存業務プロセス・システムの詳細分析と住民ニーズ調査</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>業務分析:</strong> 各部署業務プロセス・課題の詳細調査
                          </div>
                          <div>
                            <strong>要件定義:</strong> セキュリティ・法令要件の詳細設計
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">システム構築・セキュリティ対策（第3-4ヶ月）</h3>
                      <p className="text-gray-600 mb-3">住民サービスポータル・庁内システム構築・セキュリティ実装</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>システム構築:</strong> AI申請処理・住民ポータル開発
                          </div>
                          <div>
                            <strong>セキュリティ:</strong> 三層分離・暗号化・監査機能実装
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">職員研修・本格運用（第5-6ヶ月）</h3>
                      <p className="text-gray-600 mb-3">職員研修・住民向け説明会・段階的サービス開始</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>研修・説明:</strong> 職員向け操作研修・住民向け利用説明
                          </div>
                          <div>
                            <strong>運用開始:</strong> 段階的サービス開始・効果測定
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・ROI */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    自治体・公共機関DX導入による効果実績
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際の導入自治体での住民満足度向上・業務効率化データ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-emerald-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">-65%</div>
                    <div className="text-gray-700">申請処理時間短縮</div>
                    <div className="text-sm text-gray-500 mt-1">AI自動処理で</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">+180%</div>
                    <div className="text-gray-700">住民満足度向上</div>
                    <div className="text-sm text-gray-500 mt-1">24時間サービスで</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">-45%</div>
                    <div className="text-gray-700">職員業務負荷軽減</div>
                    <div className="text-sm text-gray-500 mt-1">自動化・効率化で</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">10ヶ月</div>
                    <div className="text-gray-700">投資回収期間</div>
                    <div className="text-sm text-gray-500 mt-1">人件費削減効果で</div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">自治体・公共機関DXソリューションの導入相談</h3>
                  <p className="text-lg mb-6 opacity-90">
                    貴自治体・公共機関に最適なDXソリューションをご提案いたします。政府ガイドライン準拠で安心・安全な導入をサポート。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料DX診断・相談を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      自治体DX成功事例資料をダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* マーケティング・広告専門セクション - marketingの場合のみ表示 */}
      {slug === 'marketing' && (
        <>
          {/* マーケティング業界のAI革命とデジタル変革 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    マーケティング・広告業界AI革命：SNS戦略からコンテンツ自動生成まで
                  </h2>
                  <p className="text-xl text-gray-600">
                    AI台本作成、SNSコンテンツ自動生成、データ解析で ROI最大化とクリエイティブ効率化を実現
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">マーケティング・広告業界の現状課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">SNSコンテンツ制作の時間・コスト負荷</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">データ分析の属人化・効果測定困難</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">動画・画像制作の外注コスト増大</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">クリエイティブ戦略の一貫性不足</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">リアルタイム最適化・A/Bテスト困難</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-emerald-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-emerald-800 mb-6">AI・SNS統合ソリューション</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI台本作成・SNSコンテンツ自動生成</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">リアルタイムデータ解析・ROI可視化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI動画・画像生成・編集自動化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">統合クリエイティブ戦略・ブランド一貫性</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI自動A/Bテスト・リアルタイム最適化</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 導入実績データ */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">弊社マーケティング・広告AI導入実績</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+340%</div>
                      <p className="text-sm">SNSエンゲージメント向上</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-70%</div>
                      <p className="text-sm">コンテンツ制作時間短縮</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">13社</div>
                      <p className="text-sm">マーケティング・広告代理店での導入実績</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AIコンテンツ自動生成・SNS統合プラットフォーム */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    マーケティング・広告向けAI統合プラットフォーム
                  </h2>
                  <p className="text-xl text-gray-600">
                    SNSコンテンツから動画台本まで、マーケティング業務全体をAI自動化
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AIコンテンツ・台本生成システム */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIコンテンツ・台本生成</h3>
                    <p className="text-gray-600 mb-4">ブランドトーンに合わせたSNS投稿、動画台本、メルマガを自動生成</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Instagram・TikTok・YouTube台本自動作成</li>
                      <li>• ブランドトーン学習・一貫性保持</li>
                      <li>• ハッシュタグ・キャプション最適化</li>
                      <li>• 多言語・多チャネル同時展開</li>
                    </ul>
                  </div>

                  {/* SNSデータ解析・ROI可視化 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">SNSデータ解析・ROI可視化</h3>
                    <p className="text-gray-600 mb-4">全SNSプラットフォームのデータを統合分析。ROI・ROAS自動算出</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Instagram・TikTok・YouTube・X統合分析</li>
                      <li>• エンゲージメント・コンバージョン追跡</li>
                      <li>• ROI・ROAS・LTV自動算出</li>
                      <li>• 競合分析・ベンチマーク比較</li>
                    </ul>
                  </div>

                  {/* AI動画・画像生成・編集 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI動画・画像生成</h3>
                    <p className="text-gray-600 mb-4">商品画像からSNS動画まで、プロレベルのクリエイティブを自動生成</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 商品・サービス画像自動生成</li>
                      <li>• SNS動画・リール自動編集</li>
                      <li>• バナー・広告クリエイティブ作成</li>
                      <li>• ブランドガイドライン準拠デザイン</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SNS戦略・コンテンツマーケティング自動化 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    SNS戦略・コンテンツマーケティング完全自動化
                  </h2>
                  <p className="text-xl text-gray-600">
                    戦略立案から投稿・分析まで、SNSマーケティング全工程をAI自動化
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-purple-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-purple-800 mb-4">AI戦略立案・コンテンツ企画</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>ターゲット分析・ペルソナ自動生成</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>コンテンツカレンダー・投稿スケジュール最適化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>トレンド・ハッシュタグ分析・提案</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>競合コンテンツ分析・差別化戦略</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">AI投稿自動化・最適化</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>最適投稿時間AI予測・自動投稿</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>リアルタイムA/Bテスト・自動最適化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>エンゲージメント予測・改善提案</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>インフルエンサー・UGC自動発見・活用</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* SNS効果実績 */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">SNS・コンテンツマーケティングAI導入効果実績</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+340%</div>
                      <p className="text-sm">SNSエンゲージメント向上</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-70%</div>
                      <p className="text-sm">コンテンツ制作時間</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+280%</div>
                      <p className="text-sm">リーチ・インプレッション</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+450%</div>
                      <p className="text-sm">SNSからのCV数</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI台本作成・動画マーケティング */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    AI台本作成・動画マーケティング自動化
                  </h2>
                  <p className="text-xl text-gray-600">
                    YouTube・TikTok・Instagram向け台本からライブ配信まで完全AI対応
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* AI台本作成システム */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">AI台本作成・シナリオ生成</h3>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">プラットフォーム別台本最適化</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>YouTube：長編動画・教育コンテンツ台本</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>TikTok：15-60秒ショート動画台本</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Instagram：リール・ストーリーズ台本</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>X（Twitter）：動画投稿・スペース台本</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">AIシナリオ・演出提案</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>ストーリーテリング・構成自動生成</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>感情フック・エンゲージメント最適化</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>CTA・行動喚起フレーズ自動生成</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 動画マーケティング効果 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">動画マーケティングAI導入効果</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">-80%</div>
                        <div className="text-sm text-gray-600">台本作成時間</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">+380%</div>
                        <div className="text-sm text-gray-600">動画視聴完了率</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">+520%</div>
                        <div className="text-sm text-gray-600">動画経由CV数</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">-60%</div>
                        <div className="text-sm text-gray-600">動画制作コスト</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">導入企業の声</h4>
                      <blockquote className="text-gray-600 italic">
                        「AI台本作成で動画制作が劇的に効率化されました。TikTokのバイラル台本をAIが自動生成し、エンゲージメントが5倍向上。動画マーケティングのROIが大幅に改善しています。」
                        <footer className="text-sm text-gray-500 mt-2">- B社 マーケティング部長</footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入プロセス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    マーケティング・SNS AI導入の流れ
                  </h2>
                  <p className="text-xl text-gray-600">
                    3ヶ月でSNS戦略からコンテンツ自動生成まで完全AI化
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">ブランド分析・戦略設計（第1ヶ月）</h3>
                      <p className="text-gray-600 mb-3">既存SNSデータ分析とブランドトーン学習・AI戦略カスタマイズ</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>ブランド分析:</strong> 既存SNS・コンテンツ・ターゲット詳細分析
                          </div>
                          <div>
                            <strong>AI学習:</strong> ブランドトーン・デザインガイドライン学習
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AIシステム構築・連携（第2ヶ月）</h3>
                      <p className="text-gray-600 mb-3">コンテンツ自動生成・SNS投稿・分析システム構築・連携</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>システム構築:</strong> AIコンテンツ生成・台本作成システム
                          </div>
                          <div>
                            <strong>SNS連携:</strong> Instagram・TikTok・YouTube API連携
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">運用開始・最適化（第3ヶ月）</h3>
                      <p className="text-gray-600 mb-3">チーム研修・本格運用開始・AI学習最適化・効果測定</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>研修・運用:</strong> チーム向けAIツール操作研修
                          </div>
                          <div>
                            <strong>最適化:</strong> AIパフォーマンス調整・効果測定
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・ROI */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    マーケティング・SNS AI導入による効果実績
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際の導入企業でのSNSエンゲージメント向上・制作効率化データ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">+340%</div>
                    <div className="text-gray-700">SNSエンゲージメント</div>
                    <div className="text-sm text-gray-500 mt-1">AI最適化で</div>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">-70%</div>
                    <div className="text-gray-700">コンテンツ制作時間</div>
                    <div className="text-sm text-gray-500 mt-1">AI自動生成で</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">+450%</div>
                    <div className="text-gray-700">SNSからのCV数</div>
                    <div className="text-sm text-gray-500 mt-1">戦略最適化で</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">6ヶ月</div>
                    <div className="text-gray-700">投資回収期間</div>
                    <div className="text-sm text-gray-500 mt-1">制作費削減で</div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">SNS・マーケティングAIソリューションの導入相談</h3>
                  <p className="text-lg mb-6 opacity-90">
                    貴社ブランドに最適化されたAIコンテンツ生成・SNS戦略をご提案いたします。台本作成からデータ解析まで完全自動化。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料SNS・AI診断を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      AI台本・コンテンツ生成デモを見る
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 物流・運輸専門セクション - logisticsの場合のみ表示 */}
      {slug === 'logistics' && (
        <>
          {/* 物流・運輸業界のDX変革とAI活用 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    物流・運輸業界AI革命：配送効率化とコスト削減DX
                  </h2>
                  <p className="text-xl text-gray-600">
                    AI配送ルート最適化、自動倉庫管理、予測メンテナンスで物流業務を劇的に効率化
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">物流・運輸業界の現状課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">配送コスト増大・燃料費高騰</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">ドライバー不足・労働力確保困難</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">倉庫作業の非効率性・ミス発生</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">配送状況の可視化不足</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">車両・設備メンテナンス負荷</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-amber-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-amber-800 mb-6">AI・DX化による解決策</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI配送ルート最適化（30%コスト削減）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">自動倉庫・ロボット化システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI在庫管理・需要予測システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">リアルタイム配送追跡・分析</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">予測メンテナンス・故障防止AI</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 導入実績データ */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">弊社物流・運輸DXソリューション導入実績</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-35%</div>
                      <p className="text-sm">配送コスト削減効果</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+68%</div>
                      <p className="text-sm">配送効率向上</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">13社</div>
                      <p className="text-sm">物流・運輸企業でのDX導入実績</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI配送最適化・スマート物流 */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    物流・運輸向け統合AIソリューション
                  </h2>
                  <p className="text-xl text-gray-600">
                    配送から倉庫管理まで、物流業務全体を最適化するスマートシステム
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AI配送ルート最適化 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI配送ルート最適化</h3>
                    <p className="text-gray-600 mb-4">リアルタイム交通情報・天候・配送優先度を考慮した最適ルート自動生成</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 動的ルート最適化（渋滞・工事回避）</li>
                      <li>• 燃料消費量最小化アルゴリズム</li>
                      <li>• 配送時間窓制約対応</li>
                      <li>• マルチドロップ配送効率化</li>
                    </ul>
                  </div>

                  {/* スマート倉庫管理 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">スマート倉庫管理</h3>
                    <p className="text-gray-600 mb-4">AI・IoT・ロボット活用で倉庫作業を自動化。ピッキング精度99.9%を実現</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• AI自動ピッキング・仕分けシステム</li>
                      <li>• ロボット在庫管理・棚卸自動化</li>
                      <li>• 最適保管場所AI配置</li>
                      <li>• 入出庫作業効率化・ミス防止</li>
                    </ul>
                  </div>

                  {/* 予測メンテナンス */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">予測メンテナンス</h3>
                    <p className="text-gray-600 mb-4">IoTセンサー・AI解析で車両・設備の故障を事前予測。ダウンタイムを最小化</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 車両状態リアルタイム監視</li>
                      <li>• 故障予測・部品交換タイミング算出</li>
                      <li>• メンテナンススケジュール自動最適化</li>
                      <li>• 突発故障80%削減実績</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ラストワンマイル配送・ドローン活用 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    次世代配送システム・ラストワンマイル最適化
                  </h2>
                  <p className="text-xl text-gray-600">
                    ドローン・自動配送ロボット・置き配システムで配送革命を実現
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">次世代配送技術</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>ドローン配送システム（山間部・離島対応）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>自動配送ロボット（市街地配送）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>AIスマート置き配システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>配送時間予測・顧客通知自動化</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-green-800 mb-4">配送品質向上・顧客満足度</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>リアルタイム配送状況追跡システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>配送品質モニタリング（温度・振動）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>配送ミス・破損ゼロ化システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>顧客フィードバック自動収集・分析</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 配送効率化実績 */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">配送効率化実績（過去12ヶ月）</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-35%</div>
                      <p className="text-sm">配送コスト削減</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+68%</div>
                      <p className="text-sm">配送効率向上</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-80%</div>
                      <p className="text-sm">配送ミス削減</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+156%</div>
                      <p className="text-sm">顧客満足度向上</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 物流データ分析・可視化 */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    物流データ分析・可視化プラットフォーム
                  </h2>
                  <p className="text-xl text-gray-600">
                    AIダッシュボードで物流KPIをリアルタイム監視・改善提案
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* データ分析機能 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">データ分析・可視化機能</h3>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">リアルタイムKPIダッシュボード</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>配送時間・コスト・品質の統合監視</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>配送ルート効率性の可視化</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>ドライバー作業負荷分析</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">AI改善提案システム</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>配送効率改善ポイントの自動識別</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>コスト削減施策の優先度算出</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>業務プロセス最適化提案</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 導入効果 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">導入による効果実績</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">-35%</div>
                        <div className="text-sm text-gray-600">配送コスト削減</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">+68%</div>
                        <div className="text-sm text-gray-600">配送効率向上</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">-80%</div>
                        <div className="text-sm text-gray-600">突発故障削減</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">99.9%</div>
                        <div className="text-sm text-gray-600">配送品質精度</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">お客様の声</h4>
                      <blockquote className="text-gray-600 italic">
                        「AI配送最適化により、燃料費を大幅削減しながら配送品質も向上しました。特に、予測メンテナンスで車両故障がほぼゼロになったのは驚きです。」
                        <footer className="text-sm text-gray-500 mt-2">- 大手物流企業 運行管理部長</footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入プロセス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    物流・運輸DXソリューション導入の流れ
                  </h2>
                  <p className="text-xl text-gray-600">
                    4ヶ月で配送システムから倉庫管理まで完全DX化
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">現状分析・配送データ収集（第1ヶ月）</h3>
                      <p className="text-gray-600 mb-3">既存配送ルート・コスト・効率性の詳細分析と改善ポイント特定</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>データ収集:</strong> 配送ルート・時間・コストの全データ分析
                          </div>
                          <div>
                            <strong>課題特定:</strong> 非効率ポイント・改善優先度の洗い出し
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AIシステム構築・テスト運用（第2-3ヶ月）</h3>
                      <p className="text-gray-600 mb-3">配送最適化AI・倉庫管理システムの構築・段階的テスト</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>AI構築:</strong> ルート最適化・需要予測・メンテナンスAI
                          </div>
                          <div>
                            <strong>テスト:</strong> 一部車両・ルートでの先行導入・検証
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">本格運用・効果測定（第4ヶ月）</h3>
                      <p className="text-gray-600 mb-3">全車両・全ルート展開と継続的な最適化・効果測定</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>運用開始:</strong> 全社システム本格稼働・ドライバー研修
                          </div>
                          <div>
                            <strong>継続改善:</strong> KPI監視・AIアルゴリズム継続学習
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・ROI */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    物流・運輸DX導入による経営効果実績
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際の導入企業でのコスト削減・効率化データ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-amber-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-amber-600 mb-2">-35%</div>
                    <div className="text-gray-700">配送コスト削減</div>
                    <div className="text-sm text-gray-500 mt-1">燃料費・人件費含む</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">+68%</div>
                    <div className="text-gray-700">配送効率向上</div>
                    <div className="text-sm text-gray-500 mt-1">ルート最適化で</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">-80%</div>
                    <div className="text-gray-700">突発故障削減</div>
                    <div className="text-sm text-gray-500 mt-1">予測メンテナンスで</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">7ヶ月</div>
                    <div className="text-gray-700">投資回収期間</div>
                    <div className="text-sm text-gray-500 mt-1">ROI 250%達成</div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">物流・運輸DXソリューションの導入相談</h3>
                  <p className="text-lg mb-6 opacity-90">
                    貴社の物流業務に最適なAI・DXソリューションをご提案いたします。まずは無料診断から始めませんか？
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-amber-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料物流DX診断を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      物流DX成功事例資料をダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 小売・EC専門セクション - retailの場合のみ表示 */}
      {slug === 'retail' && (
        <>
          {/* 小売・EC業界のDX変革とAI活用 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    小売・EC業界AI革命：顧客体験向上とデータ活用DX
                  </h2>
                  <p className="text-xl text-gray-600">
                    AIパーソナライゼーション、需要予測、在庫最適化で競争優位性を確立
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">小売・EC業界の現状課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">過剰在庫・機会損失の発生</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">顧客行動の見える化不足</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">店舗・オンライン連携の不備</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">価格競争による利益率低下</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">人手不足による運営負荷</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-purple-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-purple-800 mb-6">AI・DX化による解決策</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI需要予測で在庫最適化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">行動分析による顧客理解</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">オムニチャネル統合システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AIダイナミックプライシング</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">業務自動化・省人化システム</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 導入実績データ */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">弊社小売・EC DXソリューション導入実績</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+185%</div>
                      <p className="text-sm">売上高向上（AI導入後1年間）</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-42%</div>
                      <p className="text-sm">在庫コスト削減効果</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">13社</div>
                      <p className="text-sm">小売・EC企業でのDX導入実績</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AIパーソナライゼーション・レコメンドエンジン */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    小売・EC向け統合AIソリューション
                  </h2>
                  <p className="text-xl text-gray-600">
                    顧客体験向上から在庫管理まで、売上最大化を実現するAIプラットフォーム
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AIパーソナライゼーション */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIパーソナライゼーション</h3>
                    <p className="text-gray-600 mb-4">個人の購買履歴・行動データから最適な商品を推薦。クロスセル・アップセルを自動化</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 購買予測AIによる個別商品推薦</li>
                      <li>• リアルタイム行動分析レコメンド</li>
                      <li>• カート離脱防止AI配信</li>
                      <li>• 季節・トレンド考慮の提案最適化</li>
                    </ul>
                  </div>

                  {/* AI需要予測・在庫最適化 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI需要予測・在庫最適化</h3>
                    <p className="text-gray-600 mb-4">過去データ・外部要因分析で精密な需要予測。過剰在庫・品切れリスクを最小化</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 気象・イベント連動需要予測</li>
                      <li>• 商品別最適発注量自動算出</li>
                      <li>• 安全在庫水準の動的調整</li>
                      <li>• 廃棄ロス削減アルゴリズム</li>
                    </ul>
                  </div>

                  {/* オムニチャネル統合 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">オムニチャネル統合</h3>
                    <p className="text-gray-600 mb-4">店舗・EC・SNS・アプリを統合管理。一元化された顧客データで最適なアプローチを実現</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 店舗・オンライン在庫リアルタイム連携</li>
                      <li>• 顧客行動の360度一元管理</li>
                      <li>• チャネル横断キャンペーン自動化</li>
                      <li>• 統合ポイント・会員システム</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ダイナミックプライシング・競合分析 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    AIダイナミックプライシング・競合分析システム
                  </h2>
                  <p className="text-xl text-gray-600">
                    リアルタイム価格最適化で利益率向上と競争優位性を確保
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">リアルタイム価格最適化</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>競合他社価格の24時間自動監視</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>需要・在庫状況に応じた動的価格調整</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>季節要因・イベント連動価格戦略</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>利益率最大化アルゴリズム</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-green-800 mb-4">顧客行動分析・離脱防止</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>カート離脱予測とリアルタイム介入</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>購買完了率向上のUI/UX最適化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>リピート購入促進の自動マーケティング</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>顧客生涯価値（LTV）最大化施策</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 売上・利益向上実績 */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">売上・利益向上実績（過去12ヶ月）</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+185%</div>
                      <p className="text-sm">売上高増加率</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+67%</div>
                      <p className="text-sm">粗利率改善</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-42%</div>
                      <p className="text-sm">在庫コスト削減</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+234%</div>
                      <p className="text-sm">リピート購入率向上</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 店舗DX・無人化ソリューション */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    次世代店舗DX・スマートリテールソリューション
                  </h2>
                  <p className="text-xl text-gray-600">
                    無人化・省人化で運営コスト削減と顧客体験向上を両立
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* スマート店舗機能 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">スマート店舗機能</h3>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">AI画像認識レジシステム</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>商品自動認識・価格計算（99.5%精度）</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>キャッシュレス決済完全対応</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>レジ待ち時間ゼロ化実現</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">IoT在庫管理システム</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>RFIDタグによるリアルタイム在庫把握</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>自動発注・補充システム</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>盗難・万引き防止AI監視</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 導入効果 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">運営コスト削減効果</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">-65%</div>
                        <div className="text-sm text-gray-600">人件費削減</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">-88%</div>
                        <div className="text-sm text-gray-600">レジ待ち時間</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">+340%</div>
                        <div className="text-sm text-gray-600">顧客満足度</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">-35%</div>
                        <div className="text-sm text-gray-600">万引き・ロス率</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">お客様の声</h4>
                      <blockquote className="text-gray-600 italic">
                        「AI導入により、レジ業務の自動化と在庫管理の効率化を実現。人件費を大幅削減しながら、お客様の満足度も向上しました。特に、商品認識の精度の高さに驚いています。」
                        <footer className="text-sm text-gray-500 mt-2">- 大手小売チェーン店 店長</footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入プロセス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    小売・EC DXソリューション導入の流れ
                  </h2>
                  <p className="text-xl text-gray-600">
                    3ヶ月でAI基盤から店舗システムまで完全構築
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">現状分析・システム設計（第1ヶ月）</h3>
                      <p className="text-gray-600 mb-3">既存売上・在庫データの分析とAIソリューション設計</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>データ分析:</strong> 売上・顧客・在庫データの詳細分析
                          </div>
                          <div>
                            <strong>設計:</strong> オムニチャネル・AI機能の詳細設計
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AIシステム構築・テスト運用（第2ヶ月）</h3>
                      <p className="text-gray-600 mb-3">レコメンドAI・在庫最適化システムの構築・テスト</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>AI構築:</strong> 需要予測・パーソナライゼーションAI
                          </div>
                          <div>
                            <strong>テスト:</strong> 一部店舗での先行導入・検証
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">本格運用・効果測定（第3ヶ月）</h3>
                      <p className="text-gray-600 mb-3">全店舗展開と継続的な効果測定・改善</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>運用開始:</strong> 全店舗・全システム本格稼働
                          </div>
                          <div>
                            <strong>継続改善:</strong> 効果測定・AI学習データ活用
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・ROI */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    小売・EC DX導入による経営効果実績
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際の導入企業での売上・利益向上データ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">+185%</div>
                    <div className="text-gray-700">売上高向上</div>
                    <div className="text-sm text-gray-500 mt-1">AI導入1年間</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">+67%</div>
                    <div className="text-gray-700">粗利率改善</div>
                    <div className="text-sm text-gray-500 mt-1">価格最適化で</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">-65%</div>
                    <div className="text-gray-700">運営コスト削減</div>
                    <div className="text-sm text-gray-500 mt-1">省人化・自動化で</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">6ヶ月</div>
                    <div className="text-gray-700">投資回収期間</div>
                    <div className="text-sm text-gray-500 mt-1">ROI 320%達成</div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">小売・EC DXソリューションの導入相談</h3>
                  <p className="text-lg mb-6 opacity-90">
                    貴社の事業規模・業態に最適なAI・DXソリューションをご提案いたします。まずは無料診断から始めませんか？
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料DX診断を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      小売DX成功事例資料をダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* HR・人材サービス専門セクション - hr-serviceの場合のみ表示 */}
      {slug === 'hr-service' && (
        <>
          {/* 人材業界のAI革命とマッチング精度向上 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    人材業界AI革命：マッチング精度とDX化の実現
                  </h2>
                  <p className="text-xl text-gray-600">
                    AI技術で求職者と企業の最適なマッチングを実現し、人材紹介業務を劇的に効率化
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">人材業界の現状課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">マッチング精度の低さ（成約率15%以下）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">履歴書・職務経歴書の手作業チェック</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">スキル・経験の定量評価が困難</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">アフターフォローの属人化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">退職手続きの煩雑さ</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-pink-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-pink-800 mb-6">AI・DX化による解決策</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AIマッチングで成約率60%向上</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">履歴書・職務経歴書の自動生成</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">RAGベーススキル評価システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AIエージェントによる24時間対応</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">退職届自動生成・手続き支援</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 導入実績データ */}
                <div className="bg-gradient-to-r from-pink-600 to-rose-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">弊社人材DXソリューション導入実績</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">340%</div>
                      <p className="text-sm">マッチング精度向上（15%→51%）</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-85%</div>
                      <p className="text-sm">書類作成時間の削減効果</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">13社</div>
                      <p className="text-sm">人材会社でのDX導入実績</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 人材DXソリューション詳細 */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    人材業界向け統合AIソリューション
                  </h2>
                  <p className="text-xl text-gray-600">
                    求人サイト構築からAIマッチング、書類自動生成まで一気通貫でサポート
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AIマッチングエンジン */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIマッチングエンジン</h3>
                    <p className="text-gray-600 mb-4">機械学習とRAG技術でスキル・経験・志向性を多次元分析し、最適な求職者と企業をマッチング</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• スキルベクトル化による精密マッチング</li>
                      <li>• 過去実績データからの成功パターン学習</li>
                      <li>• リアルタイム適合度スコア算出</li>
                      <li>• マッチング理由の可視化・説明</li>
                    </ul>
                  </div>

                  {/* 書類自動生成システム */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">書類自動生成AI</h3>
                    <p className="text-gray-600 mb-4">履歴書・職務経歴書・退職届を対話形式で自動生成。業界テンプレートで通過率向上</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 職務経歴書の自動構造化</li>
                      <li>• 業界別テンプレート最適化</li>
                      <li>• 退職届・引継書の法的要件対応</li>
                      <li>• PDF/Word形式での出力対応</li>
                    </ul>
                  </div>

                  {/* AIエージェント・チャットボット */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIエージェント</h3>
                    <p className="text-gray-600 mb-4">24時間対応のAIキャリアアドバイザーが転職相談から面接対策まで包括サポート</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 初回キャリア相談の自動化</li>
                      <li>• 面接対策・想定質問の生成</li>
                      <li>• 給与交渉のアドバイス提供</li>
                      <li>• 転職後のアフターフォロー</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 求人サイト構築とSEO最適化 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    オーガニック流入特化型求人サイト構築
                  </h2>
                  <p className="text-xl text-gray-600">
                    検索エンジンからの自然流入を最大化する人材サイト設計・運用
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">SEO最適化設計</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>求人詳細ページの構造化データ実装</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>職種・業界別ランディングページ自動生成</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>コンテンツSEOによる集客記事量産</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>地域×職種の複合キーワード対策</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-green-800 mb-4">レコメンド機能強化</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>ユーザー行動分析による求人推薦</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>類似職歴者のキャリアパス提示</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>スキルギャップ分析・研修提案</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>給与予測・市場価値算出機能</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* オーガニック流入実績 */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">オーガニック流入実績（過去12ヶ月）</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">+420%</div>
                      <p className="text-sm">検索流入増加率</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">1,280</div>
                      <p className="text-sm">上位表示キーワード数</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">68%</div>
                      <p className="text-sm">求人応募コンバージョン率</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-78%</div>
                      <p className="text-sm">求人広告費削減効果</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RAG活用スキル評価システム */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    RAG活用スキル評価・マッチングシステム
                  </h2>
                  <p className="text-xl text-gray-600">
                    大規模言語モデルと実績データベースを組み合わせた高精度スキル評価
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* RAGシステム概要 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">RAG（Retrieval-Augmented Generation）とは</h3>
                    <p className="text-gray-600">
                      蓄積された人材データベースから関連情報を取得し、AIが文脈を理解してスキル評価や求人マッチングを行う最新技術です。
                    </p>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">RAG活用の具体例</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>過去の成功転職事例からマッチングパターンを学習</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>業界固有のスキル要件を動的に更新・評価</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>求職者の潜在スキルを職歴から自動抽出</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 導入効果 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">導入による効果実績</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">89%</div>
                        <div className="text-sm text-gray-600">スキル評価精度</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">-92%</div>
                        <div className="text-sm text-gray-600">評価時間短縮</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">+156%</div>
                        <div className="text-sm text-gray-600">内定率向上</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">24時間</div>
                        <div className="text-sm text-gray-600">評価レポート生成</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">お客様の声</h4>
                      <blockquote className="text-gray-600 italic">
                        「RAGシステム導入により、求職者のスキルを的確に評価できるようになり、企業とのマッチング精度が劇的に向上しました。特に、潜在的なスキルや成長可能性まで見える化できるのが素晴らしいです。」
                        <footer className="text-sm text-gray-500 mt-2">- 大手人材紹介会社 営業部長</footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入プロセス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    人材DXソリューション導入の流れ
                  </h2>
                  <p className="text-xl text-gray-600">
                    4ヶ月で求人サイトからAIマッチングまで完全構築
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">要件定義・データ移行（第1ヶ月）</h3>
                      <p className="text-gray-600 mb-3">既存の求人・候補者データベースの分析と新システム要件の詳細設計</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>データ分析:</strong> 既存DBの構造化・クレンジング作業
                          </div>
                          <div>
                            <strong>要件定義:</strong> 業界特化機能・SEO要件の詳細設計
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AIエンジン開発・求人サイト構築（第2-3ヶ月）</h3>
                      <p className="text-gray-600 mb-3">マッチングAI・RAGシステム開発とSEO最適化サイト構築</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>AI開発:</strong> マッチングアルゴリズム・RAGシステム構築
                          </div>
                          <div>
                            <strong>サイト構築:</strong> レスポンシブ対応・SEO完全最適化
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">運用開始・最適化（第4ヶ月）</h3>
                      <p className="text-gray-600 mb-3">本格運用開始とユーザー行動データによるAI学習・改善</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>運用開始:</strong> スタッフ研修・段階的リリース対応
                          </div>
                          <div>
                            <strong>継続改善:</strong> A/Bテスト・AI学習データ活用最適化
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・ROI */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    人材DX導入による経営効果実績
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際の導入企業での業績向上データ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-pink-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">+340%</div>
                    <div className="text-gray-700">マッチング成約率</div>
                    <div className="text-sm text-gray-500 mt-1">15% → 51%</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">-78%</div>
                    <div className="text-gray-700">求人広告費削減</div>
                    <div className="text-sm text-gray-500 mt-1">オーガニック流入で</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">+250%</div>
                    <div className="text-gray-700">営業効率向上</div>
                    <div className="text-sm text-gray-500 mt-1">自動化により</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">8ヶ月</div>
                    <div className="text-gray-700">投資回収期間</div>
                    <div className="text-sm text-gray-500 mt-1">ROI 280%達成</div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-pink-600 to-rose-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">人材DXソリューションの導入相談</h3>
                  <p className="text-lg mb-6 opacity-90">
                    貴社の人材事業に最適なAI・DXソリューションをご提案いたします。まずは無料診断から始めませんか？
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-pink-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料DX診断を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      人材DX事例資料をダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 医療・ヘルスケア専門セクション - medical-careの場合のみ表示 */}
      {(slug === 'healthcare' || slug === 'medical-care') && (
        <>
          {/* 医療業界のデジタル化とオンライン診療 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    医療DXとオンライン診療の普及
                  </h2>
                  <p className="text-xl text-gray-600">
                    誰もが利用しやすい医療サービスへの変革
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">患者様が感じる課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">長い待ち時間（平均1-2時間）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">病院への移動が困難</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">受付・会計の手続きが面倒</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">感染リスクへの不安</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">診療時間外の不安</span>
                      </li>
                    </ul>
                  </div>

                  {/* デジタル化の解決策 */}
                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-green-800 mb-6">デジタル化による改善</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">オンライン診療（自宅から受診）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">スマホで予約・問診</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">オンライン決済・処方箋</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">非接触での安全な診療</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">24時間健康相談チャット</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* オンライン診療の普及状況 */}
                <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">オンライン診療の現状と今後</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">650%</div>
                      <p className="text-sm">コロナ後のオンライン診療増加率</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">85%</div>
                      <p className="text-sm">のクリニックがDX導入を検討中</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">2025年</div>
                      <p className="text-sm">オンライン診療の本格普及予想</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* オンラインクリニック構築ソリューション */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    オンラインクリニック構築パッケージ
                  </h2>
                  <p className="text-xl text-gray-600">
                    すぐに始められる、患者満足度の高いオンライン診療システム
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 予約・診療システム */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">スマート予約・診療</h3>
                    <p className="text-gray-600 mb-4">患者様のスマホから簡単予約、ビデオ通話で診療、薬の配送まで一貫対応</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• スマホ・PCで簡単予約</li>
                      <li>• 事前問診で診療時間短縮</li>
                      <li>• 高品質ビデオ通話システム</li>
                      <li>• 処方箋の自動配送手配</li>
                    </ul>
                  </div>

                  {/* AI健康相談 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">24時間AI健康相談</h3>
                    <p className="text-gray-600 mb-4">夜間・休日の不安もAIチャットボットが初期対応、必要に応じて医師に繋ぎます</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 症状に応じた適切なアドバイス</li>
                      <li>• 緊急度判定・病院案内</li>
                      <li>• 薬の飲み合わせチェック</li>
                      <li>• 健康管理のアドバイス</li>
                    </ul>
                  </div>

                  {/* 患者管理システム */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">スマート患者管理</h3>
                    <p className="text-gray-600 mb-4">電子カルテとの連携で、過去の診療記録から最適な治療方針をサポート</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 電子カルテ自動作成</li>
                      <li>• 既往歴・アレルギー管理</li>
                      <li>• 薬歴・検査結果の一元管理</li>
                      <li>• 次回受診リマインド</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入が簡単な理由 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    なぜ簡単に導入できるのか
                  </h2>
                  <p className="text-xl text-gray-600">
                    IT知識がなくても、スムーズにオンライン診療を開始
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">従来システムとの違い</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>クラウド型で設備投資不要</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>月額制で導入コストを大幅削減</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>既存電子カルテとの連携可能</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>スタッフ向け操作研修つき</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-green-800 mb-4">充実のサポート体制</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>導入前の要件整理から開始</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>医療法・厚労省ガイドライン対応</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>24時間技術サポート</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>定期的なシステム更新・改善</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入ステップ */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    オンライン診療導入の流れ
                  </h2>
                  <p className="text-xl text-gray-600">
                    わずか2ヶ月でオンライン診療開始
                  </p>
                </div>

                <div className="space-y-8">
                  {/* ステップ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">ご相談・要件整理（1週間）</h3>
                      <p className="text-gray-600 mb-3">クリニックの規模や診療科目に合わせた最適なプランをご提案</p>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>ヒアリング:</strong> 患者数、診療科目、現在のシステム確認
                          </div>
                          <div>
                            <strong>プラン提案:</strong> 最適な機能・料金プランのご提案
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ステップ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">システム構築・設定（3-4週間）</h3>
                      <p className="text-gray-600 mb-3">クリニック専用のオンライン診療環境を構築・設定</p>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>環境構築:</strong> クラウド環境・ビデオ通話システム設定
                          </div>
                          <div>
                            <strong>連携設定:</strong> 既存電子カルテ・レセコンとの連携
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ステップ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">研修・運用開始（1週間）</h3>
                      <p className="text-gray-600 mb-3">スタッフ向け操作研修とテスト運用を経て本格稼働</p>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>スタッフ研修:</strong> 予約管理・診療システムの操作方法
                          </div>
                          <div>
                            <strong>テスト運用:</strong> 一部患者様での試験運用とシステム調整
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・患者満足度 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    導入クリニックの患者満足度
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際にご利用いただいている患者様の声
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                    <div className="text-gray-700">患者満足度</div>
                    <div className="text-sm text-gray-500 mt-1">「便利で満足」</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">-75%</div>
                    <div className="text-gray-700">待ち時間短縮</div>
                    <div className="text-sm text-gray-500 mt-1">平均5分で診療開始</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">+340%</div>
                    <div className="text-gray-700">利用患者数増加</div>
                    <div className="text-sm text-gray-500 mt-1">働く世代の利用急増</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">6ヶ月</div>
                    <div className="text-gray-700">導入効果実感期間</div>
                    <div className="text-sm text-gray-500 mt-1">収益向上を実感</div>
                  </div>
                </div>

                {/* 患者様の声 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-lg font-medium text-gray-900 mb-3">30代 会社員女性</div>
                    <p className="text-gray-600 text-sm">
                      「子育てしながら病院に行くのが大変でしたが、オンライン診療なら子どもを預けなくても受診できて本当に助かります。」
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-lg font-medium text-gray-900 mb-3">60代 男性</div>
                    <p className="text-gray-600 text-sm">
                      「通院が困難でしたが、自宅からスマホで先生と話せるのは画期的。薬も配送してもらえて、とても便利です。」
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-lg font-medium text-gray-900 mb-3">40代 男性会社員</div>
                    <p className="text-gray-600 text-sm">
                      「仕事の合間に受診できるのが嬉しい。待ち時間もなく、感染リスクもないので安心して継続通院できています。」
                    </p>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">オンライン診療導入の無料相談</h3>
                  <p className="text-lg mb-6 opacity-90">
                    クリニックの規模や診療科目に合わせた最適なプランをご提案いたします
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料相談を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      導入事例資料をダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 金融業専門セクション - financeの場合のみ表示 */}
      {slug === 'finance' && (
        <>
          {/* 金融業界のDXとAI活用 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    金融業界のAI革命とデジタル変革
                  </h2>
                  <p className="text-xl text-gray-600">
                    金融サービスの根本的な変革が求められる時代です
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">従来の課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">紙ベースの業務プロセス</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">手作業による審査・承認業務</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">顧客データの分散管理</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">リスク管理の属人化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">コンプライアンス対応の負荷</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-blue-800 mb-6">AI時代の解決策</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI与信審査システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">自動化された書類処理（AI-OCR）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">統合顧客データベース</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AIリスクモニタリング</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">自動コンプライアンスチェック</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* AI導入の重要性 */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">なぜ金融業界でAI導入が急務なのか</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">70%</div>
                      <p className="text-sm">の金融機関がAI活用を最重要課題に位置づけ</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">-60%</div>
                      <p className="text-sm">AI導入による審査時間の短縮効果</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">2025年</div>
                      <p className="text-sm">デジタル金融規制強化の本格化</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 金融AI特化ソリューション */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    金融業界向け AIソリューション
                  </h2>
                  <p className="text-xl text-gray-600">
                    業務効率化とリスク管理を同時に実現する包括的AI活用
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AI与信審査 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI与信審査システム</h3>
                    <p className="text-gray-600 mb-4">機械学習による高精度な信用リスク評価と審査時間の大幅短縮を実現</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 多次元データ分析による精度向上</li>
                      <li>• 審査時間を従来の1/10に短縮</li>
                      <li>• 不良債権率の30%削減効果</li>
                    </ul>
                  </div>

                  {/* フロード検知 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIフロード検知</h3>
                    <p className="text-gray-600 mb-4">リアルタイムの不正取引検知により、金融犯罪を未然に防止</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 行動パターン異常検知</li>
                      <li>• 24時間365日のリアルタイム監視</li>
                      <li>• 不正検知精度95%以上</li>
                    </ul>
                  </div>

                  {/* 自動化処理 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">業務自動化AI</h3>
                    <p className="text-gray-600 mb-4">RPA×AIによる書類処理、データ入力、レポート作成の完全自動化</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 書類処理時間90%削減</li>
                      <li>• エラー率を1%以下に抑制</li>
                      <li>• 人件費40%削減効果</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 規制対応・コンプライアンス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    金融規制対応とAIガバナンス
                  </h2>
                  <p className="text-xl text-gray-600">
                    厳格な規制環境下でのAI導入を安全に実現
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-amber-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-amber-800 mb-4">規制要件への対応</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>金融庁ガイドラインに準拠したAI設計</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>バーゼル規制対応のリスク管理</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>個人情報保護法完全準拠</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>監査対応可能な説明可能AI</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-green-800 mb-4">AIガバナンス体制</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>AI倫理委員会の設置支援</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>モデル検証・モニタリング体制</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>継続的リスク評価システム</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>職員向けAI教育プログラム</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 実装プロセス */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    金融AI導入プロセス
                  </h2>
                  <p className="text-xl text-gray-600">
                    規制対応を重視した6ヶ月導入プログラム
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">規制調査・リスク評価（第1-2ヶ月）</h3>
                      <p className="text-gray-600 mb-3">適用される規制要件の詳細調査とAI導入に伴うリスクの包括的評価</p>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>規制マッピング:</strong> 金融庁、日銀等の最新ガイドライン調査
                          </div>
                          <div>
                            <strong>リスク評価:</strong> オペレーショナル・コンプライアンスリスク分析
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AI基盤設計・構築（第3-4ヶ月）</h3>
                      <p className="text-gray-600 mb-3">規制要件を満たすAIシステムの設計・開発と厳格なテスト実施</p>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>システム設計:</strong> 説明可能AI・監査対応機能の実装
                          </div>
                          <div>
                            <strong>セキュリティ:</strong> 多層防御と暗号化の実装
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">本格運用・継続監視（第5-6ヶ月）</h3>
                      <p className="text-gray-600 mb-3">段階的な本格運用開始と継続的なモニタリング体制の確立</p>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>段階運用:</strong> パイロット→限定→全面運用への段階展開
                          </div>
                          <div>
                            <strong>継続監視:</strong> パフォーマンス・リスク指標の24時間監視
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 導入効果・ROI */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    金融AI導入による実績効果
                  </h2>
                  <p className="text-xl text-gray-600">
                    実際の金融機関での導入効果をご紹介
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">-60%</div>
                    <div className="text-gray-700">審査時間短縮</div>
                    <div className="text-sm text-gray-500 mt-1">平均3日→1.2日</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">-40%</div>
                    <div className="text-gray-700">運用コスト削減</div>
                    <div className="text-sm text-gray-500 mt-1">年間2.4億円削減</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">+180%</div>
                    <div className="text-gray-700">顧客満足度向上</div>
                    <div className="text-sm text-gray-500 mt-1">迅速対応による</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">12ヶ月</div>
                    <div className="text-gray-700">投資回収期間</div>
                    <div className="text-sm text-gray-500 mt-1">ROI 180%達成</div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">金融業界AI導入の無料診断</h3>
                  <p className="text-lg mb-6 opacity-90">
                    貴社の業務にAIを導入した場合の効果と課題を詳細に分析いたします
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      無料診断を申し込む
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                      導入事例資料をダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 製造業専門セクション - manufacturingの場合のみ表示 */}
      {slug === 'manufacturing' && (
        <>
          {/* 製造業界の課題とAI検索エンジンの影響 */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    製造業界のDX化とAI検索エンジンの変革
                  </h2>
                  <p className="text-xl text-gray-600">
                    従来の販売方法が根本的に変わる時代が到来しています
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* 従来の課題 */}
                  <div className="bg-red-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">従来の課題</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">検索エンジンで製品が見つからない</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">カタログ情報がデジタル化されていない</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">営業担当者への依存度が高い</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">リードタイムが長く競争力が低下</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI時代の解決策 */}
                  <div className="bg-blue-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-blue-800 mb-6">AI時代の解決策</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AI検索エンジン最適化（AEO）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">構造化データによる製品情報の明確化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">AIチャットボットによる24時間対応</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">予測分析による在庫最適化</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* AI検索エンジンの重要性 */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">なぜAI検索エンジン対応が緊急課題なのか</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">85%</div>
                      <p className="text-sm">のB2Bバイヤーが検索から購買検討を開始</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">2024年</div>
                      <p className="text-sm">ChatGPT検索、Perplexity等のAI検索が主流化</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">3倍</div>
                      <p className="text-sm">AI最適化企業の問い合わせ増加率</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* アパレル・EC特化セクション */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    アパレル事業者向け AI×EC戦略
                  </h2>
                  <p className="text-xl text-gray-600">
                    ファッション業界の販売プロセスを根本から変革する
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* AI検索最適化 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI検索モード対応</h3>
                    <p className="text-gray-600 mb-4">ChatGPT、Perplexity、Geminiなどの AI検索エンジンで商品が適切に表示されるよう最適化</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 商品説明のAI可読性向上</li>
                      <li>• 素材・サイズ情報の構造化</li>
                      <li>• トレンドキーワード分析</li>
                    </ul>
                  </div>

                  {/* パーソナライゼーション */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AIパーソナライゼーション</h3>
                    <p className="text-gray-600 mb-4">顧客の購買履歴・閲覧パターンを分析し、一人ひとりに最適な商品をレコメンド</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 体型・好みに合わせた提案</li>
                      <li>• 季節・トレンド予測</li>
                      <li>• リピート購入促進</li>
                    </ul>
                  </div>

                  {/* 在庫最適化 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI在庫予測</h3>
                    <p className="text-gray-600 mb-4">需要予測AIにより、売れ筋商品の在庫切れ防止と不良在庫の削減を実現</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 季節変動の考慮</li>
                      <li>• トレンド終了時期の予測</li>
                      <li>• 最適発注量の算出</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 実装プロセス */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    製造業DX実装プロセス
                  </h2>
                  <p className="text-xl text-gray-600">
                    3ヶ月で実現する段階的デジタル変革
                  </p>
                </div>

                <div className="space-y-8">
                  {/* フェーズ1 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">現状分析・課題整理（第1ヶ月）</h3>
                      <p className="text-gray-600 mb-3">既存システム・業務プロセスの詳細分析とAI導入ポイントの特定</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>システム監査:</strong> 基幹システム、ECサイト、在庫管理の現状把握
                          </div>
                          <div>
                            <strong>競合分析:</strong> AI活用先進企業のベンチマーク調査
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AI基盤構築（第2ヶ月）</h3>
                      <p className="text-gray-600 mb-3">AI検索エンジン対応とデータ構造の最適化を実施</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>AEO対応:</strong> 製品情報のAI検索エンジン最適化
                          </div>
                          <div>
                            <strong>データ統合:</strong> 分散データの一元管理基盤構築
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3 */}
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">運用開始・効果測定（第3ヶ月）</h3>
                      <p className="text-gray-600 mb-3">実際の運用開始と継続的な改善サイクルの確立</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>KPI設定:</strong> 問い合わせ数、受注率、在庫回転率の測定
                          </div>
                          <div>
                            <strong>継続改善:</strong> 月次レビューと機能拡張の計画策定
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROI・効果測定 */}
          <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto text-white">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">導入効果・ROI実績</h2>
                  <p className="text-xl opacity-90">製造業クライアント様の実際の改善数値</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">+180%</div>
                    <div className="text-lg font-semibold mb-1">問い合わせ数増加</div>
                    <div className="text-sm opacity-75">AI検索対応後3ヶ月</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">-35%</div>
                    <div className="text-lg font-semibold mb-1">在庫コスト削減</div>
                    <div className="text-sm opacity-75">AI予測分析導入後</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                    <div className="text-lg font-semibold mb-1">顧客対応時間</div>
                    <div className="text-sm opacity-75">AIチャットボット導入</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">8ヶ月</div>
                    <div className="text-lg font-semibold mb-1">投資回収期間</div>
                    <div className="text-sm opacity-75">平均的なROI実現時期</div>
                  </div>
                </div>

                <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">成功事例: アパレルメーカーA社</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">課題</h4>
                      <ul className="space-y-2 text-sm opacity-90">
                        <li>• 季節商品の在庫管理に苦慮</li>
                        <li>• EC売上の伸び悩み</li>
                        <li>• 新商品の認知度不足</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3">成果</h4>
                      <ul className="space-y-2 text-sm opacity-90">
                        <li>• EC売上 +220% (6ヶ月後)</li>
                        <li>• 在庫廃棄率 -45%</li>
                        <li>• 新商品認知度 +150%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 記事一覧 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="block sm:inline">
                {category.name}に関する
              </span>
              <span className="block sm:inline sm:ml-2">
                記事カテゴリ
              </span>
            </h2>
            <div className={`w-24 h-1 bg-${config.color}-500 mx-auto rounded-full`}></div>
          </div>
          {posts.length > 0 ? (
            <PostsGrid initialPosts={posts} />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                記事を準備中です
              </h3>
              <p className="text-gray-600 mb-8">
                {category.name}分野の記事を現在作成中です。<br />
                しばらくお待ちください。
              </p>
              <a
                href="/corporate"
                className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-${config.color}-600 hover:bg-${config.color}-700 transition-colors duration-200`}
              >
                法人向けサービスを見る
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA セクション */}
      <section className={`py-16 bg-gradient-to-r ${config.gradient}`}>
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            {slug === 'manufacturing' 
              ? 'AI検索エンジン時代の製造業DX、今すぐ始めませんか？'
              : `${category.name}分野でのAI導入をお考えですか？`
            }
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {slug === 'manufacturing'
              ? 'ChatGPT検索、Perplexityで御社の製品が見つからない状況を放置すると、競合他社に顧客を奪われます。専門コンサルタントが緊急度の高い対策から段階的に実装いたします。'
              : '専門コンサルタントが御社の課題に合わせた最適なソリューションをご提案いたします'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/corporate#contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {slug === 'manufacturing' ? 'AI検索対応の緊急度診断（無料）' : '無料相談を申し込む'}
            </a>
            <a
              href="/corporate/case-studies"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              {slug === 'manufacturing' ? '製造業の導入事例を見る' : '導入事例を見る'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 