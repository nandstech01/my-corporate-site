'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/common/Footer';

const PrivacyPage = () => {
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
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">個人情報保護方針</h2>
          <p className="mb-8 text-gray-700">
            株式会社NANDS（以下「当社」といいます。）は、事業を実施する上で、個人情報の重要性を認識し、個人情報を適切に取り扱うことが社会的責務であると考えます。そこで、当社は、個人情報の適切な取り扱いについて組織として取り組むために個人情報保護方針を以下のとおり定め、従業員に周知し、個人情報の保護に努めます。
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">1. 法令の遵守について</h3>
              <p className="text-gray-700">
                当社は、個人情報の適切な取り扱いのため、個人情報保護法及び関連法令を遵守します。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">2. 個人情報の利用目的</h3>
              <p className="text-gray-700 mb-4">当社は、以下の目的で個人情報を利用いたします：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>生成AIリスキリング研修サービスの提供</li>
                <li>キャリアコンサルティングサービスの提供</li>
                <li>退職支援サービスの提供</li>
                <li>給付金申請支援サービスの提供</li>
                <li>お客様からのお問い合わせ対応</li>
                <li>サービス品質向上のための分析</li>
                <li>新サービスの開発</li>
                <li>キャンペーン、セミナー等のご案内</li>
                <li>アンケート調査の実施</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">3. 個人情報の安全管理</h3>
              <p className="text-gray-700">
                当社は、個人情報の紛失、破壊、改ざん、漏洩などを防止するため、適切な安全管理措置を講じます。また、個人情報を取り扱う従業員及び委託先に対して、適切な監督を行います。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">4. 個人情報の第三者提供</h3>
              <p className="text-gray-700">
                当社は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供いたしません。ただし、以下の場合は除きます：
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">5. 個人情報の開示・訂正・削除</h3>
              <p className="text-gray-700">
                当社は、ご本人から個人情報の開示、訂正、追加、削除、利用停止、消去等を求められた場合は、ご本人であることを確認の上、適切に対応いたします。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">6. Cookieの使用について</h3>
              <p className="text-gray-700">
                当社のウェブサイトでは、サービスの向上及び利用状況の分析のためにCookieを使用しています。ブラウザの設定により、Cookieの使用を制限することが可能です。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">7. お問い合わせ窓口</h3>
              <div className="text-gray-700 space-y-2">
                <p>個人情報の取り扱いに関するお問い合わせは、下記までご連絡ください：</p>
                <p className="mt-4">
                  株式会社NANDS 個人情報保護管理者<br />
                  〒150-0043<br />
                  東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C<br />
                  メール：contact@nands.tech<br />
                  電話：0120-558-551<br />
                  受付時間：10:00～19:00（土日祝日を除く）
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">8. プライバシーポリシーの改定</h3>
              <p className="text-gray-700">
                当社は、必要に応じて本プライバシーポリシーを改定することがあります。重要な変更がある場合は、当ウェブサイト上でお知らせいたします。
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-sm text-gray-600">
          <p>制定日：2024年2月1日</p>
          <p className="mt-4">株式会社NANDS</p>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default PrivacyPage; 