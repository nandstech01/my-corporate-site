import { FeaturedCard } from '@/components/ui/FeaturedCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChatGPT 特集 | AIが変える私たちの未来',
  description: 'ChatGPTの活用方法、最新情報、事例紹介など、AIがもたらす可能性について詳しく解説します。',
}

const FEATURED_CONTENT = [
  {
    id: 1,
    title: 'ChatGPTとは？',
    description: 'OpenAIが開発した革新的な対話型AI。その特徴と基本的な使い方を解説します。',
    imageUrl: '/images/chatgpt-intro.jpg',
    link: '/special/chatgpt/introduction',
    badge: '入門編'
  },
  {
    id: 2,
    title: 'ビジネスでのChatGPT活用術',
    description: '業務効率化からマーケティングまで、ChatGPTを活用したビジネス展開の可能性を探ります。',
    imageUrl: '/images/chatgpt-business.jpg',
    link: '/special/chatgpt/business-use',
    badge: 'ビジネス'
  },
  {
    id: 3,
    title: 'ChatGPT最新アップデート情報',
    description: 'GPT-4の新機能や、最新のアップデート情報をお届けします。',
    imageUrl: '/images/chatgpt-updates.jpg',
    link: '/special/chatgpt/updates',
    badge: '最新情報'
  }
]

export default function ChatGPTSpecialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            ChatGPT特集
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            AIが切り開く新しい可能性。ChatGPTの活用方法から最新情報まで、
            詳しく解説します。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_CONTENT.map((content) => (
            <FeaturedCard
              key={content.id}
              title={content.title}
              description={content.description}
              imageUrl={content.imageUrl}
              link={content.link}
              badge={content.badge}
            />
          ))}
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
            最新のChatGPT活用事例
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <FeaturedCard
              title="教育現場でのChatGPT活用"
              description="学習支援やカリキュラム作成など、教育現場でのChatGPT活用事例を紹介します。"
              imageUrl="/images/chatgpt-education.jpg"
              link="/special/chatgpt/education"
              badge="教育"
              className="md:col-span-2"
            />
          </div>
        </div>

        <div className="mt-16 rounded-xl bg-blue-600 p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold">ChatGPTの最新情報をお届け</h2>
          <p className="mb-6">
            新機能のリリースや活用事例など、ChatGPTに関する最新情報をメールでお届けします。
          </p>
          <form className="flex gap-4">
            <input
              type="email"
              placeholder="メールアドレスを入力"
              className="flex-1 rounded-lg bg-white px-4 py-2 text-gray-900"
            />
            <button
              type="submit"
              className="rounded-lg bg-yellow-500 px-6 py-2 font-semibold text-gray-900 hover:bg-yellow-400"
            >
              登録する
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 