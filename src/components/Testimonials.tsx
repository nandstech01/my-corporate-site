import Card from './common/Card';
import CardContent from './common/CardContent';
import CardHeader from './common/CardHeader';

import React, { useState } from 'react';

const testimonialsData = [
  {
    id: 1,
    course: "基礎コース AIリテラシー研修",
    name: "山下裕輝さん",
    role: "情報サービス・webサービス",
    image: "/images/yamashita_yuki.png",
    before: "資料作成にChatGPTを活用していたものの、出力結果に満足できず、修正作業が頻発していました",
    after: "出力結果の修正がほぼ不要になり。そのまま社内で提案資料として活用できるクオリティにまで改善できました",
    feedback: "業務に関する改善提案資料の作成に以前からChatGPTを利用していたのですが、満足いく出力が得られず、手直しが発生することに課題感を抱いていました。受講により、効果的なプロンプト入力法を学ぶことで、ほぼ手直しせず出力結果を提案資料に利用できるように。作業時間が大幅に短縮されたおかげで提案数が増えるなど、仕事での成果が出始めています。",
  },
  {
    id: 2,
    course: "応用コース 実務プロンプトエンジニアリング",
    name: "鈴木あゆみさん",
    role: "マーケティング・広告",
    image: "/images/suzuki_ayumi.png",
    before: "プロンプトの設計に苦労しており、効果的な結果が得られずにいました。",
    after: "プロンプト設計のスキルが向上し、業務での成果が明確に見えるようになりました。",
    feedback: "受講後は、プロンプト設計のスキルが向上し、業務での成果が明確に見えるようになりました。チーム内でのコミュニケーションも円滑になり、プロジェクトの進行がスムーズになりました。",
  },
  {
    id: 3,
    course: "エキスパートコース キャリアアップ",
    name: "田中亮太さん",
    role: "ITコンサルタント",
    image: "/images/tanaka_ryota.png",
    before: "AI導入に関する知識が不足しており、戦略を立てる自信がありませんでした。",
    after: "AI導入戦略を立案するスキルが身につき、キャリアアップに繋がりました。",
    feedback: "受講後は、AI導入戦略を立案するスキルが身につき、キャリアアップに繋がりました。具体的なプロジェクトにおいても、リーダーシップを発揮できるようになりました。",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section id="受講生の声" className="bg-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 relative">
          各コース受講者の声
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></span>
        </h2>

        {/* 受講者の声 */}
        {testimonialsData.map((testimonial, index) => (
          <Card key={testimonial.id} className={`w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${currentIndex === index ? 'block' : 'hidden'}`}>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4">
              <h3 className="text-xl font-bold">{testimonial.course}</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-lg font-semibold">{testimonial.after}</h4>
                  <p className="text-gray-600">
                    {testimonial.name}
                    <span className="text-gray-500 text-sm">（{testimonial.role}）</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="inline-block bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">受講前</h5>
                  <p className="text-gray-700">{testimonial.before}</p>
                </div>
                <div>
                  <h5 className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">受講後</h5>
                  <p className="text-gray-700">{testimonial.after}</p>
                </div>
                <p className="text-gray-600 text-sm mt-4">{testimonial.feedback}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* スライドのドット */}
        <div className="flex justify-center mt-8">
          {testimonialsData.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${currentIndex === index ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-gray-300'}`}
              onClick={() => handleDotClick(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;