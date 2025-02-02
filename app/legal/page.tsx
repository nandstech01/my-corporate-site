'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../../src/components/common/Footer';

const LegalPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="pt-16">
      <motion.div 
        {...fadeIn}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <h1 className="text-3xl font-bold mb-8">特定商取引法に基づく表記</h1>

        <div className="space-y-12">
          {/* 1) 事業者情報 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">事業者情報</h2>
            <dl className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">事業者名</dt>
                <dd className="md:col-span-3">株式会社エヌアンドエス</dd>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <dt className="font-bold text-gray-700">ホームページ</dt>
                <dd className="md:col-span-3">https://nands.tech</dd>
              </div>
            </dl>
          </section>

          {/* 2) 販売・サービス内容 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">販売・サービス内容</h2>
            <p className="text-gray-700 mb-8">
              当社は、AIリスキリング研修サービス、副業支援サービス、法人向けAI導入支援サービス、
              退職支援・給付金支援サービス、キャリアコンサルティング等、多様なオンライン・オフライン支援サービスを提供しています。
              各サービスの詳細や申し込み方法、契約内容は本ウェブサイトまたはご案内資料に記載しております。
            </p>
          </section>

          {/* 3) 販売価格・支払い方法 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">販売価格・サービス利用料金</h2>
            <p className="text-gray-700 mb-6">
              各サービスの利用料金（受講料・コンサル料・成果報酬 等）は、
              それぞれのページやご案内資料で個別に提示しております。  
              無料セミナーや無料相談を実施する場合もあり、詳細は対象サービスのページをご参照ください。
            </p>

            <h2 className="text-xl font-bold mb-6">お支払い方法</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>銀行振込（前払い）</li>
              <li>クレジットカード払い</li>
              <li>その他（個別サービスごとに案内）</li>
            </ul>
            <p className="mt-4 text-gray-700">
              ※お支払い方法はサービス内容や契約形態によって異なる場合がありますので、
              事前にご案内する利用契約・請求書等をご確認ください。
            </p>
          </section>

          {/* 4) サービス提供時期 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">サービス提供の時期</h2>
            <p className="text-gray-700 mb-8">
              基本的に、ご入金・契約手続き完了後、指定の開始日・受講日程・コンサル日程に沿ってサービスを提供いたします。
              オンライン学習用のアカウント発行や講義・コンサル日程のご連絡は、手続き完了後に順次お知らせします。
            </p>

            <h2 className="text-xl font-bold mb-6">キャンセル・返品について</h2>
            <p className="text-gray-700 mb-6">
              無形のオンラインサービスであるため、原則として返品はできません。  
              ただし、一部サービス（例：リスキリング研修など）では受講開始後一定期間内のキャンセルや返金保証を設けている場合があります。  
              詳細は利用規約または個別契約の定めをご確認ください。
            </p>
          </section>

          {/* 5) その他注意事項 */}
          <section className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">備考・注意事項</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                サービスの利用に必要なPC・通信環境・ソフトウェアライセンス等は、原則として甲（お客様）の責任と費用にてご用意ください。
                当社ではこれらの設備について補償やサポートを行っておりません。
              </li>
              <li>
                提供するサービスは主にオンラインで行われるため、
                ネットワーク障害や環境要因によりセッションが中断・遅延する場合があります。
                その際は可能な限り振替や再実施の調整を行いますが、免責となる場合もあります。
              </li>
              <li>
                当社が明示する以外の料金（インターネット接続費用、振込手数料等）は甲のご負担となります。
              </li>
              <li>
                その他ご不明点は、事前に当社までお問い合わせください。
              </li>
            </ul>
          </section>
        </div>

        {/* 最終更新日 */}
        <div className="mt-12 text-sm text-gray-600">
          <p>最終更新日：2024年11月15日</p>
          <p className="mt-4">株式会社エヌアンドエス</p>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default LegalPage;
