'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../../src/components/common/Footer';

const PrivacyPage = () => {
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
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">個人情報保護方針</h2>
          <p className="mb-8 text-gray-700">
          株式会社エヌアンドエス（以下「当社」といいます。）は、AIリスキリング研修、副業支援、法人向けAI導入支援、退職支援、給付金支援、キャリアコンサルティングなど
            多岐にわたる事業（以下「本サービス」といいます。）を実施する上で、個人情報の重要性を認識し、
            これを適切に取り扱うことが社会的責務であると考えます。  
            当社は、個人情報の適切な取り扱いに組織として取り組むため、以下の方針を定め、従業員に周知徹底し、個人情報の保護に努めます。
          </p>

          <div className="space-y-8">
            {/* 1. 法令の遵守 */}
            <div>
              <h3 className="text-xl font-bold mb-4">1. 法令の遵守について</h3>
              <p className="text-gray-700">
                当社は、個人情報の保護に関する法律（個人情報保護法）及び関連する政省令・ガイドライン、
                その他関係法令を遵守し、適正な個人情報の取得・利用・管理・提供を行います。
              </p>
            </div>

            {/* 2. 個人情報の利用目的 */}
            <div>
              <h3 className="text-xl font-bold mb-4">2. 個人情報の利用目的</h3>
              <p className="text-gray-700 mb-4">
                当社は、取得した個人情報を以下の目的で利用いたします。  
                これらの目的を超えて利用する必要が生じた場合、あらためてご本人の同意を得るものとします。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>生成AIリスキリング研修サービスの運営・受講サポート</li>
                <li>副業支援サービス（無料セミナー、学習支援、案件斡旋）の運営・案内</li>
                <li>法人向けAI導入コンサルティング・研修の提供</li>
                <li>退職支援サービス（退職手続き代行等）の提供</li>
                <li>給付金申請支援サービスの提供</li>
                <li>キャリアコンサルティング（転職サポート等）の提供</li>
                <li>お客様からのお問い合わせ対応・ご意見の収集</li>
                <li>サービス品質向上・改善のための分析やマーケティング活動</li>
                <li>新サービスやキャンペーン、セミナー等のご案内</li>
                <li>アンケート調査の実施、統計情報の作成</li>
                <li>各種サービス利用契約の締結・履行・契約管理</li>
              </ul>
            </div>

            {/* 3. 安全管理措置 */}
            <div>
              <h3 className="text-xl font-bold mb-4">3. 個人情報の安全管理</h3>
              <p className="text-gray-700">
                当社は、取り扱う個人情報について、漏洩・滅失・毀損・不正アクセス等を防止するために、
                適切な技術的・組織的安全管理措置を講じます。  
                また、これらの措置を従業員に周知徹底し、継続的に見直し・改善を図ります。
              </p>
            </div>

            {/* 4. 第三者提供 */}
            <div>
              <h3 className="text-xl font-bold mb-4">4. 個人情報の第三者提供</h3>
              <p className="text-gray-700 mb-4">
                当社は、以下の場合を除き、あらかじめご本人の同意を得ることなく個人情報を第三者に提供しません。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>法令に基づき開示が求められる場合</li>
                <li>人の生命、身体または財産の保護のために必要があり、ご本人の同意を得ることが困難な場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のため特に必要がある場合</li>
                <li>
                  国または地方公共団体が法令の定める事務を遂行するうえで協力する必要があり、
                  ご本人の同意を得ることが困難な場合
                </li>
                <li>
                  業務委託に伴い、当社と機密保持契約を締結した委託先に必要な範囲で開示する場合
                </li>
                <li>
                  その他個人情報保護法または関連法令で認められる正当な理由がある場合
                </li>
              </ul>
            </div>

            {/* 5. 開示・訂正・利用停止 */}
            <div>
              <h3 className="text-xl font-bold mb-4">5. 個人情報の開示・訂正・削除等</h3>
              <p className="text-gray-700">
                当社は、ご本人から個人情報の開示・訂正・追加・削除・利用停止・消去等を求められた場合、
                ご本人の確認を行ったうえで、法令に基づき適切に対応いたします。  
                具体的な手続きにつきましては、下記の「お問い合わせ窓口」までご連絡ください。
              </p>
            </div>

            {/* 6. Cookie */}
            <div>
              <h3 className="text-xl font-bold mb-4">6. Cookieの使用について</h3>
              <p className="text-gray-700">
                当社ウェブサイトでは、利用者の利便性向上や利用状況の分析、サービス改善のためにCookieを使用することがあります。
                ブラウザの設定によりCookieの使用を制限・拒否することが可能ですが、その場合一部機能がご利用いただけない場合があります。
              </p>
            </div>

            {/* 7. 外部サービスとの連携 */}
            <div>
              <h3 className="text-xl font-bold mb-4">7. 外部サービスとの連携</h3>
              <p className="text-gray-700">
                当社のサービス利用に際し、外部の決済代行サービス、通信プラットフォーム、クラウドサービス等を使用する場合があります。
                これら外部サービスの利用により、個人情報が当該事業者に提供される場合、その取り扱いは当該事業者のプライバシーポリシーに従います。
              </p>
            </div>

            {/* 8. お問い合わせ窓口 */}
            <div>
              <h3 className="text-xl font-bold mb-4">8. お問い合わせ窓口</h3>
              <p className="text-gray-700 mb-4">
                個人情報の取り扱いに関するご質問や、開示・訂正・削除等のお申し出、その他ご意見などは下記までお問い合わせください。
              </p>
              <div className="text-gray-700 space-y-2 ml-4">
                <p className="mt-2">
                  株式会社NANDS 個人情報保護管理者  
                  〒150-0043  
                  東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C  
                  メール：contact@nands.tech  
                  電話：0120-558-551  
                  受付時間：10:00～19:00（土日祝日を除く）
                </p>
              </div>
            </div>

            {/* 9. 改定 */}
            <div>
              <h3 className="text-xl font-bold mb-4">9. プライバシーポリシーの改定</h3>
              <p className="text-gray-700">
                当社は、事業内容の変更や法令の改正などに応じて、本プライバシーポリシーを適宜見直し、改定することがあります。
                重要な変更がある場合は、当社ウェブサイト上で告知いたします。
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-sm text-gray-600">
          <p>2024年11月15日 改定</p>
          <p className="mt-4">株式会社エヌアンドエス</p>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
