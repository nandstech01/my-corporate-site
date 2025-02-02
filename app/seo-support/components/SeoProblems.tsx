import CheckCircle from '../../../src/components/common/CheckCircle';

export default function SeoProblems() {
  const problems = [
    {
      title: 'SEO対策のコストが高い',
      description: '効果的なSEO対策には継続的な投資が必要で、多くの企業様が予算面で悩まれています。'
    },
    {
      title: '成果が見えにくい',
      description: 'SEO対策は即効性がなく、投資対効果の測定が難しいと感じている方が多くいらっしゃいます。'
    },
    {
      title: '社内の知見が不足',
      description: '最新のSEO動向やGoogle対策に詳しい人材が社内におらず、どこから手をつければよいか分からない状況です。'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          こんな課題はありませんか？
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">{problem.title}</h3>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 