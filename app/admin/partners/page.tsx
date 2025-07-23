'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Partner {
  id: string
  company_name: string
  representative_name: string
  email: string
  partner_type: 'kol' | 'corporate'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  total_revenue: number
  direct_revenue: number
  referral_revenue: number
  total_referrals: number
  created_at: string
  referral_code: string
}

export default function PartnersListPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'kol' | 'corporate'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('approved')

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners/list')
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
      }
    } catch (error) {
      console.error('パートナー取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPartners = partners.filter(partner => {
    const typeMatch = filter === 'all' || partner.partner_type === filter
    const statusMatch = statusFilter === 'all' || partner.status === statusFilter
    return typeMatch && statusMatch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount) + '円'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">承認済み</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">審査中</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">却下</span>
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">停止中</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'kol' ? '✨' : '🏢'
  }

  const totalStats = {
    totalPartners: filteredPartners.length,
    totalRevenue: filteredPartners.reduce((sum, p) => sum + p.total_revenue, 0),
    avgRevenue: filteredPartners.length > 0 ? filteredPartners.reduce((sum, p) => sum + p.total_revenue, 0) / filteredPartners.length : 0,
    activePartners: filteredPartners.filter(p => p.status === 'approved').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">パートナー情報を読み込み中...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">パートナー一覧</h1>
            <p className="text-gray-600">全パートナーの収益状況と詳細情報</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              href="/admin/partners/sales"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              💰 売上入力
            </Link>
            <Link
              href="/admin/partners/applications"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📋 申請承認
            </Link>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">総パートナー数</div>
            <div className="text-2xl font-bold text-gray-900">{totalStats.totalPartners}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">アクティブ</div>
            <div className="text-2xl font-bold text-green-600">{totalStats.activePartners}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">総報酬支払い</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalStats.totalRevenue)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">平均報酬</div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalStats.avgRevenue)}</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white p-6 rounded-lg shadow border mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">パートナータイプ</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                <option value="kol">KOL（インフルエンサー）</option>
                <option value="corporate">法人</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                <option value="approved">承認済み</option>
                <option value="pending">審査中</option>
              </select>
            </div>
          </div>
        </div>

        {/* パートナーリスト */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    パートナー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    総報酬
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    直接/紹介
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    リファーラル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <motion.tr
                    key={partner.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {partner.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.representative_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {partner.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getTypeIcon(partner.partner_type)}</span>
                        <span className="text-sm text-gray-900">
                          {partner.partner_type === 'kol' ? 'KOL' : '法人'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(partner.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(partner.total_revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">
                        <div>直接: {formatCurrency(partner.direct_revenue)}</div>
                        <div>紹介: {formatCurrency(partner.referral_revenue)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">
                        <div className="font-mono">{partner.referral_code}</div>
                        <div>{partner.total_referrals}件</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(partner.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPartners.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500">該当するパートナーがいません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 