'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TextType from '@/components/common/TextType'

const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { ssr: false })

export default function AIHeroSection() {
	const [isVisible, setIsVisible] = useState(false)
	useEffect(()=>{ setIsVisible(true)},[])

	const scrollToId = (id: string) => {
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
			<div className="absolute inset-0 z-0">
				<Galaxy mouseRepulsion mouseInteraction density={1.0} glowIntensity={0.3} saturation={0.0} hueShift={190} twinkleIntensity={0.2} rotationSpeed={0.03} transparent loading="lazy" />
			</div>
			<div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>

			<div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 lg:px-8 py-16">
				<div className="text-center max-w-5xl">
					<div className="mb-6">
						<span className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm lg:text-base text-white font-medium">
							AIサイト — 自立して育つ、24時間365日 無人営業マン
						</span>
					</div>
					<h1 className="mb-4 lg:mb-6 leading-tight">
						<span 
							className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-4xl lg:text-7xl"
							style={{
								backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
								backgroundSize: '400% 100%'
							}}
						>
							AIに“引用される”サイト
						</span>
					</h1>
					<p className="text-slate-200 text-lg lg:text-xl mb-8">
						<TextType
							text="Triple RAG × 自動ベクトルブログ × 構造化データ。AIに引用され続ける設計を標準搭載。"
							className="text-slate-200"
							showCursor={false}
							startOnVisible
							as="span"
						/>
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<button onClick={()=>scrollToId('contact')} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-1 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300">
							<span className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-lg px-8 py-4 text-white font-semibold inline-flex items-center gap-2">
								30分デモを見る
								<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
							</span>
						</button>
						<button onClick={()=>scrollToId('subsidy')} className="px-8 py-4 rounded-xl bg-white/10 text-white font-semibold ring-1 ring-white/20 hover:bg-white/15">
							IT補助金で導入相談
						</button>
					</div>
				</div>
			</div>
		</section>
	)
} 