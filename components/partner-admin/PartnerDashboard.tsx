'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// サンプルデータ（実際は API から取得）
const mockPartnerData = {
  partnerInfo: {
    name: "サンプル株式会社",
    partnerType: "法人パートナー",
    joinDate: "2024-01-15",
    partnerCode: "NANDS-2024-001"
  },
  revenueOverview: {
    thisMonth: {
      confirmed: 1500000, // 150万円
      pending: 900000,    // 90万円
      total: 2400000      // 240万円
    },
    nextMonth: {
      expected: 3000000   // 300万円
    },
    totalEarned: 12000000 // 1,200万円
  },
  referrals: [
    {
      id: 1,
      companyName: "テック企業A",
      referralDate: "2024-01-20",
      courses: [
        { name: "AI駆動開発講座", participants: 5, unitPrice: 300000, totalPrice: 1500000, status: "完了", revenueShare: 750000 },
        { name: "AIO・RE実装講座", participants: 3, unitPrice: 300000, totalPrice: 900000, status: "進行中", revenueShare: 450000 }
      ],
      totalRevenue: 1200000,
      status: "アクティブ"
    },
    {
      id: 2,
      companyName: "マーケティング会社B",
      referralDate: "2024-02-01",
      courses: [
        { name: "SNSコンサル講座", participants: 8, unitPrice: 300000, totalPrice: 2400000, status: "完了", revenueShare: 1200000 }
      ],
      totalRevenue: 1200000,
      status: "完了"
    },
    {
      id: 3,
      companyName: "コンサル会社C",
      referralDate: "2024-02-15",
      courses: [
        { name: "AI駆動開発講座", participants: 4, unitPrice: 300000, totalPrice: 1200000, status: "契約中", revenueShare: 600000 },
        { name: "AIO・RE実装講座", participants: 6, unitPrice: 300000, totalPrice: 1800000, status: "契約中", revenueShare: 900000 }
      ],
      totalRevenue: 1500000,
      status: "契約中"
    }
  ]
}

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { partnerInfo, revenueOverview, referrals } = mockPartnerData

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount) + '円'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '完了': return 'bg-green-100 text-green-800'
      case '進行中': return 'bg-blue-100 text-blue-800'
      case '契約中': return 'bg-yellow-100 text-yellow-800'
      case 'アクティブ': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                パートナーダッシュボード
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {partnerInfo.name} ({partnerInfo.partnerType})
              </p>
            </div>
            <div className="flex-shrink-0 sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">パートナーコード</p>
              <p className="font-mono text-sm sm:text-base font-medium text-gray-900 break-all sm:break-normal">
                {partnerInfo.partnerCode}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <nav className="-mb-px">
            {/* スマホ版：縦2行のグリッド */}
            <div className="grid grid-cols-2 gap-x-1 sm:hidden">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-2 border-b-2 font-medium text-xs text-center transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                収益サマリー
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-3 px-2 border-b-2 font-medium text-xs text-center transition-colors duration-200 ${
                  activeTab === 'referrals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                紹介実績詳細
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-3 px-2 border-b-2 font-medium text-xs text-center transition-colors duration-200 ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                コース別分析
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-3 px-2 border-b-2 font-medium text-xs text-center transition-colors duration-200 ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                営業資料・ガイド
              </button>
            </div>
            
            {/* PC版：横並び */}
            <div className="hidden sm:flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                収益サマリー
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'referrals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                紹介実績詳細
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                コース別分析
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                営業資料・ガイド
              </button>
            </div>
          </nav>
        </div>

        {/* 収益サマリータブ */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 収益概要カード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">今月確定収益</h3>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{formatCurrency(revenueOverview.thisMonth.confirmed)}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">今月予定収益</h3>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{formatCurrency(revenueOverview.thisMonth.pending)}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">来月期待収益</h3>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{formatCurrency(revenueOverview.nextMonth.expected)}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">累計収益</h3>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatCurrency(revenueOverview.totalEarned)}</p>
              </div>
            </div>

            {/* 最近の活動 */}
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">最近の活動</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {referrals.slice(0, 3).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{referral.companyName}</p>
                        <p className="text-sm text-gray-500">
                          {referral.courses.length}コース | {referral.courses.reduce((sum, course) => sum + course.participants, 0)}名
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{formatCurrency(referral.totalRevenue)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 紹介実績詳細タブ */}
        {activeTab === 'referrals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow border">
              <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">紹介企業一覧</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">企業名</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">紹介日</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受講コース</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受講者数</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">パートナー収益</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ステータス</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map((referral) =>
                      referral.courses.map((course, courseIndex) => (
                        <tr key={`${referral.id}-${courseIndex}`}>
                          {courseIndex === 0 && (
                            <>
                              <td rowSpan={referral.courses.length} className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 border-r">
                                <div className="sm:hidden text-gray-500 text-xs mb-1">{referral.referralDate}</div>
                                {referral.companyName}
                              </td>
                              <td rowSpan={referral.courses.length} className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r hidden sm:table-cell">
                                {referral.referralDate}
                              </td>
                            </>
                          )}
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{course.name}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{course.participants}名</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-green-600">{formatCurrency(course.revenueShare)}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                              {course.status}
                            </span>
                          </td>
                          {/* スマホ版のステータス表示 */}
                          <td className="px-3 py-4 whitespace-nowrap sm:hidden">
                            <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${getStatusColor(course.status)}`}>
                              {course.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* コース別分析タブ */}
        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {['AI駆動開発講座', 'AIO・RE実装講座', 'SNSコンサル講座'].map((courseName, index) => {
                const courseData = referrals.flatMap(r => r.courses).filter(c => c.name === courseName)
                const totalParticipants = courseData.reduce((sum, c) => sum + c.participants, 0)
                const totalRevenue = courseData.reduce((sum, c) => sum + c.revenueShare, 0)
                const avgParticipants = courseData.length > 0 ? Math.round(totalParticipants / courseData.length) : 0

                return (
                  <div key={courseName} className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">{courseName}</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">総受講者数</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalParticipants}名</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">総収益</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">1案件あたり平均受講者数</p>
                        <p className="text-lg font-medium text-gray-900">{avgParticipants}名</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">成約案件数</p>
                        <p className="text-lg font-medium text-gray-900">{courseData.length}件</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 詳細な収益計算例 */}
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">パートナー報酬体系詳細</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">AI駆動開発講座</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>基本単価:</span>
                          <span className="font-medium">30万円/人</span>
                        </div>
                        <div className="flex justify-between">
                          <span>最低受講者数:</span>
                          <span className="font-medium">3人以上</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>5人受講の場合:</span>
                          <span className="font-bold text-green-600">150万円 → 75万円収益</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">AIO・RE実装講座</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>基本単価:</span>
                          <span className="font-medium">30万円/人</span>
                        </div>
                        <div className="flex justify-between">
                          <span>最低受講者数:</span>
                          <span className="font-medium">3人以上</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>6人受講の場合:</span>
                          <span className="font-bold text-green-600">180万円 → 90万円収益</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">SNSコンサル講座</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>基本単価:</span>
                          <span className="font-medium">30万円/人</span>
                        </div>
                        <div className="flex justify-between">
                          <span>最低受講者数:</span>
                          <span className="font-medium">3人以上</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>8人受講の場合:</span>
                          <span className="font-bold text-green-600">240万円 → 120万円収益</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">重要事項</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• パートナー報酬は成約金額の50%（1人30万円 × 人数 ÷ 2）</li>
                    <li>• 各コース最低3人以上から受講可能</li>
                    <li>• 月額パートナー費用10万円は別途</li>
                    <li>• 助成金活用により企業の実質負担は20%程度</li>
                    <li>• 報酬支払いは成約確定後翌月末</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 営業資料・ガイドタブ */}
        {activeTab === 'materials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* 営業資料セクション */}
              <div className="bg-white rounded-lg shadow border">
                <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">営業資料ダウンロード</h3>
                </div>
                <div className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">パートナー営業資料（総合版）</h4>
                        <p className="text-xs sm:text-sm text-gray-500">全コースの詳細・助成金情報・実績データ</p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto">
                        ダウンロード
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">AI駆動開発講座 専用資料</h4>
                        <p className="text-xs sm:text-sm text-gray-500">技術詳細・実装事例・ROI計算シート</p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto">
                        ダウンロード
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">AIO・RE実装講座 専用資料</h4>
                        <p className="text-xs sm:text-sm text-gray-500">630%改善実績・技術仕様・導入事例</p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto">
                        ダウンロード
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">SNSコンサル講座 専用資料</h4>
                        <p className="text-xs sm:text-sm text-gray-500">keita実績・フォロワー獲得手法・企業事例</p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto">
                        ダウンロード
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">助成金申請完全ガイド</h4>
                        <p className="text-xs sm:text-sm text-gray-500">申請手順・必要書類・承認率向上のコツ</p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto">
                        ダウンロード
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* パートナーガイドセクション */}
              <div className="bg-white rounded-lg shadow border">
                <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">パートナーガイド</h3>
                </div>
                <div className="p-3 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">営業プロセス</h4>
                      <ol className="text-xs sm:text-sm text-gray-600 space-y-2">
                        <li className="flex"><span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-semibold mr-2 sm:mr-3 flex-shrink-0">1</span>ターゲット企業の特定・アプローチ</li>
                        <li className="flex"><span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-semibold mr-2 sm:mr-3 flex-shrink-0">2</span>初回面談・ニーズヒアリング</li>
                        <li className="flex"><span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-semibold mr-2 sm:mr-3 flex-shrink-0">3</span>カスタマイズ提案・助成金説明</li>
                        <li className="flex"><span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-semibold mr-2 sm:mr-3 flex-shrink-0">4</span>契約締結・NANDS引き継ぎ</li>
                        <li className="flex"><span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-semibold mr-2 sm:mr-3 flex-shrink-0">5</span>コース実施・パートナー報酬確定</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">成功のポイント</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>AI検索時代への危機感を共有</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>630%改善の具体的実績を強調</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>助成金による実質負担軽減をアピール</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>3人以上での団体受講のメリット説明</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>keitaの実績とNANDSの技術力の組み合わせ</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">サポート連絡先</h4>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
                        <p className="mb-1"><strong>営業サポート:</strong> sales-support@nands.tech</p>
                        <p className="mb-1"><strong>技術質問:</strong> tech-support@nands.tech</p>
                        <p className="mb-1"><strong>パートナー専用ホットライン:</strong> 03-XXXX-XXXX</p>
                        <p><strong>月次研修会:</strong> 毎月第3金曜日 14:00-16:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 