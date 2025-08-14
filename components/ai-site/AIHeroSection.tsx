'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChatBotModal from './ChatBotModal'

const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { ssr: false })

export default function AIHeroSection() {
	const [isVisible, setIsVisible] = useState(false)
	const [isChatOpen, setIsChatOpen] = useState(false)
	useEffect(()=>{ setIsVisible(true)},[])

	const scrollToContact = () => {
		const el = document.getElementById('contact')
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
			<div className="absolute inset-0 z-0">
				<Galaxy mouseRepulsion mouseInteraction density={1.0} glowIntensity={0.3} saturation={0.0} hueShift={190} twinkleIntensity={0.2} rotationSpeed={0.03} transparent loading="lazy" />
			</div>
			<div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>

			<div className="relative z-20 flex flex-col items-center justify-start lg:justify-start min-h-screen px-4 lg:px-8 pt-12 pb-10 sm:pb-14 lg:pt-24 lg:pb-12">
				<div className="text-center max-w-5xl">
					<div className="mb-4 lg:mb-6">
						<span className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm lg:text-base text-white font-medium">
							{/* PC: 1行、SP: 2行 */}
							<span className="hidden sm:inline">AIサイト — 自立して育つ 24時間365日 無人営業マン</span>
							<span className="sm:hidden text-center leading-snug">
								AIサイト — 自立して育つ<br />
								24時間365日 無人営業マン
							</span>
						</span>
					</div>
					<h1 className="mb-2 lg:mb-5 leading-tight">
						{/* SPのみ上余白付与 */}
						<span 
							className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-3xl lg:text-7xl whitespace-nowrap mt-2 lg:mt-0 block mb-4 lg:mb-0"
							style={{
								backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
								backgroundSize: '400% 100%'
							}}
						>
							AIに“引用される”サイト
						</span>
					</h1>

					{/* Distinct H2: label + tech badges */}
					<div className="mb-4 lg:mb-4">
						<div className="text-xs sm:text-sm tracking-wider text-slate-300/90 uppercase">AIに引用される構造</div>
						<div className="mt-2 flex flex-wrap items-center justify-center gap-2">
							<span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-semibold">Triple RAG</span>
							<span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-semibold">自動ベクトルブログ</span>
							<span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-semibold">構造化データ</span>
						</div>
					</div>

					{/* ソフト訴求（AIに引用されやすいニュアンス） */}
					<p className="text-slate-200 text-base lg:text-lg italic">
						<span className="hidden sm:inline">AIが“見つけて連れてくる” — <span className="text-cyan-300 not-italic font-semibold">24時間 自走マーケティング</span> ／ <span className="text-cyan-300 not-italic font-semibold">人手は増やさず 成果だけ増やすサイト</span></span>
						<span className="sm:hidden block text-center leading-snug">
							<span>AIが“見つけて連れてくる”</span>
							<br />
							<span className="text-cyan-300 not-italic font-semibold">24時間 自走マーケティング</span>
							<br />
							<span className="text-cyan-300 not-italic font-semibold">人手は増やさず 成果だけ増やすサイト</span>
						</span>
					</p>

					{/* CTA: 無料相談申込み（デザインは相談チャットのまま、スクロール動作に変更） */}
					<div className="mt-14 sm:mt-16 lg:mt-24 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
						<button
							onClick={scrollToContact}
							className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 p-[1px] shadow-[0_18px_50px_rgba(34,211,238,0.28)] hover:shadow-[0_28px_80px_rgba(34,211,238,0.38)] transition-all duration-300 transform hover:scale-[1.02]">
							<span className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-[11px] px-8 py-3 text-white font-semibold inline-flex items-center gap-2">
								<span className="pointer-events-none absolute -inset-3 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),transparent_60%)]" />
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-8 8l3-3h9l3 3V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14z"/></svg>
								無料相談申込み
							</span>
						</button>
					</div>

					{/* Chat inline opener */}
					<div className="mt-20 sm:mt-24 lg:mt-36 flex justify-center px-4">
						<button onClick={() => setIsChatOpen(true)} aria-label="AIチャットを開く" className="group w-full max-w-3xl relative overflow-hidden rounded-full p-[2px] bg-gradient-to-r from-cyan-400 via-sky-500 to-teal-400 shadow-[0_14px_50px_rgba(34,211,238,0.35)] hover:shadow-[0_24px_90px_rgba(34,211,238,0.5)] transition-all">
							{/* 外側ネオンオーラ */}
							<span aria-hidden className="absolute -inset-4 rounded-full bg-cyan-400/25 blur-3xl opacity-50 group-hover:opacity-70 transition" />
							{/* 本体（グラス） */}
							<span className="relative w-full rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(8,15,28,0.5))] backdrop-blur-2xl ring-1 ring-cyan-300/30 px-6 sm:px-8 py-3 sm:py-4 text-cyan-100 text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-3">
								{/* 内側エッジ */}
								<span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.22)]" />
								{/* 左アイコンチップ */}
								<span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-300/15 ring-1 ring-cyan-300/40 shadow-[0_0_0_3px_rgba(34,211,238,0.08)]">
									<svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0114 0"/></svg>
								</span>
								<span className="tracking-wide sm:hidden">質問してみましょう</span>
								<span className="tracking-wide hidden sm:inline">営業マンに質問してみましょう</span>
								<svg className="w-5 h-5 text-cyan-200 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
								{/* シャインエフェクト */}
								<span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
									<span className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 transition-transform duration-700 group-hover:translate-x-[220%]" />
								</span>
							</span>
						</button>
					</div>

					<ChatBotModal open={isChatOpen} onClose={() => setIsChatOpen(false)} />
				</div>
			</div>
		</section>
	)
} 