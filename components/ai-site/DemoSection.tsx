'use client'

import TextType from '@/components/common/TextType'

export default function DemoSection() {
	return (
		<section className="py-20 bg-gradient-to-br from-gray-900 to-slate-800">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
						<span className="sm:hidden">
							<TextType 
								text="SNS・ブログ全てを" 
								className="text-white" 
								showCursor={false} 
								startOnVisible 
								as="span"
							/>
							<br />
							<span>
								<span className="text-cyan-400">AIサイト</span>
								<TextType 
									text="の資産にする" 
									className="text-white" 
									showCursor={false} 
									startOnVisible 
									as="span"
									delay={1500}
								/>
							</span>
						</span>
						<span className="hidden sm:inline">
							<TextType 
								text="SNS・ブログ全てを" 
								className="text-white" 
								showCursor={false} 
								startOnVisible 
								as="span"
							/>
							<span>
								<span className="text-cyan-400">AIサイト</span>
								<TextType 
									text="の資産にする" 
									className="text-white" 
									showCursor={false} 
									startOnVisible 
									as="span"
									delay={1500}
								/>
							</span>
						</span>
					</h2>
					<p className="text-xl text-gray-300 mb-4">
						<span className="sm:hidden">既存のコンテンツを<br />高度な技術で統合・最適化</span>
						<span className="hidden sm:inline">既存のコンテンツを高度な技術で統合・最適化</span>
					</p>
					<p className="text-gray-400 mb-12 max-w-4xl mx-auto">
						SNSやブログで発信している情報を、AI検索エンジンが理解しやすい形に自動変換。
						散らばったコンテンツを一元化し、AIに「選ばれる」企業サイトへと進化させます。
					</p>

					{/* 統合プロセス */}
					<div className="grid md:grid-cols-3 gap-8 mb-16">
						<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<div className="mb-4">
								<svg className="w-12 h-12 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
								</svg>
							</div>
							<h3 className="text-white font-bold text-lg mb-3">コンテンツ収集</h3>
							<p className="text-gray-300 text-sm">
								SNS投稿、ブログ記事、動画コンテンツなど、あらゆる情報を自動収集・分析
							</p>
						</div>

						<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<div className="mb-4">
								<svg className="w-12 h-12 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
									<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<h3 className="text-white font-bold text-lg mb-3">高度な最適化</h3>
							<p className="text-gray-300 text-sm">
								独自の技術により、AIが理解しやすい構造に自動変換・統合処理
							</p>
						</div>

						<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<div className="mb-4">
								<svg className="w-12 h-12 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
								</svg>
							</div>
							<h3 className="text-white font-bold text-lg mb-3">AI引用最大化</h3>
							<p className="text-gray-300 text-sm">
								ChatGPT、Perplexity等のAI検索で優先的に引用される企業サイトに進化
							</p>
						</div>
					</div>

					{/* 成果イメージ */}
					<div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-400/20 p-8">
						<h3 className="text-2xl font-bold text-white mb-6">
							実現される未来
						</h3>
						<div className="grid md:grid-cols-2 gap-8 text-left">
							<div>
								<h4 className="text-cyan-400 font-semibold mb-3 flex items-center">
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									統一されたブランドメッセージ
								</h4>
								<p className="text-gray-300 text-sm mb-4">
									SNSやブログで発信していた情報が一つのサイトに統合され、一貫したブランドストーリーを構築
								</p>
								<h4 className="text-cyan-400 font-semibold mb-3 flex items-center">
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									コンテンツ資産の最大活用
								</h4>
								<p className="text-gray-300 text-sm">
									過去の投稿や記事が無駄にならず、AI検索時代に対応した貴重な資産として活用
								</p>
							</div>
							<div>
								<h4 className="text-cyan-400 font-semibold mb-3 flex items-center">
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									AI検索での圧倒的優位性
								</h4>
								<p className="text-gray-300 text-sm mb-4">
									豊富なコンテンツ資産により、AI検索エンジンから「信頼できる情報源」として認識
								</p>
								<h4 className="text-cyan-400 font-semibold mb-3 flex items-center">
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									競合との明確な差別化
								</h4>
								<p className="text-gray-300 text-sm">
									独自技術による高度な統合で、他社では実現困難な先進的な企業サイトを構築
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
} 