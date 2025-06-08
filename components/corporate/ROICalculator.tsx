'use client'

import { useState } from 'react'

export default function ROICalculator() {
  const [employees, setEmployees] = useState(100)
  const [avgSalary, setAvgSalary] = useState(500) // 万円
  const [efficiencyGain, setEfficiencyGain] = useState(30) // %
  const [trainingCost, setTrainingCost] = useState(300) // 万円

  // 計算ロジック
  const yearlyLaborCost = employees * avgSalary // 年間人件費
  const efficiencyValue = (yearlyLaborCost * efficiencyGain) / 100 // 効率化による年間削減額
  const netBenefit = efficiencyValue - trainingCost // 年間純利益
  const roi = ((netBenefit / trainingCost) * 100).toFixed(1) // ROI
  const paybackMonths = trainingCost > 0 ? ((trainingCost / efficiencyValue) * 12).toFixed(1) : '0' // 投資回収期間（月）

  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
      <h3 className="text-2xl font-bold mb-6 text-center">
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          AI導入投資対効果シミュレーター
        </span>
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* 入力フォーム */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-4">企業情報を入力</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              従業員数（人）
            </label>
            <input
              type="number"
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              平均年収（万円）
            </label>
            <input
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              min="200"
              max="2000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              予想効率化率（%）
            </label>
            <input
              type="range"
              value={efficiencyGain}
              onChange={(e) => setEfficiencyGain(Number(e.target.value))}
              className="w-full"
              min="10"
              max="70"
            />
            <div className="text-center text-cyan-400 font-bold text-lg">
              {efficiencyGain}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              研修投資額（万円）
            </label>
            <input
              type="number"
              value={trainingCost}
              onChange={(e) => setTrainingCost(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              min="50"
            />
          </div>
        </div>

        {/* 計算結果 */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-green-400 mb-4">投資対効果</h4>
          
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">年間人件費</span>
              <span className="text-white font-bold">
                {yearlyLaborCost.toLocaleString()}万円
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">年間削減効果</span>
              <span className="text-green-400 font-bold">
                {efficiencyValue.toLocaleString()}万円
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">研修投資額</span>
              <span className="text-red-400 font-bold">
                {trainingCost.toLocaleString()}万円
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">年間純利益</span>
              <span className={`font-bold ${netBenefit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netBenefit > 0 ? '+' : ''}{netBenefit.toLocaleString()}万円
              </span>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {roi}%
                </div>
                <div className="text-sm text-gray-400">投資収益率（ROI）</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {paybackMonths}ヶ月
                </div>
                <div className="text-sm text-gray-400">投資回収期間</div>
              </div>
            </div>
          </div>

          {/* 評価コメント */}
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
            <div className="text-blue-400 font-semibold mb-2">💡 評価</div>
            <p className="text-sm text-gray-300">
              {roi >= '300' ? 
                '非常に優秀な投資対効果です！すぐに導入を検討することをお勧めします。' :
                roi >= '200' ?
                '良好な投資対効果が期待できます。導入を積極的に検討してください。' :
                roi >= '100' ?
                '標準的な投資対効果です。長期的な競争力向上が期待できます。' :
                '投資対効果の改善余地があります。導入方法を最適化しましょう。'
              }
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-gray-300 mb-4">
          より詳細な試算や、御社に最適化されたプランをご希望の場合は
        </p>
        <a
          href="/corporate#contact"
          className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          無料相談で詳細試算を依頼
        </a>
      </div>
    </div>
  )
} 