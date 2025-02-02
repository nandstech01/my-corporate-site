// src/components/CourseFeatures.tsx
import React from 'react';
import Card from './common/Card';
import CardContent from './common/CardContent';
import CardHeader from './common/CardHeader';
import CardTitle from './common/CardTitle';


const CourseFeatures = () => {
  return (
    <div id="コースの特徴" className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">コースの特徴</h2>

        <p className="text-xl text-center mb-12" style={{ color: '#1D4ED8', fontWeight: 'bold' }}>
  <span className="block">学びたい目的に応じて</span>
  <span className="block">選べる3つのコース</span>
</p>

        <p className="text-lg mb-8">
          目的によって使用する生成AIツールやプロンプトの入力方法が異なります。NANDS 生成AIリスキリング研修では、目的に応じた学習コースをご用意し、ビジネスの現場で活かせるプロンプト技術の習得をサポートします。
        </p>

        <Card className="mb-8">
          <CardHeader>
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-center">
  <span className="block">生成AIを自在に活用するために</span>
  <span className="block">欠かせないスキル！それが</span>
  <span className="block mt-4 mb-4">『プロンプトエンジニアリング』</span>
</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-lg mb-4">
              ChatGPTなどの生成AIに触れ、実際に使ってみたものの、思うように結果が得られないと感じた経験はないでしょうか？
            </p>

            <p className="mb-4">
              生成AIで意図した成果を引き出すには、生成AIとの「対話言語」を理解し、対話の仕方を熟知することが必要不可欠です。これは英語を学んでコミュニケーションを取るように、生成AIと意図を共有し、ビジネスで理想の成果を引き出すための「言語」を習得することと同じです。
            </p>

            <h3 className="font-bold mb-2">こんな方におすすめ！</h3>

            <p className="relative inline-block text-white">
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-opacity-50 text-transparent bg-clip-text px-1 font-bold">
                生成AIを使ってみたが、思ったように使いこなせない方
              </span>
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-opacity-50 text-transparent bg-clip-text px-1 font-bold">
                、日々のルーティンワークの効率化、クオリティアップを図りたい方
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CourseFeatures;
