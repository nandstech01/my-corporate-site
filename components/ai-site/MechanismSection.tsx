'use client'

import TextType from '@/components/common/TextType'

export default function MechanismSection() {
	return (
		<section id="mechanism" className="py-20 bg-gradient-to-br from-gray-900 to-slate-800 relative overflow-hidden">
			{/* Fragment ID for AI Citation */}
			<div id="mechanism-title" className="absolute -top-20" aria-hidden="true"></div>
			<div className="container mx-auto px-4">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 text-center">
						<span className="md:hidden block">
							<TextType text="Triple RAGで" className="text-white" showCursor={false} startOnVisible as="span" />
							<br />
							<TextType text="'選ばれる理由'をつくる" className="text-white" showCursor={false} startOnVisible as="span" initialDelay={400} />
						</span>
						<span className="hidden md:block">
							<TextType text="Triple RAGで'選ばれる理由'をつくる" className="text-white" showCursor={false} startOnVisible as="span" />
						</span>
					</h2>
					<p className="text-lg text-gray-300 leading-relaxed mb-8">
						自社RAG × 最新トレンドRAG × 公開記事RAG の循環で、常に最新で一貫した専門性を形成。
						生成された記事は自動で構造化データ化され、AIに参照されやすい形で蓄積されます。
					</p>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<h3 className="text-xl font-bold text-cyan-300 mb-2">エンティティRAG</h3>
							<p className="text-gray-300 text-sm">企業固有名詞・製品・一次データをベクトル化し、誤認識を回避</p>
						</div>
						<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<h3 className="text-xl font-bold text-cyan-300 mb-2">最新トレンドRAG</h3>
							<p className="text-gray-300 text-sm">外部ニュース統合で最新性と話題の整合性を担保</p>
						</div>
						<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<h3 className="text-xl font-bold text-cyan-300 mb-2">公開記事RAG</h3>
							<p className="text-gray-300 text-sm">公開記事を再学習して自己成長サイクルを構築</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
} 