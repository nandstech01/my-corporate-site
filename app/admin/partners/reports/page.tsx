'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ReportData {
  overview: {
    totalPartners: number
    activePartners: number
    pendingPartners: number
    totalRevenue: number
    monthlyRevenue: number
    avgRevenuePerPartner: number
  }
  topPerformers: Array<{
    id: string
    company_name: string
    partner_type: string
    total_revenue: number
    monthly_revenue: number
    sales_count: number
  }>
  typeBreakdown: {
    kol: { count: number, revenue: number }
    corporate: { count: number, revenue: number }
  }
  monthlyTrends: Array<{
    month: string
    partners: number
    revenue: number
    sales: number
  }>
  recentActivity: Array<{
    type: 'application' | 'sale' | 'approval'
    description: string
    date: string
    amount?: number
  }>
}

export default function PartnerReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/admin/partners/reports?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.report)
      }
    } catch (error) {
      console.error('レポート取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount) + '円'
  }

  const formatPercent = (value: number) => {
    return (Math.round(value * 100) / 100).toFixed(1) + '%'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">レポートデータを生成中...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">レポートデータの取得に失敗しました</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">パートナーレポート</h1>
            <p className="text-gray-600">収益・実績の詳細分析</p>
          </div>
          
          {/* 期間選択 */}
          <div className="mt-4 sm:mt-0">
            <div className="flex gap-2">
              {[
                { value: '7d', label: '7日間' },
                { value: '30d', label: '30日間' },
                { value: '90d', label: '90日間' },
                { value: '1y', label: '1年間' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow border"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <div className="text-sm text-gray-500">総パートナー数</div>
                <div className="text-2xl font-bold text-gray-900">{reportData.overview.totalPartners}</div>
                <div className="text-sm text-green-600">
                  アクティブ: {reportData.overview.activePartners}名
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow border"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">💰</div>
              <div>
                <div className="text-sm text-gray-500">総報酬支払い</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.overview.totalRevenue)}
                </div>
                <div className="text-sm text-blue-600">
                  月間: {formatCurrency(reportData.overview.monthlyRevenue)}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow border"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📈</div>
              <div>
                <div className="text-sm text-gray-500">平均パートナー収益</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.overview.avgRevenuePerPartner)}
                </div>
                <div className="text-sm text-purple-600">
                  審査中: {reportData.overview.pendingPartners}件
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* パートナータイプ別分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow border"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">パートナータイプ別分析</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✨</span>
                  <div>
                    <div className="font-medium">KOL（インフルエンサー）</div>
                    <div className="text-sm text-gray-600">{reportData.typeBreakdown.kol.count}名</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(reportData.typeBreakdown.kol.revenue)}</div>
                  <div className="text-sm text-gray-600">
                    {reportData.typeBreakdown.kol.count > 0 
                      ? formatCurrency(reportData.typeBreakdown.kol.revenue / reportData.typeBreakdown.kol.count) 
                      : '0円'}/人
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏢</span>
                  <div>
                    <div className="font-medium">法人パートナー</div>
                    <div className="text-sm text-gray-600">{reportData.typeBreakdown.corporate.count}社</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(reportData.typeBreakdown.corporate.revenue)}</div>
                  <div className="text-sm text-gray-600">
                    {reportData.typeBreakdown.corporate.count > 0 
                      ? formatCurrency(reportData.typeBreakdown.corporate.revenue / reportData.typeBreakdown.corporate.count) 
                      : '0円'}/社
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* トップパフォーマー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow border"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 トップパフォーマー</h3>
            
            <div className="space-y-3">
              {reportData.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-lg mr-3">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                    </div>
                    <div>
                      <div className="font-medium">{performer.company_name}</div>
                      <div className="text-sm text-gray-600">
                        {performer.partner_type === 'kol' ? 'KOL' : '法人'} • {performer.sales_count}件成約
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(performer.total_revenue)}</div>
                    <div className="text-sm text-gray-600">月間: {formatCurrency(performer.monthly_revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 月次トレンド */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow border mb-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 月次トレンド</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">月</th>
                  <th className="text-left py-2">新規パートナー</th>
                  <th className="text-left py-2">売上件数</th>
                  <th className="text-left py-2">総報酬</th>
                </tr>
              </thead>
              <tbody>
                {reportData.monthlyTrends.map((trend, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-3 font-medium">{trend.month}</td>
                    <td className="py-3">+{trend.partners}名</td>
                    <td className="py-3">{trend.sales}件</td>
                    <td className="py-3 font-bold">{formatCurrency(trend.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 最近のアクティビティ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 最近のアクティビティ</h3>
          
          <div className="space-y-3">
            {reportData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <div className="text-lg mr-3 mt-1">
                    {activity.type === 'application' ? '📝' : 
                     activity.type === 'sale' ? '💰' : '✅'}
                  </div>
                  <div>
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
                {activity.amount && (
                  <div className="font-bold text-green-600">
                    {formatCurrency(activity.amount)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 