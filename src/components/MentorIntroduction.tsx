import Card from '@/components/common/Card';
import CardContent from '@/components/common/CardContent';
import React from 'react';


function MentorIntroduction() {

  return (

    <section className="bg-gray-100 py-16 px-4">

      <div className="max-w-4xl mx-auto">

        <h2 className="text-4xl font-bold text-center mb-12">メンターの紹介</h2>

        <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">

          <CardContent className="p-6">

            <div className="flex flex-col items-center mb-6">

              <img

                src="/placeholder.svg?height=200&width=200"

                alt="植村健一"

                width={200}

                height={200}

                className="w-40 h-40 rounded-full mb-4"

              />

<div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2 text-center">
  <span className="block">担当：基礎コース</span>
  <span className="block">AIリテラシー研修</span>
</div>

              <h3 className="text-2xl font-bold mb-1">K,U</h3>

              <p className="text-gray-600 mb-4">(デジタルマーケティング戦略)</p>

            </div>

            <p className="text-gray-700 text-center">

            広告代理店にて多彩な業界でのマーケティング企画・戦略の策定を担当し、生成AIを活用したデジタル広告の最適化に精通。顧客に応じた施策立案から実行までをトータルで支援し、データ分析を活かした効果的なアプローチで、ビジネス成長を目指すアドバイスが特徴です
            </p>

          </CardContent>

        </Card>

      </div>

    </section>

  )

}



export default MentorIntroduction