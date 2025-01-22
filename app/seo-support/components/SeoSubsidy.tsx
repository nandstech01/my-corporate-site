import FileText from '@/components/common/FileText';

export default function SeoSubsidy() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            期間限定の助成金をお見逃しなく
          </h2>
          <p className="text-lg text-gray-600">
            令和8年度末までの期間限定支援制度です
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">
                人材開発支援助成金について
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  本助成金は、厚生労働省が提供する人材開発支援助成金を活用したサービスです。
                  SEO対策に関する費用の<span className="font-bold text-blue-600">最大80%が補助</span>されます。
                </p>
                <p>
                  ※助成金の受給には一定の要件があります。詳しくは資料をダウンロードいただくか、
                  お問い合わせください。
                </p>
              </div>

              <div className="mt-8">
                <a
                  href="#contact"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  詳しい資料をダウンロード
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 