'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PartnerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      category: '申請・審査について',
      icon: '📋',
      questions: [
        {
          q: '審査にはどのくらい時間がかかりますか？',
          a: '申請受付後、3営業日以内に審査結果をご連絡いたします。審査では事業内容、実績、月間想定成約数などを総合的に判断いたします。'
        },
        {
          q: '審査に落ちることはありますか？',
          a: '申し訳ございませんが、事業内容やターゲット層が合わない場合、審査をお断りする場合があります。ただし、将来的な可能性を考慮し、再申請のご案内をする場合もございます。'
        },
        {
          q: '個人でも申請できますか？',
          a: 'はい、個人事業主やフリーランスの方でも申請可能です。インフルエンサーパートナーとして、SNSでの影響力や法人への紹介実績があれば歓迎いたします。'
        }
      ]
    },
    {
      category: '料金・契約について',
      icon: '💰',
      questions: [
        {
          q: '月額10万円以外に費用はかかりますか？',
          a: '月額10万円のパートナー費用以外に、初期費用や追加費用は一切ございません。営業ツール、研修、サポートもすべて含まれています。'
        },
        {
          q: '契約期間はありますか？',
          a: '最低契約期間は6ヶ月です。効果を実感いただくために必要な期間と考えております。6ヶ月後は月単位での更新となります。'
        },
        {
          q: '途中解約は可能ですか？',
          a: '最低契約期間の6ヶ月以降であれば、1ヶ月前の書面通知で解約可能です。解約金や違約金は発生いたしません。'
        },
        {
          q: 'パートナー報酬の支払いタイミングはいつですか？',
          a: '成約確定後、翌月末日にお支払いいたします。銀行振込にて、振込手数料は弊社負担です。'
        }
      ]
    },
    {
      category: '紹介・営業について',
      icon: '🤝',
      questions: [
        {
          q: '営業経験がなくても大丈夫ですか？',
          a: '専用の営業研修、営業ツール（資料・動画）、専属サポート担当者を提供いたします。営業未経験の方でも安心してスタートできます。'
        },
        {
          q: '紹介先の制限はありますか？',
          a: '特に制限はございません。あらゆる業界・規模の法人様にご紹介いただけます。ただし、反社会的勢力との関係がある企業は対象外です。'
        },
        {
          q: '競合他社のサービスと併用できますか？',
          a: 'AIリスキリング・SNSマーケティング分野での直接的な競合サービスとの併用はご遠慮いただいております。詳細は契約時にご相談ください。'
        },
        {
          q: 'どのような企業が成約しやすいですか？',
          a: '従業員10名以上の企業、DX推進を検討中の企業、SNSマーケティングに課題を感じている企業などが成約しやすい傾向にあります。'
        }
      ]
    },
    {
      category: 'サポート・研修について',
      icon: '📚',
      questions: [
        {
          q: 'どのようなサポートを受けられますか？',
          a: '専属サポート担当者による営業支援、月1回のパートナー限定研修、営業ツールの提供、成果分析・改善提案などを行います。'
        },
        {
          q: '研修の内容を教えてください',
          a: 'AIリスキリング技術の基礎、RE・GEO実装の説明、営業手法、クロージングテクニック、助成金活用方法などを学べます。'
        },
        {
          q: '成果が出ない場合のサポートはありますか？',
          a: '月次で成果分析を行い、改善点をご提案いたします。必要に応じて追加研修や個別コンサルティングも実施いたします。'
        }
      ]
    },
    {
      category: '技術・サービスについて',
      icon: '🚀',
      questions: [
        {
          q: 'RE・GEO実装とは何ですか？',
          a: 'Relevance Engineering（関連性工学）とGenerative Engine Optimization（生成エンジン最適化）の実装です。AI検索エンジンでの上位表示を実現する日本初の技術です。'
        },
        {
          q: '630%改善の根拠を教えてください',
          a: '検索類似度が0.13から0.82に向上した実績に基づいています（630%改善）。具体的な測定データと改善事例をパートナー研修でご紹介いたします。'
        },
        {
          q: '助成金活用の成功率はどの程度ですか？',
          a: '弊社サポートでの助成金申請成功率は98%です。人材開発支援助成金の申請から受給まで、専門スタッフが完全サポートいたします。'
        },
        {
          q: '他社との差別化ポイントは何ですか？',
          a: '①日本初のRE・GEO実装、②630%改善の実証済み技術、③keita(20万フォロワー)との連携、④98%の助成金申請成功率が主な差別化要因です。'
        }
      ]
    }
  ]

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const index = categoryIndex * 1000 + questionIndex
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            よくある
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              質問
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            パートナープログラムに関する
            <br />
            よくいただくご質問をまとめました
          </motion.p>
        </div>

        {/* FAQ一覧 */}
        <div className="max-w-5xl mx-auto space-y-8">
          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
              className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-200"
            >
              {/* カテゴリヘッダー */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
              </div>

              {/* 質問一覧 */}
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const index = categoryIndex * 1000 + questionIndex
                  const isOpen = openIndex === index

                  return (
                    <div
                      key={questionIndex}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* 質問 */}
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="text-lg font-semibold text-gray-900 pr-4">
                          Q. {faq.q}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </button>

                      {/* 回答 */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t border-gray-100">
                              <div className="pt-4">
                                <span className="text-gray-700 leading-relaxed">
                                  A. {faq.a}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* お問い合わせCTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-12 border border-purple-200"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            他にご質問はございますか？
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            パートナープログラムについて、どんな小さなことでもお気軽にお問い合わせください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#application"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                🚀 まずはパートナー申請
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            
            <a
              href="/contact"
              className="group px-8 py-4 border-2 border-purple-600 text-purple-600 font-bold rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                📞 個別にお問い合わせ
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 