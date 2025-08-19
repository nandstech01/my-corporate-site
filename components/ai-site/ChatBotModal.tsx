'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import TextType from '../common/TextType'

type Message = {
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
	isTyping?: boolean
}

type ChatBotModalProps = {
	open: boolean
	onClose: () => void
}

export default function ChatBotModal({ open, onClose }: ChatBotModalProps) {
	const backdropRef = useRef<HTMLDivElement | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [showInitialOptions, setShowInitialOptions] = useState(true)
	const [hasStarted, setHasStarted] = useState(false)
	const [thinkingDots, setThinkingDots] = useState('')

	// thinking dots アニメーション
	useEffect(() => {
		if (!isLoading) return
		
		const interval = setInterval(() => {
			setThinkingDots(prev => {
				if (prev.length >= 5) return '.'
				return prev + '.'
			})
		}, 300)
		
		return () => clearInterval(interval)
	}, [isLoading])

	// 初期メッセージの追加
	useEffect(() => {
		if (open && !hasStarted) {
			setHasStarted(true)
			setMessages([])
			setShowInitialOptions(true)
			setThinkingDots('')
		}
	}, [open, hasStarted])

	// Escapeキーで閉じる
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		if (open) document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open, onClose])

	// モーダルを閉じるときのリセット
	const handleClose = () => {
		setMessages([])
		setShowInitialOptions(true)
		setHasStarted(false)
		setIsLoading(false)
		setThinkingDots('')
		onClose()
	}

	// OpenAI APIを呼び出す関数
	const callOpenAI = async (userMessage: string) => {
		setIsLoading(true)
		setThinkingDots('.')
		
		try {
			const response = await fetch('/api/chatbot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: userMessage,
					context: 'ai-site'
				}),
			})

			if (!response.ok) {
				throw new Error('API request failed')
			}

			const data = await response.json()
			
			// AIの回答を追加（タイピング効果付き）
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: data.message,
				timestamp: new Date(),
				isTyping: true
			}])
		} catch (error) {
			console.error('Error calling OpenAI:', error)
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: '申し訳ございません。現在システムに問題が発生しています。お急ぎの場合は直接お問い合わせください。',
				timestamp: new Date(),
				isTyping: true
			}])
		} finally {
			setIsLoading(false)
			setThinkingDots('')
		}
	}

	// 選択肢ボタンがクリックされたときの処理
	const handleOptionClick = (option: string) => {
		setShowInitialOptions(false)
		
		// ユーザーメッセージを追加
		const userMessage: Message = {
			role: 'user',
			content: option,
			timestamp: new Date()
		}
		setMessages(prev => [...prev, userMessage])
		
		// OpenAI APIを呼び出し
		callOpenAI(option)
	}

	if (!open) return null

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.18 }}
			ref={backdropRef}
			onClick={(e) => { if (e.target === backdropRef.current) handleClose() }}
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
			role="dialog"
			aria-modal="true"
		>
			<motion.div
				initial={{ y: 40, scale: 0.98, opacity: 0 }}
				animate={{ y: 0, scale: 1, opacity: 1 }}
				exit={{ y: 24, scale: 0.98, opacity: 0 }}
				transition={{ type: 'spring', stiffness: 300, damping: 26 }}
				className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-600/20 shadow-[0_30px_100px_rgba(34,211,238,0.25)]"
			>
				<div className="rounded-2xl bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col h-full">
					{/* ヘッダー */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.35)] relative">
								{/* 量子的な粒子エフェクト */}
								<div className="absolute inset-0 rounded-full">
									<div className="absolute top-1 left-1 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-60"></div>
									<div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse opacity-80 animation-delay-300"></div>
									<div className="absolute top-2 right-2 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse opacity-70 animation-delay-600"></div>
								</div>
								<svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M5 20l3-3h8l3 3V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14z"/>
								</svg>
							</div>
							<div>
								<h3 className="text-white font-semibold text-lg">AIコンシェルジュ</h3>
								<div className="text-xs text-cyan-400/70">Quantum AI Assistant</div>
							</div>
						</div>
						<button 
							onClick={handleClose} 
							className="p-2 rounded-lg hover:bg-white/5 text-slate-300 transition-colors" 
							aria-label="閉じる"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/>
							</svg>
						</button>
					</div>

					{/* メッセージ領域 */}
					<div className="flex-1 overflow-y-auto p-6 space-y-4">
						{/* 初期メッセージ */}
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.35)] relative">
								{/* 量子的な軌道エフェクト */}
								<div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-spin" style={{ animationDuration: '8s' }}></div>
								<div className="absolute inset-1 rounded-full border border-purple-300/20 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
								<svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M12 20v1m6.364-2.636l-.707-.707M5.636 18.364l-.707-.707"/>
								</svg>
							</div>
							<div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-100 max-w-md">
								{hasStarted && (
									<TextType
										text="AIサイトについてご質問ありますか？"
										className="text-sm"
										typingSpeed={50}
										startOnVisible
										showCursor={false}
									/>
								)}
							</div>
						</div>

						{/* 初期選択肢 */}
						{showInitialOptions && hasStarted && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 2.5, duration: 0.5 }}
								className="flex flex-col gap-3 ml-11"
							>
								<button
									onClick={() => handleOptionClick('AIサイトとは何ですか？')}
									className="text-left p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl text-white hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-200 group relative overflow-hidden"
								>
									{/* 量子的な背景エフェクト */}
									<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<div className="relative">
										<div className="font-medium">AIサイトとは？</div>
										<div className="text-sm text-gray-300 mt-1">AIサイトの概念と特徴について</div>
									</div>
								</button>
								<button
									onClick={() => handleOptionClick('IT補助金について教えてください')}
									className="text-left p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl text-white hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-400/40 transition-all duration-200 group relative overflow-hidden"
								>
									{/* 量子的な背景エフェクト */}
									<div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<div className="relative">
										<div className="font-medium">IT補助金について</div>
										<div className="text-sm text-gray-300 mt-1">補助金の適用条件と申請方法</div>
									</div>
								</button>
							</motion.div>
						)}

						{/* 会話履歴 */}
						{messages.map((message, index) => (
							<div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
								{message.role === 'assistant' && (
									<div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.35)] relative">
										{/* 量子的な軌道エフェクト */}
										<div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-spin" style={{ animationDuration: '8s' }}></div>
										<div className="absolute inset-1 rounded-full border border-purple-300/20 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
										<svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M12 20v1m6.364-2.636l-.707-.707M5.636 18.364l-.707-.707"/>
										</svg>
									</div>
								)}
								{message.role === 'user' && (
									<div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
										<svg className="w-4 h-4 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
											<circle cx="12" cy="7" r="4"/>
										</svg>
									</div>
								)}
								<div className={`rounded-2xl px-4 py-3 max-w-md text-sm ${
									message.role === 'user' 
										? 'bg-blue-500/20 border border-blue-400/30 text-blue-100' 
										: 'bg-white/5 border border-white/10 text-slate-100'
								}`}>
									{message.role === 'assistant' && message.isTyping ? (
										<TextType
											text={message.content}
											className="text-sm"
											typingSpeed={30}
											startOnVisible
											showCursor={false}
										/>
									) : (
										message.content
									)}
								</div>
							</div>
						))}

						{/* Thinking ローディング */}
						{isLoading && (
							<div className="flex items-start gap-3">
								<div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.35)] relative">
									{/* 量子的な思考エフェクト */}
									<div className="absolute inset-0 rounded-full border border-cyan-300/30 animate-pulse"></div>
									<div className="absolute inset-1 rounded-full border border-purple-300/30 animate-pulse animation-delay-300"></div>
									<div className="absolute inset-2 rounded-full border border-blue-300/30 animate-pulse animation-delay-600"></div>
									<svg className="w-4 h-4 text-cyan-300 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M12 20v1m6.364-2.636l-.707-.707M5.636 18.364l-.707-.707"/>
									</svg>
								</div>
								<div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-100 relative overflow-hidden">
									{/* 量子的な背景エフェクト */}
									<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5 animate-pulse"></div>
									<div className="relative flex items-center gap-2">
										<span className="text-sm text-cyan-300/80 font-mono">
											thinking{thinkingDots}
										</span>
										{/* 量子的な粒子 */}
										<div className="flex gap-1">
											<div className="w-1 h-1 bg-cyan-300/60 rounded-full animate-bounce animation-delay-0"></div>
											<div className="w-1 h-1 bg-purple-300/60 rounded-full animate-bounce animation-delay-200"></div>
											<div className="w-1 h-1 bg-blue-300/60 rounded-full animate-bounce animation-delay-400"></div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* フッター */}
					<div className="px-6 py-4 border-t border-white/10">
						<div className="text-xs text-slate-400 text-center">
							<span className="text-cyan-400/70">Quantum AI</span>による自動回答です。詳細なご相談は
							<button 
								onClick={handleClose}
								className="text-cyan-400 hover:text-cyan-300 underline ml-1"
							>
								お問い合わせフォーム
							</button>
							からどうぞ
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	)
} 