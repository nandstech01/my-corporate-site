import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * サイト内検索の結果ページ (/search?keyword=…) は検索エンジンに載せない (中身の薄いページの量産を防ぐ)。
 * リンクはたどってよい (結果から記事へ)。page.tsx はクライアント部品で metadata を出せないため layout に置く。
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children
}
