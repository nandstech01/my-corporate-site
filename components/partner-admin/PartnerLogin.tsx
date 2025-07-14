'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PartnerLoginProps {
  onLoginSuccess?: () => void
}

export default function PartnerLogin({ onLoginSuccess }: PartnerLoginProps) {
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

    // TODO: 実際の認証ロジック実装
    setTimeout(() => {
      if (loginData.email === 'demo@partner.com' && loginData.password === 'demo123') {
        // ログイン成功
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          // フォールバック: ダッシュボードへリダイレクト
          window.location.href = '/partner-admin/dashboard'
        }
      } else {
        setError('メールアドレスまたはパスワードが間違っています')
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">パートナー専用</h1>
            <p className="text-purple-100">管理画面ログイン</p>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* エラーメッセージ */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="partner@example.com"
                required
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ログイン中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  ログイン
                </span>
              )}
            </button>
          </form>

          {/* デモログイン情報 */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">🔍 デモアカウント</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Email:</span> demo@partner.com</p>
              <p><span className="font-medium">Password:</span> demo123</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※ 本実装時は実際の認証システムに置き換えられます
            </p>
          </div>

          {/* リンク */}
          <div className="mt-8 text-center space-y-3">
            <Link 
              href="/partners"
              className="block text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              パートナープログラムについて
            </Link>
            <Link 
              href="/contact"
              className="block text-gray-600 hover:text-gray-800 transition-colors"
            >
              ログインでお困りの方
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 