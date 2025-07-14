'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PartnerApplication() {
  const [formData, setFormData] = useState({
    partnerType: '',
    companyName: '',
    representativeName: '',
    email: '',
    phone: '',
    website: '',
    socialMedia: '',
    businessDescription: '',
    experience: '',
    expectedMonthlyDeals: '',
    motivation: '',
    agreedToTerms: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: DB連携実装時に実際のAPI呼び出しを追加
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <section id="application" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto text-center bg-white rounded-3xl p-12 shadow-2xl border border-green-200"
          >
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              申請完了！
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              パートナー申請を受け付けました。
              <br />
              <span className="font-semibold text-green-600">3営業日以内</span>に担当者よりご連絡いたします。
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">次のステップ</h3>
              <ol className="text-left text-gray-600 space-y-2">
                <li>1. 担当者からの審査結果連絡（3営業日以内）</li>
                <li>2. 承認後、パートナー契約・月額設定</li>
                <li>3. 専用ダッシュボードアカウント発行</li>
                <li>4. パートナー研修・営業ツール提供</li>
              </ol>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="application" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              パートナー申請
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            高収益パートナーシップへの第一歩
            <br />
            <span className="font-semibold text-purple-600">今すぐ申請</span>して、AI検索時代の先行者利益を獲得しましょう
          </motion.p>
        </div>

        {/* 申請フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* フォームヘッダー */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <h3 className="text-2xl lg:text-3xl font-bold mb-2">パートナー申請フォーム</h3>
            <p className="text-purple-100">必要事項をご記入ください（審査後、3営業日以内にご連絡いたします）</p>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* パートナータイプ選択 */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4">
                パートナータイプ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  formData.partnerType === 'corporate' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="partnerType"
                    value="corporate"
                    checked={formData.partnerType === 'corporate'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-2">🏢</div>
                    <div className="font-bold text-gray-900">法人パートナー</div>
                    <div className="text-sm text-gray-600 mt-1">自社導入 + 他社紹介</div>
                  </div>
                </label>
                
                <label className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  formData.partnerType === 'influencer' 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}>
                  <input
                    type="radio"
                    name="partnerType"
                    value="influencer"
                    checked={formData.partnerType === 'influencer'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-2">✨</div>
                    <div className="font-bold text-gray-900">インフルエンサーパートナー</div>
                    <div className="text-sm text-gray-600 mt-1">コンテンツ + 法人紹介</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  {formData.partnerType === 'corporate' ? '会社名' : '活動名/会社名'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder={formData.partnerType === 'corporate' ? '株式会社○○' : '@username または 株式会社○○'}
                  required
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  代表者・担当者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="山田太郎"
                  required
                />
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="contact@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="090-1234-5678"
                  required
                />
              </div>
            </div>

            {/* Webサイト・SNS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Webサイト
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  主要SNSアカウント
                </label>
                <input
                  type="text"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="@username または URL"
                />
              </div>
            </div>

            {/* 事業内容 */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                事業内容・活動内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="主な事業内容、対象業界、顧客層などを具体的に記述してください"
                required
              />
            </div>

            {/* 経験・実績 */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                {formData.partnerType === 'corporate' ? '営業・紹介の経験' : 'SNS・マーケティングの経験'} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={formData.partnerType === 'corporate' 
                  ? '法人営業の経験、取引実績、得意分野などを記述してください' 
                  : 'フォロワー数、主要実績、得意コンテンツなどを記述してください'
                }
                required
              />
            </div>

            {/* 月間想定成約数 */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                月間想定成約数 <span className="text-red-500">*</span>
              </label>
              <select
                name="expectedMonthlyDeals"
                value={formData.expectedMonthlyDeals}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              >
                <option value="">選択してください</option>
                <option value="1">月1件（月収150万円目標）</option>
                <option value="2">月2件（月収300万円目標）</option>
                <option value="3">月3件以上（月収450万円以上目標）</option>
              </select>
            </div>

            {/* 志望動機 */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                パートナー志望動機 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="なぜパートナーになりたいか、どのような価値を提供できるかを記述してください"
                required
              />
            </div>

            {/* 利用規約同意 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  required
                />
                <span className="text-gray-700">
                  <span className="font-semibold text-red-500">*</span> 
                  <a href="/terms" className="text-purple-600 hover:underline font-medium">利用規約</a>
                  および
                  <a href="/privacy" className="text-purple-600 hover:underline font-medium">プライバシーポリシー</a>
                  に同意します
                </span>
              </label>
            </div>

            {/* 送信ボタン */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreedToTerms}
                className="group relative px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      申請処理中...
                    </>
                  ) : (
                    <>
                      🚀 パートナー申請を送信
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
} 