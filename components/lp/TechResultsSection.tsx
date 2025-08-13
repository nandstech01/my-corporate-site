'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import TextType from '../common/TextType'
import Image from 'next/image'

export default function TechResultsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const results = [
    {
      number: "630%",
      label: "ベクトル検索精度向上",
      description: "トリプルRAGシステムで類似度0.13→0.82の驚異的向上",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-100",
      iconSrc: "/images/lp/results/result-vector-search.png",
      iconAlt: "ベクトル検索精度向上アイコン"
    },
    {
      number: "20万",
      label: "keitaの総フォロワー",
      description: "Instagram 10万 + TikTok 54.6K の実績あるインフルエンサー",
      gradient: "from-cyan-300 to-teal-500",
      bgGradient: "from-cyan-50 to-teal-100",
      iconSrc: "/images/lp/results/result-influencer-follower.png",
      iconAlt: "インフルエンサーフォロワーアイコン"
    },
    {
      number: "100%",
      label: "日本初実装",
      description: "Mike King理論レリバンスエンジニアリング完全実装企業",
      gradient: "from-cyan-500 to-sky-600",
      bgGradient: "from-cyan-50 to-sky-100",
      iconSrc: "/images/lp/results/result-japan-first.png",
      iconAlt: "日本初実装アイコン"
    },
    {
      number: "98%",
      label: "助成金申請成功率",
      description: "人材開発支援助成金最大75%還付の実績あるサポート",
      gradient: "from-cyan-600 to-indigo-600",
      bgGradient: "from-cyan-50 to-indigo-100",
      iconSrc: "/images/lp/results/result-subsidy-success.png",
      iconAlt: "助成金申請成功率アイコン"
    }
  ]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-900 to-slate-800 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
              keita×NANDS 実証済み実績
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-snug text-center"
          >
            {/* PC レイアウト */}
            <div className="hidden lg:block text-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <TextType
                  text="最先端技術力の融合"
                  className=""
                  typingSpeed={70}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={0}
                  as="span"
                />
              </span>
              <br />
              <TextType
                text="× 総フォロワー20万のインフルエンサー"
                className="text-white"
                typingSpeed={70}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={400}
                as="span"
              />
            </div>

            {/* モバイル レイアウト（中央揃えで3行） */}
            <div className="lg:hidden text-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <TextType
                  text="最先端技術力の融合"
                  className=""
                  typingSpeed={70}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={0}
                  as="span"
                />
              </span>
              <div className="my-1">×</div>
              <TextType
                text="総フォロワー20万の"
                className="text-white"
                typingSpeed={70}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={300}
                as="span"
              />
              <br />
              <TextType
                text="インフルエンサー"
                className="text-white"
                typingSpeed={70}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={600}
                as="span"
              />
            </div>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Instagram 10万・TikTok 54.6Kの実績 × ベクトル検索630%向上の技術力。
            <br />
            理論ではなく、実証済みの圧倒的成果をお見せします。
          </motion.p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >
          {results.map((result, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              {/* 背景グロー効果 */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${result.gradient} opacity-25 group-hover:opacity-50 rounded-3xl blur-2xl transition-all duration-700`}></div>

              {/* プレミアムカードコンテナ */}
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-cyan-400/40 via-blue-400/30 to-cyan-500/40 group-hover:from-cyan-400/70 group-hover:via-blue-400/50 group-hover:to-cyan-500/70 transition-all duration-500">
                {/* メインカード */}
                <div className="relative bg-gradient-to-br from-gray-900/95 via-slate-800/95 to-gray-900/95 backdrop-blur-xl p-8 rounded-[22px] border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-500 text-center shadow-2xl">
                  
                  {/* トップグラデーション装飾 */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"></div>
                  
                  {/* アイコン部分 */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-110 transition-all duration-500">
                      {/* アイコン画像 */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                        <Image
                          src={result.iconSrc}
                          alt={result.iconAlt}
                          width={160}
                          height={160}
                          className="w-full h-full object-contain drop-shadow-lg"
                          priority
                        />
                      </div>
                    </div>
                  </div>

                  {/* 数値部分 */}
                  <div className="mb-6">
                    <div className={`text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-br ${result.gradient} bg-clip-text text-transparent drop-shadow-2xl`}>
                      {result.number}
                    </div>
                    <div className="text-xl font-bold text-cyan-100 mb-4 tracking-wide">
                      {result.label}
                    </div>
                  </div>

                  {/* 説明文 */}
                  <p className="text-sm text-cyan-200/90 leading-relaxed px-2 font-medium">
                    <span className="text-cyan-100 font-semibold">{result.description.split('で')[0]}で</span>
                    <span className="text-slate-200">{result.description.split('で').slice(1).join('で')}</span>
                  </p>

                  {/* 底面グラデーション装飾 */}
                  <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>
                  
                  {/* 特別なグロー効果（各カード固有） */}
                  {index === 0 && (
                    <div className="pointer-events-none absolute -inset-4 rounded-[26px] bg-cyan-400/10 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
                  )}
                  {index === 1 && (
                    <div className="pointer-events-none absolute -inset-4 rounded-[26px] bg-teal-400/10 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
                  )}
                  {index === 2 && (
                    <div className="pointer-events-none absolute -inset-4 rounded-[26px] bg-sky-400/10 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
                  )}
                  {index === 3 && (
                    <div className="pointer-events-none absolute -inset-4 rounded-[26px] bg-indigo-400/10 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 技術詳細セクション */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={itemVariants}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-2xl border border-white/10">
            <div className="text-center mb-10">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                技術スタック詳細
              </h3>
              <p className="text-gray-300">実際に使用している最先端技術</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">AI駆動開発</h4>
                    <p className="text-gray-400 text-sm">cursor・bolt.new を使った開発</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">ベクトル検索システム</h4>
                    <p className="text-gray-400 text-sm">Supabase Vector、Pinecone を使用したRAG検索システム</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">フルスタック開発</h4>
                    <p className="text-gray-400 text-sm">Next.js 14、TypeScript、Tailwind CSS による高速開発</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">インフラ・運用</h4>
                    <p className="text-gray-400 text-sm">Vercel、Supabase、CloudFlare による安定稼働環境</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 