'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CommissionCalculation {
  totalAmount: number
  partnerRate: number
  partnerCommission: number
  referrerRate: number
  referrerCommission: number
  type: 'direct' | 'indirect'
}

export default function PartnerSalesPage() {
  const [formData, setFormData] = useState({
    clientCompany: '',
    courseType: '',
    participants: 3,
    unitPrice: 300000,
    partnerId: '',
    referrerId: '',
    saleDate: new Date().toISOString().split('T')[0]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [calculatedCommission, setCalculatedCommission] = useState<CommissionCalculation | null>(null)
  const [partners, setPartners] = useState<Array<{id: string, company_name: string, partner_type: string, representative_name: string}>>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)

  const courseOptions = [
    { value: 'ai_development', label: 'AI駆動開発講座', price: 300000 },
    { value: 'aio_re_implementation', label: 'AIO・RE実装講座', price: 300000 },
    { value: 'sns_consulting', label: 'SNSコンサル講座', price: 300000 }
  ]

  // パートナー一覧取得
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/admin/partners/sales')
        if (response.ok) {
          const data = await response.json()
          setPartners(data.partners || [])
        }
      } catch (error) {
        console.error('パートナー取得エラー:', error)
      } finally {
        setIsLoadingPartners(false)
      }
    }
    fetchPartners()
  }, [])

  // 報酬自動計算
  const calculateCommission = (): CommissionCalculation => {
    const totalAmount = formData.participants * formData.unitPrice
    const hasReferrer = formData.referrerId && formData.referrerId !== ''
    
    if (hasReferrer) {
      // 間接紹介：パートナー35% + 紹介者15%
      return {
        totalAmount,
        partnerRate: 35,
        partnerCommission: totalAmount * 0.35,
        referrerRate: 15,
        referrerCommission: totalAmount * 0.15,
        type: 'indirect' as const
      }
    } else {
      // 直接紹介：パートナー50%
      return {
        totalAmount,
        partnerRate: 50,
        partnerCommission: totalAmount * 0.50,
        referrerRate: 0,
        referrerCommission: 0,
        type: 'direct' as const
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: name === 'participants' || name === 'unitPrice' ? parseInt(value) : value
    }
    setFormData(newFormData)
    
    // リアルタイム報酬計算
    if (newFormData.partnerId && newFormData.participants >= 3) {
      const commission = calculateCommission()
      setCalculatedCommission(commission)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const commission = calculateCommission()
      
      const salesData = {
        ...formData,
        totalAmount: commission.totalAmount,
        partnerCommissionRate: commission.partnerRate,
        partnerCommission: commission.partnerCommission,
        referrerCommissionRate: commission.referrerRate,
        referrerCommission: commission.referrerCommission
      }
      
      const response = await fetch('/api/admin/partners/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesData)
      })
      
      if (response.ok) {
        setSubmitted(true)
        // フォームリセット
        setFormData({
          clientCompany: '',
          courseType: '',
          participants: 3,
          unitPrice: 300000,
          partnerId: '',
          referrerId: '',
          saleDate: new Date().toISOString().split('T')[0]
        })
        setCalculatedCommission(null)
      }
    } catch (error) {
      console.error('売上入力エラー:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount) + '円'
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg text-center"
          >
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">売上入力完了</h2>
            <p className="text-gray-600 mb-6">
              パートナーダッシュボードにリアルタイムで反映されました
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              新しい売上を入力
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">売上入力</h1>
          <p className="text-gray-600">
            企業の売上を入力すると、パートナーに自動で報酬が分配されます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインフォーム */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">売上情報</h2>
              
              {/* 企業情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    クライアント企業名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientCompany"
                    value={formData.clientCompany}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="株式会社○○"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    売上日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="saleDate"
                    value={formData.saleDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* コース情報 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コース <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">選択してください</option>
                    {courseOptions.map(course => (
                      <option key={course.value} value={course.value}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    受講者数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    min="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    単価
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>

              {/* パートナー選択 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     担当パートナー <span className="text-red-500">*</span>
                   </label>
                   <select
                     name="partnerId"
                     value={formData.partnerId}
                     onChange={handleInputChange}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     required
                     disabled={isLoadingPartners}
                   >
                     <option value="">
                       {isLoadingPartners ? 'パートナー取得中...' : '選択してください'}
                     </option>
                     {partners.map(partner => (
                       <option key={partner.id} value={partner.id}>
                         {partner.company_name} ({partner.partner_type === 'kol' ? 'KOL' : '法人'})
                       </option>
                     ))}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     紹介元パートナー（任意）
                   </label>
                   <select
                     name="referrerId"
                     value={formData.referrerId}
                     onChange={handleInputChange}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     disabled={isLoadingPartners}
                   >
                     <option value="">直接紹介（なし）</option>
                     {partners.map(partner => (
                       <option key={partner.id} value={partner.id}>
                         {partner.company_name} ({partner.partner_type === 'kol' ? 'KOL' : '法人'})
                       </option>
                     ))}
                   </select>
                 </div>
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.partnerId || !formData.courseType}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? '処理中...' : '売上を入力・報酬分配実行'}
              </button>
            </form>
          </div>

          {/* 報酬計算プレビュー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 報酬計算プレビュー</h3>
              
              {calculatedCommission ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">総売上金額</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(calculatedCommission.totalAmount)}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600">担当パートナー報酬</div>
                    <div className="text-xl font-bold text-blue-700">
                      {formatCurrency(calculatedCommission.partnerCommission)}
                      <span className="text-sm ml-1">({calculatedCommission.partnerRate}%)</span>
                    </div>
                  </div>
                  
                  {calculatedCommission.referrerCommission > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">紹介元報酬</div>
                      <div className="text-xl font-bold text-green-700">
                        {formatCurrency(calculatedCommission.referrerCommission)}
                        <span className="text-sm ml-1">({calculatedCommission.referrerRate}%)</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 text-center">
                    {calculatedCommission.type === 'direct' ? '直接紹介' : '間接紹介'}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p>パートナーと受講者数を<br />選択すると計算されます</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 