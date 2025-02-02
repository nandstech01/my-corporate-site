import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./common/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';

const AILaborMarketImpact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const automationData = [
    { country: "香港", percent: 29 },
    { country: "日本", percent: 28 },
    { country: "インド", percent: 27 },
    { country: "シンガポール", percent: 26 },
    { country: "中国", percent: 25 },
    { country: "アメリカ", percent: 24 },
    { country: "ドイツ", percent: 23 },
    { country: "イギリス", percent: 22 },
    { country: "オーストラリア", percent: 21 },
    { country: "フランス", percent: 20 },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/background.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent" />
      </div>

      <motion.div 
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="relative z-20 max-w-6xl mx-auto text-white"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 leading-tight">
          AI革命の波が押し寄せる<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            労働市場の大変革の時代
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6 text-center">
            <p className="text-lg leading-relaxed relative z-30">
              AIの急速な進化が、私たちの働き方を根本から変えようとしています。ゴールドマンサックスの衝撃的なレポートによると、世界中で約3億人分もの仕事がAIによって自動化される可能性があるといいます。
            </p>
            <p className="text-lg leading-relaxed relative z-30">
              この予測は、私たちの労働市場に迫る巨大な変革の波を示唆しています。そして、この波は既に世界の巨大テクノロジー企業を襲っています。
            </p>
          </div>
          <div className="relative h-64 md:h-full rounded-lg overflow-hidden shadow-2xl">
            <img
              src="/images/inner-image.jpg"
              alt="AIとヒトが共存する未来的な都市風景"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        <Card className="bg-white border-none shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">AIによる職業の自動化リスク：国別比較</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={automationData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 30]} tick={{ fill: 'gray' }} />
                <YAxis dataKey="country" type="category" width={100} tick={{ fill: 'gray' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none' }}
                  labelStyle={{ color: 'gray' }}
                  itemStyle={{ color: 'gray' }}
                  formatter={(value) => [`${value}%`, '自動化リスク']}
                />
                <Bar dataKey="percent" barSize={20}>
                  {automationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.country === "日本" ? "#ff7300" : `rgba(0, 172, 193, ${0.5 + (entry.percent / 60)})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="relative bg-white border-none shadow-xl">
            <CardContent className="relative z-30 p-6 text-center">
            <h3 className="relative z-30 font-bold text-xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  Googleの大胆な決断：12,000人規模の人員削減
</h3>
              <div className="relative z-30 h-48 mb-4 rounded-lg overflow-hidden">
                <img
                  src="/images/google-office.jpg"
                  alt="Googleの未来志向のオフィス"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <p className="relative z-30 text-lg text-gray-900">
                AI時代への適応を目指し、Googleは組織の大規模な再編を実施。この動きは、テクノロジー業界全体に衝撃を与え、AI導入による雇用への影響の現実を浮き彫りにしました。
              </p>
            </CardContent>
          </Card>
          <Card className="relative bg-white border-none shadow-xl">
            <CardContent className="relative z-30 p-6 text-center">
            <h3 className="relative z-30 font-bold text-xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  Amazonの戦略的シフト：18,000人の従業員と別れを告げる
</h3>
              <div className="relative z-30 h-48 mb-4 rounded-lg overflow-hidden">
                <img
                  src="/images/amazon-warehouse.jpg"
                  alt="Amazonの自動化された倉庫"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <p className="relative z-30 text-lg text-gray-900">
                効率化と自動化を推進し、Amazonは新たなビジネスモデルへの移行を加速。この大規模なレイオフは、AI時代における企業の迅速な適応能力の重要性を示しています。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 mb-12 text-center">
  <p className="text-lg leading-relaxed relative z-30 text-white">
    日本も例外ではありません。デジタル広告業界の最大手、サイバーエージェントが自社開発のAIシステムを導入し、驚くべき結果を生み出しました。なんと、30名以上いた広告ディレクターの仕事を、AIが完全に代替したのです。
  </p>
  <p className="text-lg leading-relaxed relative z-30 text-white">
    この事例は、AIが創造的な職種さえも変革する可能性を示しています。ライティング、編集、リサーチといった知的労働の分野でさえ、AIによる代替が既に始まっています。
  </p>
</div>

        <Card className="relative bg-white border-none shadow-xl">
          <CardContent className="relative z-30 p-6 text-center">
          <h3 className="relative z-30 text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  AI時代を生き抜くために
</h3>
            <p className="relative z-30 text-lg leading-relaxed text-gray-900">
              この変革の波に乗り遅れないためには、今こそ自己革新の時です。AIと共存し、それを活用できるスキルを身につけることが、これからの時代を生き抜く鍵となるでしょう。常に学び続け、適応する姿勢が、私たちの未来を切り開くのです。
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

export default AILaborMarketImpact;