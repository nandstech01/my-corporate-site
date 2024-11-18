'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/common/Footer';

const LegalPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-16">
      <motion.div 
        {...fadeIn}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <h1 className="text-3xl font-bold mb-8">特定商取引法に基づく表記</h1>

        <div className="space-y-12">
          {/* 事業者情報 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <dl className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">事業者名</dt>
                <dd className="md:col-span-3">株式会社NANDS</dd>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">代表者名</dt>
                <dd className="md:col-span-3">原田 賢治</dd>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">所在地</dt>
                <dd className="md:col-span-3">
                  <p className="font-semibold mb-2">[本社]</p>
                  〒520-0025<br />
                  滋賀県大津市皇子ヶ丘２丁目１０番２５−３００４号
                  <p className="font-semibold mt-4 mb-2">[東京支社]</p>
                  〒150-0043<br />
                  東京都渋谷区道玄坂１丁目１０番８号 渋谷道玄坂東急ビル2F-C
                </dd>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">電話番号</dt>
                <dd className="md:col-span-3">0120-558-551</dd>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">電話受付時間</dt>
                <dd className="md:col-span-3">10:00 ～ 19:00（土日祝日を除く）</dd>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">メールアドレス</dt>
                <dd className="md:col-span-3">contact@nands.tech</dd>
              </div>
            </dl>
          </section>

          {/* 販売価格・支払方法 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">販売価格</h2>
            <p className="text-gray-700 mb-8">各コースの詳細ページをご参照ください。</p>

            <h2 className="text-xl font-bold mb-6">お支払い方法</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>銀行振込</li>
              <li>クレジットカード払い</li>
            </ul>
            <p className="mt-4 text-gray-700">※いずれのお支払い方法も、お支払いは前払いとなります。</p>
          </section>

          {/* サービス提供について */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">サービスの提供時期</h2>
            <p className="text-gray-700 mb-8">
              ご入金を確認できた方に対し、受講日程の初日よりサービス提供を開始いたします。
              オンライン学習用のアカウント発行及び講義日程についての案内をお送りいたします。
            </p>

            <h2 className="text-xl font-bold mb-6">キャンセル・返品について</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                サービス提供開始より8日以内に申請を行うことで受講のキャンセルを行うことができます。
                詳細は利用規約をご確認ください。
              </p>
            </div>
          </section>

          {/* 備品について */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">備品について</h2>
            <p className="text-gray-700">
              サービスの利用に必要な、コンピューター、通信環境などはお客様での準備・維持をお願いしており、
              当社ではその準備・保証をしておりません。
            </p>
          </section>
        </div>

        <div className="mt-12 text-sm text-gray-600">
          <p>最終更新日：2024年2月1日</p>
          <p className="mt-4">株式会社NANDS</p>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default LegalPage; 