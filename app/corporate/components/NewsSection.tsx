'use client';

import React from 'react';

export default function NewsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">NANDS AIニュース</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="font-bold mb-2">
              新年のご挨拶：2025年に向けた生成AI事業戦略
            </h3>
            <p className="text-sm">
              2025年に向けて、NANDSが強化するChatGPT活用領域や研修プログラムの展望についてご紹介します。
            </p>
            <a href="#" className="text-blue-600 text-sm underline mt-2 inline-block">
              詳しく読む
            </a>
          </div>

          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="font-bold mb-2">
              AIエージェント活用ラボ 設立レポート
            </h3>
            <p className="text-sm">
              AIエージェントを活用した業務効率化・イノベーション創出をテーマに社内ラボを始動。定期勉強会や事例紹介が盛り上がりを見せています。
            </p>
            <a href="#" className="text-blue-600 text-sm underline mt-2 inline-block">
              詳しく読む
            </a>
          </div>

          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="font-bold mb-2">
              新パートナーシップ締結のお知らせ
            </h3>
            <p className="text-sm">
              地域のIT企業との連携強化を発表。ChatGPTや生成AIの導入支援を通じて、地方DXの加速を目指します。
            </p>
            <a href="#" className="text-blue-600 text-sm underline mt-2 inline-block">
              詳しく読む
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 