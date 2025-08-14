'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type ChatBotModalProps = {
	open: boolean
	onClose: () => void
}

export default function ChatBotModal({ open, onClose }: ChatBotModalProps) {
	const backdropRef = useRef<HTMLDivElement | null>(null)
	const contentRef = useRef<HTMLDivElement | null>(null)
	const [isExpanded, setIsExpanded] = useState(false)

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		if (open) document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open, onClose])

	useEffect(() => {
		const el = contentRef.current
		if (!el) return
		const ro = new ResizeObserver(() => {
			const overflow = el.scrollHeight - el.clientHeight > 8
			if (overflow && !isExpanded) setIsExpanded(true)
		})
		ro.observe(el)
		return () => ro.disconnect()
	}, [isExpanded])

	if (!open) return null

	const frameMaxH = isExpanded ? 'max-h-[98vh]' : 'max-h-[85vh]'

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.18 }}
			ref={backdropRef}
			onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-0"
			role="dialog"
			aria-modal="true"
		>
			<motion.div
				initial={{ y: 40, scale: 0.98, opacity: 0 }}
				animate={{ y: 0, scale: 1, opacity: 1 }}
				exit={{ y: 24, scale: 0.98, opacity: 0 }}
				transition={{ type: 'spring', stiffness: 300, damping: 26 }}
				className={`relative w-full max-w-[92vw] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl ${frameMaxH} overflow-hidden mx-0 sm:mx-6 rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-600/20 shadow-[0_30px_100px_rgba(34,211,238,0.25)]`}
			>
				<div className="rounded-2xl bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col max-h-[95vh]">
					{/* ヘッダー */}
					<div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M5 20l3-3h8l3 3V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14z"/></svg>
							<h3 className="text-white font-semibold">AIコンシェルジュ</h3>
						</div>
						<button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-300" aria-label="閉じる">
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
						</button>
					</div>

					{/* メッセージ領域 */}
					<div ref={contentRef} className="px-5 py-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
								<svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M12 20v1m6.364-2.636l-.707-.707M5.636 18.364l-.707-.707"/></svg>
							</div>
							<div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-100">
								<p className="text-sm">AIサイトについてご質問ください。導入の流れ・価格・機能・IT補助金の適合など、すぐにお答えします。</p>
							</div>
						</div>

						{/* タイピングインジケータ */}
						<div className="flex items-center gap-2 text-cyan-300/80 text-xs pl-11">
							<span className="relative inline-flex gap-1">
								<span className="w-1.5 h-1.5 rounded-full bg-cyan-300/70 animate-bounce [animation-delay:-200ms]"></span>
								<span className="w-1.5 h-1.5 rounded-full bg-cyan-300/70 animate-bounce [animation-delay:-100ms]"></span>
								<span className="w-1.5 h-1.5 rounded-full bg-cyan-300/70 animate-bounce"></span>
							</span>
							<span>入力中...</span>
						</div>
					</div>

					{/* 入力欄 */}
					<div className="px-5 pb-5">
						<div className="relative rounded-xl overflow-hidden p-[1px] bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-600/20">
							<div className="flex items-center gap-2 rounded-[11px] bg-slate-900/80 border border-white/10 px-3 py-2">
								<input className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-400 text-sm" placeholder="質問を入力...(例: 価格や導入の流れ)" onFocus={() => setIsExpanded(true)} onKeyDown={(e) => { if (e.key === 'Enter') setIsExpanded(true) }} />
								<button onClick={() => setIsExpanded(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-colors">
									送信
									<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
								</button>
							</div>
						</div>
					</div>
					<div className="px-5 pb-4 text-xs text-slate-400">※ 実際の対話はデモ用です。詳細は「無料相談申込み」からご連絡ください。</div>
				</div>
			</motion.div>
		</motion.div>
	)
} 