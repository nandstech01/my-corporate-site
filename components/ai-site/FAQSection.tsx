'use client'

import React, { useState, useEffect } from 'react'

export default function FAQSection() {
	const [showAllFAQs, setShowAllFAQs] = useState(false)
	const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
	
	// AI引用最適化: Fragment IDアクセス時は該当FAQを自動展開
	useEffect(() => {
		const hash = window.location.hash
		if (hash.startsWith('#faq-')) {
			const faqNumber = parseInt(hash.replace('#faq-', '')) - 1
			if (faqNumber >= 0 && faqNumber < faqs.length) {
				setExpandedFAQ(faqNumber)
				// スムーズスクロール
				setTimeout(() => {
					document.getElementById(hash.substring(1))?.scrollIntoView({ 
						behavior: 'smooth', 
						block: 'center' 
					})
				}, 100)
			}
		}
	}, [])
	const faqs = [
		// AIサイト概念の定義・認識変革
		{ q: 'AIサイトとは何ですか？', a: 'AIサイトとは「AIに引用されるサイト」のことです。従来のWebサイトではなく、ChatGPTやPerplexityなどのAIが情報を引用・参照する際に選ばれるサイトを指します。レリバンスエンジニアリング手法により構築されます。' },
		{ q: 'AIサイトと通常のサイトの違いは？', a: '通常のサイトは人間が読むことを前提としていますが、AIサイトはAIが理解・引用しやすい構造になっています。Fragment ID、構造化データ、Triple RAGによりAI検索エンジンに最適化されています。' },
		{ q: 'AIに引用されるサイトの重要性は？', a: '今後、情報検索の主流がGoogle検索からAI検索に移行します。AIに引用されないサイトは存在しないのと同じになる可能性があります。早期にAI引用最適化することで競合優位性を確保できます。' },
		{ q: 'レリバンスエンジニアリングとは？', a: 'Mike King氏が提唱するAI検索最適化手法です。AIがコンテンツを理解・引用しやすくするための情報設計・構造化技術で、従来のSEOを大きく進化させたものです。' },
		{ q: 'Fragment IDとは何ですか？', a: 'コンテンツの特定部分にIDを付与し、AIが正確に引用できるようにする仕組みです。「#section-1」のような形でページ内の特定箇所を指定でき、AI引用の精度を大幅に向上させます。' },
		
		// 技術・仕組みに関する質問
		{ q: 'Triple RAGシステムとは？', a: '「企業情報」「業界トレンド」「YouTube動画」の3つのデータソースを統合したRAG（Retrieval-Augmented Generation）システムです。多角的な情報でAIの回答精度を向上させます。' },
		{ q: '構造化データの役割は？', a: 'AIが情報を理解しやすくするためのデータ形式です。JSON-LD形式でページの内容、構造、関係性を機械可読化し、AI検索エンジンが正確に情報を解釈・引用できるようにします。' },
		{ q: '自動ベクトルブログとは？', a: 'Triple RAGシステムが自動で生成する最適化済みブログ記事です。SEOとAI引用の両方に最適化され、継続的にサイトの権威性とAI引用確率を向上させます。' },
		{ q: 'Complete URIの仕組みは？', a: 'Fragment IDと組み合わせた完全なURL「https://domain.com/page#fragment」により、AIが特定の情報箇所を正確に引用・リンクできる仕組みです。' },
		{ q: 'ベクトル検索との違いは？', a: '一般的なベクトル検索は類似情報を探すだけですが、当社のシステムはAI引用を前提とした最適化が行われています。Fragment ID、構造化データとの連携により引用精度が向上します。' },
		
		// ビジネス価値・効果に関する質問
		{ q: 'AIに引用されるとどんなメリットがありますか？', a: '①AIからの信頼できる情報源として認識 ②検索結果での露出機会増加 ③ブランド権威性の向上 ④新しい集客チャネルの獲得 ⑤競合他社に対する先行優位性の確保' },
		{ q: 'ROI（投資対効果）はどれくらい？', a: 'AI引用によるブランド認知向上、信頼性向上は長期的な資産価値となります。従来のSEOと比較してAI検索時代への適応により、持続的な競争優位性を獲得できます。' },
		{ q: '導入効果の測定方法は？', a: 'AI引用回数、Fragment ID経由のアクセス、構造化データの認識率、AIでの検索ランキング等で効果測定を行います。専用の分析ダッシュボードで可視化されます。' },
		{ q: '競合他社との差別化要因は？', a: 'AI引用最適化は新しい分野で対応企業が少なく、先行者利益が大きいです。レリバンスエンジニアリング実装により圧倒的な差別化を実現できます。' },
		{ q: '24時間365日無人営業とは？', a: 'AIが自動で企業情報を引用・紹介することで、人的営業なしで見込み客に情報を届けられます。AIが営業マンの役割を果たす新しいマーケティング手法です。' },
		
		// 実装・技術的質問
		{ q: '既存サイトへの実装は可能ですか？', a: 'はい、可能です。WordPress、独自CMS問わず既存サイトにFragment ID、構造化データを追加実装できます。ヘッドレス構成やサブディレクトリ運用も対応可能です。' },
		{ q: '実装期間はどれくらいですか？', a: '基本パッケージで6-10週間程度です。要件定義、設計、実装、テスト、本番リリースまで一貫してサポートします。規模により期間は変動します。' },
		{ q: 'IT補助金は活用できますか？', a: 'はい、IT導入補助金の対象となります。最大3/4の補助率により導入コストを大幅に削減できます。申請サポートも行っています。' },
		{ q: '運用保守は必要ですか？', a: '基本的に自動運転設計ですが、AI検索仕様の変更対応、最適化調整のため月額10-15万円の運用保守をお勧めしています。' },
		{ q: 'セキュリティ対策は？', a: '企業機密情報は適切に保護され、公開すべき情報のみをAI引用対象とします。情報の機密レベル管理、アクセス制御も徹底しています。' },
		
		// 業界・将来性に関する質問
		{ q: 'AI検索の普及はどれくらい進んでいますか？', a: 'ChatGPT、Perplexity、Google AI Overviewsなど急速に普及中です。2025年以降、従来の検索からAI検索への移行が本格化すると予想されます。' },
		{ q: 'どの業界に効果的ですか？', a: '特にBtoB製造業、士業、コンサルティング、IT企業で効果的です。専門知識や技術情報をAIが引用しやすく、権威性向上につながります。' },
		{ q: 'Google検索との関係は？', a: 'Google AI OverviewsやSGE（Search Generative Experience）でもAI引用最適化が重要になります。従来のSEOと相乗効果を発揮します。' },
		{ q: 'ChatGPTやClaude以外のAIにも対応？', a: 'はい、Perplexity、Gemini、Bing Chat等、主要なAI検索エンジンに対応しています。新しいAIサービスにも迅速に対応します。' },
		{ q: '国際的な展開は可能ですか？', a: '多言語対応可能です。英語、中国語等での構造化データ、Fragment ID実装により、グローバルなAI引用最適化を実現できます。' },
		
		// 疑問・懸念事項への回答
		{ q: 'AIに引用されることのリスクはありますか？', a: '適切な実装により情報の誤解釈リスクを最小化できます。Fragment IDにより正確な情報引用が可能で、ブランド価値向上につながります。' },
		{ q: '従来のSEOとの違いは？', a: 'SEOは人間向け検索最適化、AI引用最適化はAI向け最適化です。両方を並行実施することで、現在と未来の両方の検索環境に対応できます。' },
		{ q: '小規模企業でも効果ありますか？', a: 'むしろ小規模企業ほど効果的です。AI引用により大企業と同等の露出機会を得られ、専門性をアピールできる機会が増加します。' },
		{ q: '他社サービスとの違いは？', a: 'レリバンスエンジニアリングの本格実装、Triple RAGシステム、Fragment ID自動付与など、AI引用に特化した包括的なソリューションを提供します。' },
		{ q: '成果が出ない場合はどうなりますか？', a: 'AI検索は新しい分野のため効果測定方法も含めて継続的に最適化します。長期的な取り組みとして段階的な成果向上をサポートします。' }
	]
	return (
		<section id="faq" className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					<h2 id="faq-title" className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">よくある質問</h2>
					
					{/* FAQ説明文 */}
					<div className="text-center mb-6">
						<p className="text-gray-300 text-sm mb-4">
							AIサイト・レリバンスエンジニアリングに関する30の質問と回答を用意しています
						</p>
						<p className="text-gray-400 text-xs">
							質問をクリックすると回答が表示されます
						</p>
					</div>

					{/* FAQ一覧 - Fragment ID維持のため全質問を表示、回答をトグル */}
					<div className="space-y-4">
						{faqs.map((f, index) => (
							<div key={f.q} id={`faq-${index + 1}`} className="bg-white/5 rounded-xl border border-white/10 p-5">
								{/* AI引用用: 質問と回答を機械可読形式で常時提供（視覚的には非表示） */}
								<div className="sr-only" itemScope itemType="https://schema.org/Question">
									<h3 itemProp="name">{f.q}</h3>
									<div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
										<div itemProp="text">{f.a}</div>
									</div>
								</div>
								
								{/* ユーザー向け: インタラクティブ表示 */}
								<button 
									onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
									className="w-full text-left flex justify-between items-center"
								>
									<div className="text-white font-semibold pr-4">{f.q}</div>
									<svg 
										className={`w-5 h-5 text-cyan-300 transition-transform duration-200 flex-shrink-0 ${
											expandedFAQ === index ? 'rotate-180' : ''
										}`} 
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{expandedFAQ === index && (
									<div className="text-gray-300 text-sm mt-3 animate-fade-in">
										{f.a}
									</div>
								)}
							</div>
						))}
					</div>

				</div>
			</div>
		</section>
	)
} 