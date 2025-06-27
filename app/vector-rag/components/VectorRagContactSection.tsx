export default function VectorRagContactSection() {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            無料相談・お問い合わせ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            あなたの企業に最適なベクトルRAGシステムについて、まずはお気軽にご相談ください
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左側：お問い合わせフォーム */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              詳細相談フォーム
            </h3>
            
            <form className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="株式会社○○"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="example@company.com"
                />
              </div>

              {/* 専門項目 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  検索対象データの種別 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "技術文書・マニュアル",
                    "契約書・法務文書",
                    "研究論文・レポート",
                    "FAQ・問い合わせ履歴",
                    "社内規定・ポリシー",
                    "顧客情報・営業資料",
                    "医療・診療ガイド",
                    "その他"
                  ].map((type) => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  想定文書数
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500">
                  <option value="">選択してください</option>
                  <option value="1000-">1,000件未満</option>
                  <option value="1000-10000">1,000〜10,000件</option>
                  <option value="10000-100000">10,000〜100,000件</option>
                  <option value="100000+">100,000件以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  予算感
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500">
                  <option value="">選択してください</option>
                  <option value="50-100">50万円〜100万円</option>
                  <option value="100-200">100万円〜200万円</option>
                  <option value="200-500">200万円〜500万円</option>
                  <option value="500+">500万円以上</option>
                  <option value="consulting">まずは相談したい</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  検索要件・課題について
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="現在の課題、実現したい検索機能、特別な要件などをお聞かせください"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 border border-gray-200 font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                無料相談を申し込む
              </button>
            </form>
          </div>

          {/* 右側：相談の流れ・サポート情報 */}
          <div className="space-y-8">
            {/* 相談の流れ */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                相談の流れ
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "要件ヒアリング",
                    description: "現在の課題、検索対象データ、実現したい機能について詳しくお聞きします",
                    duration: "30-60分"
                  },
                  {
                    step: "2", 
                    title: "PoC提案",
                    description: "サンプルデータでの概念実証を通じて、システムの有効性を確認いただきます",
                    duration: "1-2週間"
                  },
                  {
                    step: "3",
                    title: "システム設計",
                    description: "詳細な要件定義とシステム設計書を作成し、開発計画をご提示します",
                    duration: "1週間"
                  },
                  {
                    step: "4",
                    title: "本格導入",
                    description: "本格的なシステム開発・導入を開始し、継続的なサポートを提供します",
                    duration: "2-6週間"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold text-sm mr-4">
                      {item.step}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className="text-sm text-blue-600 font-medium">{item.duration}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* サポート体制 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                サポート体制
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">24時間以内初回回答</h4>
                    <p className="text-gray-600 text-sm">お問い合わせから24時間以内に担当者よりご連絡いたします</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">専任エンジニア</h4>
                    <p className="text-gray-600 text-sm">AI・機械学習専門のエンジニアが直接対応いたします</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">継続サポート</h4>
                    <p className="text-gray-600 text-sm">導入後も継続的な運用サポート・改善提案を提供します</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">運用保守一貫対応</h4>
                    <p className="text-gray-600 text-sm">開発から運用まで一貫してサポートいたします</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                お急ぎの方はお電話でも
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">メール</h4>
                  <p className="text-blue-600">contact@nands.tech</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">営業時間</h4>
                  <p className="text-gray-600">平日 9:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 