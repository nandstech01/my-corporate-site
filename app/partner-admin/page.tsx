import { Metadata } from 'next'
import PartnerDashboard from '@/components/partner-admin/PartnerDashboard'

export const metadata: Metadata = {
  title: 'パートナーダッシュボード | NANDS Corporation',
  description: 'パートナー専用ダッシュボード - 収益状況、紹介実績、コース別データの確認',
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

export default function PartnerAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboard />
    </div>
  )
} 