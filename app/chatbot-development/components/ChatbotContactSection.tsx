export default function ChatbotContactSection() {
  return (
    <section id="consultation-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            チャットボット開発
            <span className="block text-blue-600">無料相談・お問い合わせ</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            お客様のニーズに最適なチャットボットソリューションをご提案いたします。<br />
            まずはお気軽にご相談ください。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* お問い合わせフォーム */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              お問い合わせフォーム
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="山田太郎"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="株式会社○○"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="contact@nands.tech"
                />
              </div>

              <div>
                <label htmlFor="chatbot-type" className="block text-sm font-medium text-gray-700 mb-2">
                  チャットボット種別
                </label>
                <select
                  id="chatbot-type"
                  name="chatbot-type"
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">選択してください</option>
                  <option value="customer-support">カスタマーサポートボット</option>
                  <option value="ec-sales">ECサイト販売ボット</option>
                  <option value="internal-helpdesk">社内ヘルプデスクボット</option>
                  <option value="education">教育・研修ボット</option>
                  <option value="data-analysis">データ分析ボット</option>
                  <option value="multilingual">多言語対応ボット</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  予算感
                </label>
                <select
                  id="budget"
                  name="budget"
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">選択してください</option>
                  <option value="40-80">40万円〜80万円</option>
                  <option value="80-150">80万円〜150万円</option>
                  <option value="150-300">150万円〜300万円</option>
                  <option value="300+">300万円以上</option>
                  <option value="undecided">未定・相談したい</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  相談内容・要望 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                  placeholder="チャットボットで解決したい課題や実現したい機能について詳しくお聞かせください。現在の運用状況や想定している利用者数なども含めてご記入いただけると、より具体的なご提案が可能です。"
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 px-8 font-semibold border border-gray-200 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                >
                  無料相談を申し込む
                </button>
              </div>
            </form>
          </div>

          {/* 相談の流れ・サポート情報 */}
          <div className="space-y-8">
            {/* 相談の流れ */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                相談の流れ
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white border border-gray-200 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      お問い合わせ
                    </h4>
                    <p className="text-gray-600 text-sm">
                      フォームまたはメールでお気軽にご相談ください
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white border border-gray-200 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      ヒアリング
                    </h4>
                    <p className="text-gray-600 text-sm">
                      課題や要望を詳しくお聞きし、最適なソリューションを検討
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white border border-gray-200 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      ご提案
                    </h4>
                    <p className="text-gray-600 text-sm">
                      機能仕様・料金・スケジュールを含む詳細提案書を作成
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white border border-gray-200 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      開発開始
                    </h4>
                    <p className="text-gray-600 text-sm">
                      ご契約後、即座に開発に着手いたします
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* サポート情報 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-6">
                サポート体制
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-cyan-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-100">24時間以内の初回回答</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-cyan-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-100">専任エンジニアによる技術サポート</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-cyan-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-100">開発完了後も継続サポート</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-cyan-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-100">運用・保守まで一貫対応</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-blue-100 mb-4">
                    直接のご相談も承ります
                  </p>
                  <div className="space-y-2">
                    <div className="text-xl font-bold">
                      contact@nands.tech
                    </div>
                    <div className="text-sm text-blue-200">
                      営業時間: 平日 9:00-18:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 