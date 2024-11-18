'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/common/Footer';

const TermsPage = () => {
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
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>
        <p className="mb-8 text-gray-700">本契約を締結するにあたっては本規約を熟読、熟慮の上、十分にご検討ください。</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">本則</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">第1条（適用範囲）</h3>
              <p className="text-gray-700">
                本規約は、株式会社NANDS（以下、「乙」という。）の提供するNANDS生成AIリスキリング研修（以下、「本サービス」という。）に関し、その申込者（以下、「甲」という。）との間で締結される受講契約（以下、「本契約」という。）、本サービスの利用及び諸手続について適用されるものとする。本規約に定めのない事項については、乙による各種通知、案内等の定めによるものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第2条（提供する役務の内容等）</h3>
              <p className="text-gray-700 mb-4">
                乙は、甲に対し、本契約に基づき、生成AI活用に関する教育、指導、講義並びに学習教材及び学習環境の提供、生成AIの知識や技能の活用方法の教育、指導、講義等（以下、「学習指導」という。）を行う。なお、乙は本サービスの受講コース毎で適当な学習指導方式を取るものとする。
              </p>
              <p className="text-gray-700">
                乙による甲への学習指導は以下の方法によって提供する。
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-700">
                <li>オンラインプラットフォームを通じた教材の提供</li>
                <li>ビデオ通話によるメンタリング及び質疑応答</li>
                <li>チャットツールを用いたサポート</li>
                <li>その他乙が定める方法</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第3条（受講コースと料金）</h3>
              <div className="space-y-4 text-gray-700">
                <p>本サービスは以下のコースを提供する。</p>
                <div className="ml-4">
                  <h4 className="font-bold mb-2">1. 基礎コース（AIリテラシー研修）</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>受講期間：4週間</li>
                    <li>受講料：99,000円（税込）</li>
                    <li>内容：プロンプトエンジニアリングの基礎、ChatGPTの効果的な使用方法</li>
                  </ul>

                  <h4 className="font-bold mt-4 mb-2">2. 応用コース（実務プロンプトエンジニアリング）</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>受講期間：6週間</li>
                    <li>受講料：149,000円（税込）</li>
                    <li>内容：AIモデルの選択と統合、実務で役立つプロンプトの設計</li>
                  </ul>

                  <h4 className="font-bold mt-4 mb-2">3. エキスパートコース（キャリアアッププロンプトエンジニア）</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>受講期間：8週間</li>
                    <li>受講料：199,000円（税込）</li>
                    <li>内容：AI導入のロードマップ作成、チーム編成と人材育成計画</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第4条（受講期間の延長）</h3>
              <p className="text-gray-700">
                甲は、学習指導開始後且つ学習指導期間終了日の1週間前までに、乙に申し出ることによって、本契約締結時に定めた乙による学習指導の期間の延長を、4週間単位で行うことができる。延長料金は4週間あたり88,000円（税込）とする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第5条（返金保証）</h3>
              <p className="text-gray-700">
                乙は、甲が学習指導開始日から8日以内に返金を申し出た場合、受講料の全額を返金する。返金の申出は乙の指定する方法で行うものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第6条（受講環境の整備）</h3>
              <p className="text-gray-700">
                甲は、本サービスの受講に必要な通信環境、デバイス等を自己の責任と費用において整備するものとする。乙は、甲の通信環境等に起因する不具合について一切の責任を負わないものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第7条（知的財産権）</h3>
              <p className="text-gray-700">
                本サービスにおいて提供される全てのコンテンツ（教材、動画、テキスト等）に関する知的財産権は乙又は正当な権利者に帰属する。甲は、これらのコンテンツを複製、転載、改変、販売、その他営利目的での利用を行ってはならない。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第8条（禁止事項）</h3>
              <p className="text-gray-700 mb-4">
                甲は、本サービスの利用にあたり、以下の行為を行ってはならない。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                <li>本サービスの運営を妨害する行為</li>
                <li>他の受講者の学習を妨害する行為</li>
                <li>乙又は第三者の知的財産権を侵害する行為</li>
                <li>本サービスのコンテンツを無断で第三者に提供する行為</li>
                <li>その他、法令又は公序良俗に反する行為</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第9条（受講資格の停止）</h3>
              <p className="text-gray-700">
                乙は、甲が本規約に違反した場合、又は本サービスの運営に支障をきたす行為を行った場合、事前の通知なく甲の受講資格を停止することができる。この場合、既に支払われた受講料は返金されないものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第10条（サービスの中断・変更）</h3>
              <p className="text-gray-700">
                乙は、システムメンテナンス、天災地変、その他やむを得ない事由により、本サービスの提供を一時的に中断することができる。また、乙は、本サービスの品質向上のため、事前の通知なくカリキュラム内容を変更することができる。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第11条（個人情報の取扱い）</h3>
              <p className="text-gray-700">
                乙は、甲の個人情報を適切に管理し、本サービスの提供、改善、及び甲への連絡以外の目的で使用しない。個人情報の取扱いの詳細については、乙のプライバシーポリシーに定めるものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第12条（秘密保持）</h3>
              <p className="text-gray-700">
                甲は、本サービスの利用を通じて知り得た乙及び他の受講者の秘密情報を、第三者に開示又は漏洩してはならない。この義務は、本契約終了後も継続するものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第13条（損害賠償）</h3>
              <p className="text-gray-700">
                甲が本規約に違反し、乙に損害を与えた場合、甲は乙に対して当該損害を賠償する責任を負う。また、甲が本サービスの利用により第三者に損害を与えた場合、甲は自己の責任と費用において解決するものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第14条（免責事項）</h3>
              <p className="text-gray-700">
                乙は、本サービスの利用により甲に生じた損害について、乙の故意又は重大な過失による場合を除き、一切の責任を負わないものとする。また、乙は、本サービスの利用による甲の目的達成を保証するものではない。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第15条（反社会的勢力の排除）</h3>
              <p className="text-gray-700">
                甲及び乙は、自己が反社会的勢力に該当しないこと、及び反社会的勢力と一切の関係を有しないことを表明し、保証する。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第16条（規約の変更）</h3>
              <p className="text-gray-700">
                乙は、本規約を随時変更することができる。変更後の規約は、乙が別途定める場合を除き、乙のウェブサイトに表示した時点で効力を生じるものとする。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">第17条（準拠法・管轄裁判所）</h3>
              <p className="text-gray-700">
                本規約の解釈及び適用は日本法に準拠するものとし、本サービスに関して紛争が生じた場合には、大津地方裁判所を第一審の専属的合意管轄裁判所とする。
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-sm text-gray-600">
          <p>2024年2月1日制定</p>
          <p className="mt-4">株式会社NANDS</p>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default TermsPage; 