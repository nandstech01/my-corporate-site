import Script from 'next/script';
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration';
import { supabase } from '@/lib/supabase/supabase';

// ページコンテキスト（レリバンスエンジニアリング準拠）
const pageContext = {
  pageSlug: 'reviews',
  pageTitle: 'お客様レビュー | 株式会社エヌアンドエス',
  keywords: [
    'お客様レビュー', 'クライアント評価', 'システム開発実績', 'AI開発評価',
    'レリバンスエンジニアリング評価', 'Mike King理論実装', '顧客満足度',
    '技術力評価', 'サービス品質', '実績評価'
  ],
  category: 'レビュー・評価',
  businessId: undefined,
  categoryId: undefined
};

// データベースからレビューデータを取得
async function getReviewsFromDatabase() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('レビューデータ取得エラー:', error);
      return [];
    }

    return reviews || [];
  } catch (error) {
    console.error('データベース接続エラー:', error);
    return [];
  }
}

// サービス名のマッピング
const serviceNames: Record<string, string> = {
  'ai-agents': 'AIエージェント開発サービス',
  'system-development': 'AIシステム開発サービス',
  'aio-seo': 'AIO対策・レリバンスエンジニアリング',
  'vector-rag': 'ベクトルRAG開発サービス',
  'video-generation': 'AI動画生成開発サービス',
  'hr-solutions': 'AI人材ソリューション',
  'sns-automation': 'SNS自動化システム',
  'chatbot-development': 'チャットボット開発サービス',
  'mcp-servers': 'MCPサーバー開発サービス'
};

// 統合データ取得（SSR）
async function getUnifiedData() {
  try {
    return await generateUnifiedPageData(pageContext);
  } catch (error) {
    console.error('統合データ取得エラー:', error);
    return null;
  }
}

export default async function ReviewsPage() {
  const unifiedData = await getUnifiedData();
  const reviews = await getReviewsFromDatabase();

  // 統計データの計算
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <>
      {/* 構造化データ: レビューページ */}
      <Script
        id="reviews-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "お客様レビュー",
            "description": "株式会社エヌアンドエスのAI・システム開発サービスに対するお客様評価とレビュー",
            "url": "https://nands.tech/reviews",
            "mainEntity": {
              "@type": "ItemList",
              "name": "お客様レビュー一覧",
              "numberOfItems": reviews.length,
              "itemListElement": reviews.map((review, index) => ({
                "@type": "Review",
                "position": index + 1,
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": review.rating,
                  "bestRating": 5
                },
                "reviewBody": review.review_body,
                "author": {
                  "@type": "Person",
                  "name": review.author_name,
                  "worksFor": {
                    "@type": "Organization",
                    "name": review.author_company || "非公開"
                  },
                  "jobTitle": review.author_position || "非公開"
                },
                "datePublished": new Date(review.created_at).toISOString().split('T')[0],
                "itemReviewed": {
                  "@type": "SoftwareApplication",
                  "name": serviceNames[review.service_id] || review.service_id,
                  "provider": {
                    "@type": "Organization",
                    "@id": "https://nands.tech/#organization",
                    "name": "株式会社エヌアンドエス"
                  }
                }
              }))
            },
            "provider": {
              "@type": "Organization",
              "@id": "https://nands.tech/#organization",
              "name": "株式会社エヌアンドエス"
            }
          }, null, 2)
        }}
      />

      {/* 統一構造化データ（レリバンスエンジニアリング） */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-reviews"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Fragment ID for Entity Map - Hidden from users */}
        <div id="company" style={{ display: 'none' }} aria-hidden="true" />
        
        {/* パンくずナビ */}
        <nav className="bg-white shadow-sm px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li><a href="/" className="text-blue-600 hover:underline">ホーム</a></li>
              <li className="text-gray-500">›</li>
              <li className="text-gray-900">お客様レビュー</li>
            </ol>
          </div>
        </nav>

        {/* ヒーローセクション */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              お客様レビュー
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              株式会社エヌアンドエスのAI・システム開発サービスをご利用いただいたお客様からの貴重なご評価をご紹介いたします。
            </p>
          </div>
        </section>

        {/* レビュー統計 */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">評価統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{averageRating}</div>
                  <div className="text-gray-600">平均評価</div>
                  <div className="flex justify-center mt-2">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{reviews.length}</div>
                  <div className="text-gray-600">総レビュー数</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-gray-600">満足度</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* レビュー一覧 */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">お客様の声</h2>
            {reviews.length > 0 ? (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <article key={review.id} className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          {[1,2,3,4,5].map((star) => (
                            <svg 
                              key={star} 
                              className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <h3 className="font-semibold text-gray-900">{review.author_name}</h3>
                        <p className="text-gray-600 text-sm">
                          {review.author_position && review.author_company 
                            ? `${review.author_position} | ${review.author_company}`
                            : review.author_company || '非公開'
                          }
                        </p>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(review.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-800 leading-relaxed mb-4">{review.review_body}</p>
                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full">
                      {serviceNames[review.service_id] || review.service_id}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">まだレビューが投稿されていません。</p>
                <p className="text-gray-500 text-sm mt-2">最初のレビューを投稿してみませんか？</p>
              </div>
            )}
          </div>
        </section>

        {/* レビュー投稿フォーム */}
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">レビューを投稿する</h2>
            <p className="text-center text-gray-600 mb-8">
              サービスをご利用いただいたお客様のご感想をお聞かせください
            </p>
            <div className="text-center">
              <a 
                href="/reviews/submit" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                レビューを投稿する
              </a>
              <p className="text-sm text-gray-500 mt-4">
                投稿されたレビューは、内容確認後にサイトに掲載いたします。
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 