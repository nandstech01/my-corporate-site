import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '2段目パートナーダッシュボード | NANDS Corporation',
  description: '2段目パートナー専用ダッシュボード - 収益状況、紹介実績、昇格申請の管理',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function ReferrerAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 