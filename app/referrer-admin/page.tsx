'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReferrerLogin from '../../components/partner-admin/ReferrerLogin'

interface ReferrerData {
  id: string
  name: string
  email: string
  tier: number
  total_sales: number
  total_commission: number
  referrer_name: string | null
  status: string
  created_at: string
}

interface SalesRecord {
  id: string
  client_company: string
  course_name: string
  total_amount: number
  referrer_commission: number
  sale_date: string
  status: string
}

export default function ReferrerAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [referrerData, setReferrerData] = useState<ReferrerData | null>(null)
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeForm, setShowUpgradeForm] = useState(false)

  // 認証状態チェック
  useEffect(() => {
    const token = localStorage.getItem('referrer_token')
    const userData = localStorage.getItem('referrer_data')
    
    if (token && userData) {
      setIsAuthenticated(true)
      try {
        const parsedData = JSON.parse(userData)
        setReferrerData(parsedData)
      } catch (error) {
        console.error('ユーザーデータの解析エラー:', error)
        localStorage.removeItem('referrer_token')
        localStorage.removeItem('referrer_data')
      }
    } else {
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }, [])

  // 2段目ユーザーデータ取得
  useEffect(() => {
    fetchReferrerData()
  }, [])

  const fetchReferrerData = async () => {
    try {
      setIsLoading(true)
      
      const token = localStorage.getItem('referrer_token')
      const response = await fetch('/api/referrer/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferrerData(data.referrer)
        setSalesRecords(data.sales)
      } else if (response.status === 401) {
        // 認証エラー
        localStorage.removeItem('referrer_token')
        localStorage.removeItem('referrer_data')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeRequest = async () => {
    try {
      const token = localStorage.getItem('referrer_token')
      const response = await fetch('/api/referrer/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert('1段目パートナーへの昇格申請を送信しました！管理者からの連絡をお待ちください。')
        setShowUpgradeForm(false)
      } else {
        alert('昇格申請の送信に失敗しました。')
      }
    } catch (error) {
      console.error('昇格申請エラー:', error)
      alert('エラーが発生しました。')
    }
  }

  // 未認証の場合はログインページを表示
  if (!isAuthenticated) {
    return <ReferrerLogin onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">紹介者ダッシュボード</h1>
              <p className="text-gray-600">2段目パートナー専用管理画面</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                🥈 2段目パートナー
              </span>
              <button
                onClick={() => setShowUpgradeForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                1段目に昇格申請
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('referrer_token')
                  localStorage.removeItem('referrer_data')
                  setIsAuthenticated(false)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">総報酬額</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{referrerData?.total_commission?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">成約件数</p>
                <p className="text-2xl font-bold text-gray-900">{salesRecords.length}件</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">報酬率</p>
                <p className="text-2xl font-bold text-orange-600">35%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 制限事項の説明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-800 mb-2">2段目パートナーについて</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• 直接営業で35%の報酬を獲得できます</li>
                <li>• さらなる紹介（リファーラルURL発行）はできません</li>
                <li>• 1段目パートナーに昇格すると、50%報酬＋紹介機能が利用可能になります</li>
                <li>• 昇格には月額10万円のパートナー費用が必要です</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 売上履歴 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">売上履歴</h2>
          </div>
          
          <div className="p-6">
            {salesRecords.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">売上データなし</h3>
                <p className="text-gray-600">まだ成約がありません。営業活動を開始しましょう！</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">成約日</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">クライアント</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">コース</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">売上額</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">報酬（35%）</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(record.sale_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">{record.client_company}</td>
                        <td className="py-3 px-4">{record.course_name}</td>
                        <td className="py-3 px-4 text-right">¥{record.total_amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          ¥{record.referrer_commission.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status === 'confirmed' ? '確定' : '処理中'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* 昇格申請モーダル */}
      {showUpgradeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">1段目パートナーに昇格</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">昇格後の特典</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 直接営業で50%報酬</li>
                  <li>• リファーラルURL発行可能</li>
                  <li>• 2段目紹介時に15%継続報酬</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold text-amber-800 mb-2">費用</h4>
                <p className="text-amber-700 text-sm">月額10万円のパートナー費用が必要です</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpgradeRequest}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                昇格申請
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 