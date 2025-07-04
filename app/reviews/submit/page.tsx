import React from 'react';
import { Metadata } from 'next';
import ReviewSubmissionForm from '@/components/reviews/ReviewSubmissionForm';

export const metadata: Metadata = {
  title: 'レビュー投稿 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスのサービスをご利用いただき、ありがとうございます。ご感想・ご評価をお聞かせください。',
  robots: 'noindex, nofollow'
};

// 9つのサービス定義
const SERVICES = [
  { id: 'ai-agents', name: 'AIエージェント開発サービス', category: 'AI開発' },
  { id: 'system-development', name: 'AIシステム開発サービス', category: 'システム開発' },
  { id: 'aio-seo', name: 'AIO対策・レリバンスエンジニアリング', category: 'SEO最適化' },
  { id: 'vector-rag', name: 'ベクトルRAG開発サービス', category: 'AI開発' },
  { id: 'video-generation', name: 'AI動画生成開発サービス', category: 'クリエイティブ' },
  { id: 'hr-solutions', name: 'AI人材ソリューション', category: '人事・労務' },
  { id: 'sns-automation', name: 'SNS自動化システム', category: 'マーケティング' },
  { id: 'chatbot-development', name: 'チャットボット開発サービス', category: 'AI開発' },
  { id: 'mcp-servers', name: 'MCPサーバー開発サービス', category: 'AI開発' }
];

export default function ReviewSubmitPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* パンくずナビ */}
      <nav className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-blue-600 hover:underline">ホーム</a></li>
            <li className="text-gray-500">›</li>
            <li><a href="/reviews" className="text-blue-600 hover:underline">レビュー</a></li>
            <li className="text-gray-500">›</li>
            <li className="text-gray-900">レビュー投稿</li>
          </ol>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            レビュー投稿
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            サービスをご利用いただき、ありがとうございます。<br />
            皆様のご感想・ご評価をお聞かせください。
          </p>
        </div>
      </section>

      {/* レビュー投稿フォーム */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ご利用サービスの評価をお聞かせください
              </h2>
              <p className="text-gray-600">
                お客様からのフィードバックは、サービス向上のために大切に活用させていただきます。
              </p>
            </div>

            <ReviewSubmissionForm services={SERVICES} />
          </div>
        </div>
      </section>

      {/* 注意事項 */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              レビュー投稿に関するご注意
            </h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• 投稿されたレビューは、内容確認後にサイトに掲載されます。</li>
              <li>• 個人情報や機密情報の記載はお控えください。</li>
              <li>• 不適切な内容と判断された場合、掲載をお断りする場合があります。</li>
              <li>• レビューの修正・削除をご希望の場合は、お問い合わせください。</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
} 