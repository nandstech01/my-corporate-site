import MessageCircle from '@/components/common/MessageCircle';

export default function SeoFlow() {
  const steps = [
    {
      title: '資料ダウンロード',
      description: '助成金を活用したSEO戦略の全体像をまとめた資料をお送りします。'
    },
    {
      title: 'ヒアリング',
      description: '現状の課題やご要望をお伺いし、最適なプランをご提案します。'
    },
    {
      title: 'お見積り＆契約',
      description: '助成金申請のサポートを含め、具体的な進め方をご説明します。'
    },
    {
      title: 'SEO施策開始',
      description: 'サイト分析から改善施策の実施まで、包括的にサポートします。'
    }
  ];

  return (
    <section id="flow" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          ご利用の流れ
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative"
            >
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-blue-600 font-semibold mb-1">
                      STEP {index + 1}
                    </div>
                    <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            まずは資料をダウンロード
          </a>
        </div>
      </div>
    </section>
  );
} 