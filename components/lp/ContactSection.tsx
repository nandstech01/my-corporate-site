'use client'

"use client";

import { motion } from 'framer-motion'
import TextType from '../common/TextType'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

export default function ContactSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    employees: '',
    message: ''
  })

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // フォーム送信処理をここに実装
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" aria-label="contact-section" data-section="keita-nands-program" ref={ref} className="py-20 bg-gradient-to-br from-cyan-900 via-slate-900 to-black relative overflow-hidden">
      {/* 動的背景 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-cyan-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-semibold mb-4">
                keita×NANDS 特別プログラム申込受付中
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-snug">
              <TextType
                text="実証済み技術力 × keita"
                className="text-white"
                typingSpeed={70}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={0}
                as="span"
              />
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                <TextType
                  text="企業変革を体験しませんか？"
                  className=""
                  typingSpeed={70}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={300}
                  as="span"
                />
              </span>
            </h2>
            <div className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {/* PC版 */}
              <div className="hidden lg:block">
                <p className="mb-3">
                  AI引用率最大400%向上を実現したNANDSの技術力と、<br />
                  Instagram 10万・TikTok 54.6Kのインフルエンサーkeitaの<br />
                  SNSスキルを融合
                </p>
                <p>
                  助成金活用で最大<span className="text-amber-400 font-semibold">75%還付対象</span>の革新的プログラム。
                </p>
              </div>
              
              {/* スマホ版 */}
              <div className="lg:hidden text-center">
                <p className="mb-3">
                  AI引用率最大400%向上を実現した<br />
                  NANDSの技術力と、<br />
                  Instagram 10万・TikTok 54.6Kの<br />
                  インフルエンサーkeitaの<br />
                  SNSスキルを融合
                </p>
                <p>
                  助成金活用で最大<br />
                  <span className="text-amber-400 font-semibold">75%還付対象</span>の<br />
                  革新的プログラム。
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* フォーム */}
            <motion.div variants={itemVariants}>
              <div className="bg-white/10 backdrop-blur-md p-8 lg:p-10 rounded-2xl border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-3">
                        お名前 <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                        placeholder="山田太郎"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-white mb-3">
                        会社名 <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                        placeholder="株式会社○○"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      メールアドレス <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                      placeholder="example@company.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      従業員数
                    </label>
                    <select 
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                    >
                      <option value="" className="text-gray-800">選択してください</option>
                      <option value="1-10" className="text-gray-800">1-10名</option>
                      <option value="11-50" className="text-gray-800">11-50名</option>
                      <option value="51-100" className="text-gray-800">51-100名</option>
                      <option value="101-300" className="text-gray-800">101-300名</option>
                      <option value="301+" className="text-gray-800">301名以上</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      ご相談内容
                    </label>
                    <textarea 
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 resize-none"
                      placeholder="AI研修の詳細、助成金申請について、ROI試算など、お気軽にご相談ください"
                    ></textarea>
                  </div>
                  
                  <div className="text-center pt-4">
                    <button 
                      type="submit"
                      className="group relative w-full lg:w-auto px-10 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold text-lg rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        無料相談を申し込む
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    <p className="text-sm text-gray-400 mt-4">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>24時間以内にご返信 • <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>情報は厳重に保護
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* サポート内容 */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">
                  <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="hidden lg:inline">keita×NANDS 特別プログラムの特徴</span>
                  <span className="lg:hidden inline-block align-middle">
                    <span className="block">keita×NANDS</span>
                    <span className="block">特別プログラムの特徴</span>
                  </span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">実証済み技術力 × keitaから直接指導</h4>
                      <p className="text-gray-400 text-sm">Instagram 10万・TikTok 54.6Kの実績あるインフルエンサー思考を習得</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">日本未上陸AIモード対策</h4>
                      <p className="text-gray-400 text-sm">Mike King理論準拠のレリバンスエンジニアリング完全実装</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">最大400%AI引用率向上の実証済み技術</h4>
                      <p className="text-gray-400 text-sm">ベクトル検索・トリプルRAGシステムによる圧倒的性能</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">
                  <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>お急ぎの方はお電話で
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400 mb-2">
                    0120-407-638
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    平日 9:00〜18:00（土日祝除く）
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="text-lg font-bold text-white">400%</div>
                      <div className="text-xs text-gray-400">AI引用精度向上</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="text-lg font-bold text-white">20万</div>
                      <div className="text-xs text-gray-400">keitaフォロワー</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 