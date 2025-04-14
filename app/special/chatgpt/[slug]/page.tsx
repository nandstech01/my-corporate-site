import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

export default function ChatGPTArticlePage({ params }: PageProps) {
  // ここで記事のコンテンツを取得する処理を実装
  // 現時点では仮の実装
  const articles = {
    'introduction': {
      title: 'ChatGPTとは？',
      content: 'ChatGPTの基本的な説明と使い方について解説します。'
    },
    'business-use': {
      title: 'ビジネスでのChatGPT活用術',
      content: 'ビジネスでのChatGPT活用方法について詳しく解説します。'
    },
    'updates': {
      title: 'ChatGPT最新アップデート情報',
      content: '最新のアップデート情報をお届けします。'
    },
    'education': {
      title: '教育現場でのChatGPT活用',
      content: '教育現場でのChatGPT活用事例を紹介します。'
    }
  }

  const article = articles[params.slug as keyof typeof articles]
  
  if (!article) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <article className="prose prose-lg mx-auto dark:prose-invert">
        <h1>{article.title}</h1>
        <div className="mt-8">
          {article.content}
        </div>
      </article>
    </div>
  )
} 