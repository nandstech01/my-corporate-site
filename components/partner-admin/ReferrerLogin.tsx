'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ReferrerLoginProps {
  onLoginSuccess?: () => void
}

export default function ReferrerLogin({ onLoginSuccess }: ReferrerLoginProps) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/referrer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const result = await response.json()

      if (response.ok) {
        // ログイン成功
        localStorage.setItem('referrer_token', result.token)
        localStorage.setItem('referrer_data', JSON.stringify(result.partner))
        
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      } else {
        setError(result.error || 'ログインに失敗しました')
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      setError('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🥈</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              2段目パートナーログイン
            </h1>
            <p className="text-gray-600">
              承認通知メールに記載された認証情報を入力してください
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* ログインフォーム */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="承認通知で送られたメールアドレス"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                仮パスワード
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="承認通知メールに記載の仮パスワード"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* フッター */}
          <div className="mt-8 text-center">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-orange-800 mb-2">📧 承認通知メールをご確認ください</h3>
              <p className="text-orange-700 text-sm">
                管理者の承認後、メールアドレスと仮パスワードが送信されます
              </p>
            </div>
            
            <div className="text-sm text-gray-500 space-y-2">
              <p>
                <Link href="/partners" className="text-orange-600 hover:text-orange-700 font-medium">
                  ← パートナー申請ページに戻る
                </Link>
              </p>
              <p>
                1段目パートナーの方は
                <Link href="/partner-admin" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                  こちら
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 2段目パートナーの特徴 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 text-center">🥈 2段目パートナーの特典</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <span className="block text-2xl mb-1">35%</span>
              <span className="text-orange-700 font-medium">直接営業報酬</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <span className="block text-2xl mb-1">💼</span>
              <span className="text-blue-700 font-medium">営業支援資料</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            1段目に昇格すると50%報酬＋リファーラルURL発行が可能になります
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 