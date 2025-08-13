'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TextType from '../common/TextType'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const LightRays = dynamic(() => import('./LightRays'), { ssr: false })

export default function ProblemsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const challenges = [
    {
      id: 0,
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: (
        <>
          日本未上陸<span className="text-red-500">AIモード</span>対策の遅れ
        </>
      ),
      text: "GoogleのAIモード、ChatGPT Search等の新検索に対応できず、競合他社に検索流入で大差をつけられてしまう",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 1,
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: (
        <>
          <span className="text-red-500">本物インフルエンサー</span>思考を学べない
        </>
      ),
      text: "フォロワー20万級のインフルエンサーから直接学べる機会がなく、表面的なSNS運用に留まってしまう",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: (
        <>
          bolt.new・AI駆動開発の<span className="text-red-500">導入困難</span>
        </>
      ),
      text: "AI駆動開発ツールの習得に時間がかかり、開発効率化が進まず競争力が低下してしまう",
      gradient: "from-green-500 to-teal-500"
    }
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
      {/* OGL 背景（シアン基調） */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <LightRays className="w-full h-full" raysOrigin="top-center" raysColor="#00ffff" raysSpeed={1.5} lightSpread={0.8} rayLength={1.2} followMouse={true} mouseInfluence={0.1} noiseAmount={0.1} distortion={0.05} />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-6 py-2 mb-6">
              <span className="text-white font-semibold text-sm">法人AI×SNS人材育成の現実的課題</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-relaxed">
              <TextType
                text="多くの企業が抱える"
                className="text-white"
                typingSpeed={75}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={0}
                as="span"
              />
              <br />
              {/* PC: グラデーションを文字要素自体に適用 */}
              <span className="hidden lg:inline">
                <TextType
                  text="次世代スキル習得の壁"
                  className=""
                  contentClassName="bg-clip-text text-transparent"
                  contentStyle={{
                    backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
                    backgroundSize: '400% 100%'
                  }}
                  typingSpeed={75}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={400}
                  as="span"
                />
              </span>
              {/* モバイル: 白文字 */}
              <span className="lg:hidden">
                <TextType
                  text="次世代スキル習得の壁"
                  className=""
                  contentClassName="text-white"
                  typingSpeed={75}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={400}
                  as="span"
                />
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto text-center leading-relaxed">
              <span className="hidden lg:inline">
                最新AI技術の習得とインフルエンサーレベルのSNS運用は
                <br />
                従来の研修では実現困難です
              </span>
              <span className="lg:hidden">
                最新AI技術の習得と
                <br />
                インフルエンサーレベルのSNS運用は
                <br />
                従来の研修では実現困難です
              </span>
            </p>
          </motion.div>

          {/* 課題カード */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className="group h-full"
              >
                <div className="relative">
                  {/* 比率用スペーサーで正方形を確保 */}
                  <div className="block pb-[100%]"></div>
                  {/* 実体カード */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-black rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-cyan-500/20 flex flex-col justify-between overflow-hidden">
                    {/* グラデーションボーダー */}
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-2xl"></div>
                    </div>

                    <div className="relative z-10">
                      {/* タイトル */}
                      <h3 className="text-lg font-bold text-white mb-4">
                        {challenge.title}
                      </h3>

                      {/* 説明文 */}
                      <p className="text-slate-300 leading-relaxed">
                        {challenge.text}
                      </p>
                      
                      {/* 1枚目カードだけ文章の下に中央揃えでアイコン画像 */}
                      {index === 0 && (
                        <div className="mt-6 flex justify-center">
                          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src="/images/lp/problems/icon-1.png"
                              alt="AIモード対策アイコン"
                              width={160}
                              height={160}
                              className="object-cover opacity-95"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* 2枚目カード：インフルエンサー思考 */}
                      {index === 1 && (
                        <div className="mt-6 flex justify-center">
                          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src="/images/lp/problems/icon-2.png"
                              alt="インフルエンサー思考アイコン"
                              width={160}
                              height={160}
                              className="object-cover opacity-95"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* 3枚目カード：AI駆動開発 */}
                      {index === 2 && (
                        <div className="mt-6 flex justify-center">
                          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src="/images/lp/problems/icon-3.png"
                              alt="AI駆動開発アイコン"
                              width={160}
                              height={160}
                              className="object-cover opacity-95"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 何ができる？セクション */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20"
          >
            {/* セクションタイトル */}
            <div className="text-center mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-8">
                <TextType
                  text="何ができる？"
                  className="text-white"
                  typingSpeed={75}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={0}
                  as="span"
                />
              </h3>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                <span className="hidden lg:inline">
                  <span className="font-bold text-cyan-300">keita×NANDS 3コースパッケージ</span>で実現できる圧倒的な成果
                </span>
                <span className="lg:hidden">
                  <span className="font-bold text-cyan-300">keita×NANDS 3コースパッケージ</span>で
                  <br />
                  実現できる圧倒的な成果
                </span>
              </p>
            </div>

            {/* 3つの価値提案カード */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* カード1: AI引用で24時間営業マン */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-black rounded-3xl p-8 border border-blue-500/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  {/* カード上部のアイコンエリア */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                      <Image
                        src="/images/lp/courses/course-1.png"
                        alt="AIモード対策コースアイコン"
                        width={96}
                        height={96}
                        className="object-cover opacity-95"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* タイトル */}
                  <h4 className="text-2xl font-bold text-white mb-4 text-center">
                    <span className="text-cyan-300">AIに引用されれば</span><br />
                    <span className="text-blue-300">24時間365日の営業マン</span>
                  </h4>
                  
                  {/* 説明文 */}
                  <p className="text-slate-200 leading-relaxed mb-6 text-sm text-center">
                    <span className="text-cyan-200">GoogleのAIモード、ChatGPT Search、Claude、Perplexity</span>など主要AI検索で引用されることで、<span className="text-blue-200 font-medium">睡眠中でも自動で見込み客を獲得</span>
                  </p>
                  
                  {/* 効果指標 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-blue-400/40">
                    <div className="flex items-center gap-2 text-blue-300 font-bold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      自動集客率 300% UP
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* カード2: SNS自動化でバズコンテンツ */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-black rounded-3xl p-8 border border-purple-500/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  {/* カード上部のアイコンエリア */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                      <Image
                        src="/images/lp/courses/course-2.png"
                        alt="SNS自動化コースアイコン"
                        width={96}
                        height={96}
                        className="object-cover opacity-95"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* タイトル */}
                  <h4 className="text-2xl font-bold text-white mb-4 text-center">
                    <span className="text-cyan-300">SNS自動化で</span><br />
                    <span className="text-purple-300">バズコンテンツが自動配信</span>
                  </h4>
                  
                  {/* 説明文 */}
                  <p className="text-slate-200 leading-relaxed mb-6 text-sm text-center">
                    <span className="text-cyan-200">Instagram、YouTube、TikTok、X</span>で<span className="text-purple-200 font-medium">20万フォロワー級のバズコンテンツ</span>を自動生成・配信。<span className="text-blue-200">手動投稿は過去のもの</span>
                  </p>
                  
                  {/* 効果指標 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-purple-400/40">
                    <div className="flex items-center gap-2 text-purple-300 font-bold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      エンゲージメント 500% UP
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* カード3: AI駆動開発で差別化 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-black rounded-3xl p-8 border border-emerald-500/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  {/* カード上部のアイコンエリア */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                      <Image
                        src="/images/lp/courses/course-3.png"
                        alt="AI駆動開発コースアイコン"
                        width={96}
                        height={96}
                        className="object-cover opacity-95"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* タイトル */}
                  <h4 className="text-2xl font-bold text-white mb-4 text-center">
                    <span className="text-cyan-300">AI駆動開発で</span><br />
                    <span className="text-emerald-300">同業他社と差別化</span>
                  </h4>
                  
                  {/* 説明文 */}
                  <p className="text-slate-200 leading-relaxed mb-6 text-sm text-center">
                    <span className="text-cyan-200">cursor、bolt.new、VERCEL、NEXT.JS</span>を駆使した<span className="text-emerald-200 font-medium">最先端AI駆動開発</span>で、<span className="text-blue-200">競合が追いつけない圧倒的な開発スピード</span>を実現
                  </p>
                  
                  {/* 効果指標 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-emerald-400/40">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      開発効率 1000% UP
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 総合効果 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="mt-16 text-center"
            >
              <div className="relative group rounded-[28px] p-[2px] bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-cyan-400/30 hover:from-cyan-400/60 hover:via-blue-400/60 hover:to-cyan-400/60 transition-all duration-500">
                <div className="relative rounded-[26px] p-10 text-white overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-black border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                  {/* 立体感と光の表現 */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10"></div>
                  <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <div className="pointer-events-none absolute -top-16 -left-12 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl"></div>
                  <div className="pointer-events-none absolute -bottom-20 -right-12 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <h4 className="text-2xl lg:text-3xl font-extrabold mb-6 tracking-wide">
                      <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.35)]">圧倒的な競争優位性</span>
                    </h4>

                    {/* PC版 */}
                    <div className="hidden lg:block">
                      <p className="text-xl text-slate-100/95 max-w-4xl mx-auto">
                        日本初実装のAI技術 × 総フォロワー20万のインフルエンサー思考で、<br />
                        <span className="font-bold text-cyan-200">同業他社が追いつけない圧倒的なポジション</span>を確立
                      </p>
                    </div>

                    {/* スマホ版 */}
                    <div className="lg:hidden text-center">
                      <p className="text-lg text-slate-100/95 leading-relaxed">
                        日本初実装のAI技術<br />
                        <span className="text-2xl font-bold text-cyan-200">×</span><br />
                        総フォロワー20万の<br />
                        インフルエンサー思考で、
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-lg text-slate-100/95 leading-relaxed">
                          <span className="font-bold text-cyan-200">同業他社が追いつけない</span><br />
                          <span className="font-bold text-cyan-200">圧倒的なポジション</span>を確立
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 