import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ベクトルRAG検索システム開発 | 企業内ナレッジAI化 | N&S',
  description: 'OpenAI Embeddings活用のベクトルRAG検索システム開発。企業内文書の意味的検索で業務効率化を実現。検索精度95%向上、導入実績50+社。',
  keywords: 'ベクトル検索,RAG,企業内検索,AI文書検索,OpenAI Embeddings,Pinecone,意味的検索,ナレッジベース',
  openGraph: {
    title: 'ベクトルRAG検索システム開発 | 企業内ナレッジAI化 | N&S',
    description: 'OpenAI Embeddings活用のベクトルRAG検索システム開発。企業内文書の意味的検索で業務効率化を実現。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ベクトルRAG検索システム開発 | N&S',
    description: 'OpenAI Embeddings活用のベクトルRAG検索システム開発。企業内文書の意味的検索で業務効率化を実現。',
  },
  alternates: {
    canonical: 'https://nands.tech/vector-rag',
  }
}

export default function VectorRagLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
} 