import Lightbulb from '@/components/common/Lightbulb';

export default function SeoMerits() {
  const merits = [
    {
      title: '80%の費用が補助',
      description: '助成金を活用することで、SEO対策費用の80%が補助されます。100万円の施策なら実質20万円でスタート可能です。'
    },
    {
      title: '実績に基づく戦略立案',
      description: '豊富な実績とノウハウを活かし、KPIの設定から改善まで一貫してサポート。成果の見える化を重視します。'
    },
    {
      title: 'ワンストップサポート',
      description: '企画・運用・制作までをワンストップで対応。専門知識がなくても、安心してお任せいただけます。'
    },
    {
      title: 'トレンド対応',
      description: '最新のGoogleアルゴリズムに対応した施策を展開。常に最新のSEO動向を取り入れています。'
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          助成金活用SEOのメリット
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {merits.map((merit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">{merit.title}</h3>
                  <p className="text-gray-600">{merit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 