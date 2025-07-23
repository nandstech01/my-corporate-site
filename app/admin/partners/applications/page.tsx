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
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null)

  useEffect(() => {
    console.log('🚀 useEffect実行開始 - 本番環境デバッグ')
    setDebugInfo('🚀 useEffect実行開始 - 本番環境デバッグ')
    
    // 即座にデータ取得開始
    fetchApplications()
    
    // 10秒後に強制リトライ（本番環境での保険）
    const retryTimer = setTimeout(() => {
      console.log('⏰ 10秒後リトライ実行')
      setDebugInfo(prev => prev + '\n⏰ 10秒後リトライ実行')
      fetchApplications()
    }, 10000)
    
    return () => clearTimeout(retryTimer)
  }, [])

  const fetchApplications = async () => {
    try {
      console.log('🔄 申請データ取得開始...')
      setDebugInfo('🔄 申請データ取得開始...')
      
      // 本番環境では絶対URLを使用
      const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
        ? 'https://nands.tech/api/admin/partners/applications'
        : '/api/admin/partners/applications'
      
      console.log('📡 API URL:', apiUrl)
      setDebugInfo(prev => prev + `\n📡 API URL: ${apiUrl}`)
      
      const response = await fetch(apiUrl)
      console.log('📨 レスポンス受信:', response.status, response.statusText)
      setDebugInfo(prev => prev + `\n📨 レスポンス受信: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ 取得したデータ:', data)
        setDebugInfo(prev => prev + `\n✅ 取得したデータ件数: ${data.applications?.length || 0}件`)
        setDebugInfo(prev => prev + `\n📊 統計: ${JSON.stringify(data.stats, null, 2)}`)
        
        if (data.applications && Array.isArray(data.applications)) {
          setApplications(data.applications)
          console.log('✅ 申請データ設定完了:', data.applications.length, '件')
          setDebugInfo(prev => prev + `\n✅ 申請データ設定完了: ${data.applications.length}件`)
        } else {
          console.error('❌ 申請データが配列ではありません:', data.applications)
          setDebugInfo(prev => prev + `\n❌ 申請データが配列ではありません`)
        }
      } else {
        console.error('❌ API呼び出し失敗:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('❌ エラー詳細:', errorData)
        setDebugInfo(prev => prev + `\n❌ API呼び出し失敗: ${response.status} ${errorData}`)
      }
    } catch (error) {
      console.error('🚨 申請取得エラー:', error)
      setDebugInfo(prev => prev + `\n🚨 エラー: ${error}`)
      
      // ネットワークエラーの場合は詳細情報を追加
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 ネットワークエラーまたはCORS問題の可能性')
        setDebugInfo(prev => prev + `\n🌐 ネットワークエラーまたはCORS問題の可能性`)
      }
    } finally {
      console.log('🔄 ローディング状態解除')
      setDebugInfo(prev => prev + '\n🔄 ローディング状態解除')
      setIsLoading(false)
      
      // 最終的な状態をログ出力
      setTimeout(() => {
        console.log('📋 最終状態 - applications.length:', applications.length)
      }, 100)
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
    const matchesFilter = filter === 'all' || app.status === filter
    // 🚨 本番環境専用: フィルター条件詳細ログ
    if (applications.length > 0 && !matchesFilter) {
      console.log('🔍 フィルター除外:', {
        appId: app.id.substring(0, 8),
        appStatus: app.status,
        appStatusType: typeof app.status,
        filterCondition: filter,
        filterType: typeof filter,
        strictEqual: app.status === filter,
        comparison: `"${app.status}" === "${filter}"`
      })
    }
    return matchesFilter
  })

  // 詳細デバッグ情報
  const debugStats = {
    totalApplications: applications.length,
    currentFilter: filter,
    filteredCount: filteredApplications.length,
    statusBreakdown: applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    sampleApplications: applications.slice(0, 3).map(app => ({
      id: app.id.substring(0, 8),
      status: app.status,
      company: app.company_name,
      name: app.representative_name
    }))
  }

  // 🚨 本番環境専用: レンダリング時デバッグ
  useEffect(() => {
    console.log('🔍 レンダリング時デバッグ:', {
      applicationsLength: applications.length,
      filteredLength: filteredApplications.length,
      filter: filter,
      firstApp: applications[0],
      firstFiltered: filteredApplications[0]
    })
  }, [applications, filteredApplications, filter])

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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">🔍 デバッグ情報</h1>
              <button
                onClick={() => {
                  console.log('🔄 手動リロード実行（ローディング中）')
                  setDebugInfo(prev => prev + '\n🔄 手動リロード実行（ローディング中）')
                  fetchApplications()
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📡 強制再取得
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          </div>
          <div className="min-h-64 bg-white rounded-lg shadow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">申請データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔍 デバッグ情報</h1>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
          
          {/* 詳細デバッグ統計 */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-blue-800 mb-2">📊 詳細統計</h3>
            <pre className="text-sm text-blue-700 whitespace-pre-wrap">
              {JSON.stringify(debugStats, null, 2)}
            </pre>
          </div>
          
          <div className="text-sm text-gray-600">
            読み込み済み申請件数: {applications.length}件 | フィルター後: {filteredApplications.length}件
          </div>
        </div>

        {/* 既存のパートナー申請一覧表示 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                パートナー申請管理
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                    {pendingCount}件 承認待ち
                  </span>
                )}
              </h1>
              <button
                onClick={fetchApplications}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '読み込み中...' : '更新'}
              </button>
            </div>

            {/* フィルター */}
            <div className="mt-4 flex space-x-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'すべて' : 
                   status === 'pending' ? '審査中' :
                   status === 'approved' ? '承認済み' : '却下'}
                  {status !== 'all' && (
                    <span className="ml-1">
                      ({applications.filter(app => app.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 申請一覧 */}
          <div className="overflow-x-auto">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  {filter === 'all' ? '申請がありません' : `${filter}の申請がありません`}
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-left mb-4">
                  <h4 className="font-bold text-yellow-800 mb-2">🔍 フィルター詳細</h4>
                  <p className="text-sm text-yellow-700">
                    現在のフィルター: <strong>{filter}</strong><br/>
                    総申請数: <strong>{applications.length}件</strong><br/>
                    フィルター後: <strong>{filteredApplications.length}件</strong><br/>
                    ステータス内訳: {JSON.stringify(debugStats.statusBreakdown)}
                  </p>
                </div>
                
                {/* 🚨 本番環境専用: 強制表示テスト */}
                <div className="bg-red-50 p-4 rounded-lg text-left">
                  <h4 className="font-bold text-red-800 mb-2">🚨 強制表示テスト</h4>
                  <button 
                    onClick={() => {
                      console.log('🔍 強制表示テスト:', {
                        applications: applications.slice(0, 2),
                        filteredApplications: filteredApplications.slice(0, 2)
                      })
                      alert(`データ確認:\n総件数: ${applications.length}\nフィルター後: ${filteredApplications.length}\nコンソールを確認してください`)
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    データ構造確認
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      申請者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      想定成約数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      申請日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 🚨 本番環境専用: 強制表示行 */}
                  {applications.length > 0 && (
                    <tr className="bg-red-50">
                      <td colSpan={6} className="px-6 py-2 text-center text-sm text-red-700">
                        🚨 強制表示テスト: 総データ{applications.length}件 | フィルター後{filteredApplications.length}件 | 条件:{filter}
                      </td>
                    </tr>
                  )}
                  
                  {filteredApplications.map((app) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.representative_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.company_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {app.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getTypeIcon(app.partner_type)}</span>
                          <span className="text-sm text-gray-900">
                            {app.partner_type === 'kol' ? 'インフルエンサー' : '法人'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        月{app.expected_monthly_deals}件
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={processingIds.has(app.id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {processingIds.has(app.id) ? '処理中...' : '承認'}
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              disabled={processingIds.has(app.id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {processingIds.has(app.id) ? '処理中...' : '却下'}
                            </button>
                          </>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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