'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PartnerApplication {
  id: string
  company_name: string
  representative_name: string
  email: string
  phone: string
  website?: string
  social_media?: string
  partner_type: 'kol' | 'corporate'
  business_description: string
  experience: string
  expected_monthly_deals: number
  motivation: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  referral_code: string
}

export default function PartnerApplicationsPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/partners/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('申請取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    setProcessingIds(prev => new Set(prev).add(applicationId))
    
    try {
      const response = await fetch('/api/admin/partners/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId,
          action: 'approve'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        await fetchApplications() // リフレッシュ
        
        // 成功通知
        alert(`承認完了！\n仮パスワードメールを送信しました：\nEmail: ${result.email}\nPassword: ${result.tempPassword}`)
      } else {
        alert('承認に失敗しました')
      }
    } catch (error) {
      console.error('承認エラー:', error)
      alert('承認中にエラーが発生しました')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(applicationId)
        return newSet
      })
    }
  }

  const handleReject = async (applicationId: string, reason?: string) => {
    setProcessingIds(prev => new Set(prev).add(applicationId))
    
    try {
      const response = await fetch('/api/admin/partners/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId,
          action: 'reject',
          reason: reason || '申請内容が基準を満たしていません'
        })
      })
      
      if (response.ok) {
        await fetchApplications()
        alert('申請を却下しました')
      } else {
        alert('却下処理に失敗しました')
      }
    } catch (error) {
      console.error('却下エラー:', error)
      alert('却下処理中にエラーが発生しました')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(applicationId)
        return newSet
      })
    }
  }

  const filteredApplications = applications.filter(app => {
    return filter === 'all' || app.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">審査中</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">承認済み</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">却下</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'kol' ? '✨' : '🏢'
  }

  const pendingCount = applications.filter(app => app.status === 'pending').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">申請データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            パートナー申請承認
            {pendingCount > 0 && (
              <span className="ml-3 px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                {pendingCount}件 審査待ち
              </span>
            )}
          </h1>
          <p className="text-gray-600">申請の承認・却下と自動アカウント作成</p>
        </div>

        {/* フィルター */}
        <div className="bg-white p-6 rounded-lg shadow border mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              審査中 ({applications.filter(app => app.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              承認済み ({applications.filter(app => app.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              却下 ({applications.filter(app => app.status === 'rejected').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全て ({applications.length})
            </button>
          </div>
        </div>

        {/* 申請リスト */}
        <div className="space-y-6">
          {filteredApplications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow border overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* 基本情報 */}
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{getTypeIcon(app.partner_type)}</span>
                      <h3 className="text-xl font-bold text-gray-900">{app.company_name}</h3>
                      <div className="ml-3">{getStatusBadge(app.status)}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">代表者</div>
                        <div className="font-medium">{app.representative_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">メールアドレス</div>
                        <div className="font-medium">{app.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">電話番号</div>
                        <div className="font-medium">{app.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">パートナータイプ</div>
                        <div className="font-medium">
                          {app.partner_type === 'kol' ? 'KOL（インフルエンサー）' : '法人'}
                        </div>
                      </div>
                    </div>

                    {/* 詳細情報 */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">事業内容</div>
                        <div className="text-sm">{app.business_description}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">経験・実績</div>
                        <div className="text-sm">{app.experience}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">動機</div>
                        <div className="text-sm">{app.motivation}</div>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <div className="text-sm text-gray-500">予想月間成約数</div>
                          <div className="font-medium">{app.expected_monthly_deals}件</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">申請日</div>
                          <div className="font-medium">
                            {new Date(app.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  {app.status === 'pending' && (
                    <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col gap-3 lg:w-48">
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={processingIds.has(app.id)}
                        className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingIds.has(app.id) ? '承認中...' : '✅ 承認・アカウント作成'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('却下理由を入力してください（任意）：')
                          if (reason !== null) {
                            handleReject(app.id, reason)
                          }
                        }}
                        disabled={processingIds.has(app.id)}
                        className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingIds.has(app.id) ? '処理中...' : '❌ 却下'}
                      </button>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="w-full px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
                      >
                        📋 詳細確認
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500">該当する申請がありません</p>
            </div>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">申請詳細</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">企業名・アカウント名</div>
                <div className="font-medium">{selectedApp.company_name}</div>
              </div>
              {selectedApp.website && (
                <div>
                  <div className="text-sm text-gray-500">ウェブサイト</div>
                  <div className="font-medium">{selectedApp.website}</div>
                </div>
              )}
              {selectedApp.social_media && (
                <div>
                  <div className="text-sm text-gray-500">SNS</div>
                  <div className="font-medium">{selectedApp.social_media}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">リファーラルコード</div>
                <div className="font-mono font-medium">{selectedApp.referral_code}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 