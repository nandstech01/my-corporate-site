'use client'

import React from 'react'
import { Gift, Zap, Star, Rocket, Brain, Target, Lightbulb, TrendingUp, Users, Compass } from 'lucide-react'

interface BenefitCardProps {
  number: number
  title: string
  subtitle: string
  icon: React.ReactNode
}

const BenefitCard: React.FC<BenefitCardProps> = ({ number, title, subtitle, icon }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 flex items-center justify-center"> {/* p-4 を p-2 に変更 */}
  {icon}
  <span className="text-white font-bold text-lg ml-2">特典{number}</span>
</div>

      <div className="p-4 bg-gradient-to-b from-blue-100 to-white text-center">
        <p className="text-sm sm:text-base font-bold text-gray-800 mb-2">{title}</p>
        <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}

export default function SeminarBenefits() {
  const benefits = [
    { title: "無料退職相談", subtitle: "経験豊富なキャリアコンサルタン���が丁寧にサポート", icon: <Users size={24} color="white" /> },
    { title: "無料転職相談", subtitle: "AI業界への転職をプロがバックアップ", icon: <Compass size={24} color="white" /> },
    { title: "プロンプトテンプレ50選", subtitle: "即実践できるプロンプト集", icon: <Star size={24} color="white" /> },
    { title: "ChatGTP大全集", subtitle: "ChatGTP基礎知識構築・業務効率化", icon: <Target size={24} color="white" /> },
    { title: "AI面接対策講座", subtitle: "AIを活用した面接突破テクニックを伝授", icon: <Brain size={24} color="white" /> },
    { title: "最新AI技術トレンドレポート", subtitle: "市場価値の高いスキルを先取り", icon: <TrendingUp size={24} color="white" /> },
    { title: "AI業界人脈構築セミナー", subtitle: "キャリアを加速させる人脈作りのコツ", icon: <Users size={24} color="white" /> },
    { title: "AI給与交渉マスター講座", subtitle: "適正評価を勝ち取るテクニックを学ぶ", icon: <Zap size={24} color="white" /> },
    { title: "AI起業家育成プログラム", subtitle: "AI技術を活用した起業ノウハウを公開", icon: <Lightbulb size={24} color="white" /> },
    { title: "AI倫理と社会影響��講座", subtitle: "持続可能なAI活用のための知識を習得", icon: <Rocket size={24} color="white" /> }
  ]

  return (
    <div className="relative py-16 overflow-hidden" style={{ backgroundImage: "url('/path/to/your/background-image.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600 animate-pulse">
  AI革命を味方につけろ！
</h2>
<p className="text-xl sm:text-3xl font-bold mb-8 text-gray-800">
  今すぐLINE無料相談に参加!!
</p>


<div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-1 rounded-lg shadow-2xl">
  <div className="bg-white rounded-lg p-4"> {/* p-6 を p-4 に変更して縦幅を縮小 */}
    <p className="text-4xl sm:text-4xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 leading-tight mb-2">
      豪華10大特典
    </p>
    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 leading-tight">
    全員に無料プレゼント！
    </p>
  </div>
</div>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              number={index + 1}
              title={benefit.title}
              subtitle={benefit.subtitle}
              icon={benefit.icon}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 px-8 rounded-full text-xl sm:text-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse relative overflow-hidden">
            <span className="relative z-10">LINE登録者限定無料プレゼント</span>
            <span className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-12 transition-transform ease-out duration-500 hover:translate-x-full"></span>
          </button>
        </div>
      </div>
    </div>
  )
}
