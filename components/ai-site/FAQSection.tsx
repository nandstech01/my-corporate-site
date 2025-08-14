'use client'

export default function FAQSection() {
	const faqs = [
		{ q: 'AIに引用＝すぐCVに繋がりますか？', a: '引用は認知と信頼の獲得です。一次情報や事例をLPで提示し、クリックしたくなる理由を設計します。' },
		{ q: '完全放置で運用できますか？', a: '年数回の微調整は必要です。日々の生成や構造化は自動運転を想定しています。' },
		{ q: '既存WordPressと共存できますか？', a: 'ヘッドレス・サブディレクトリ等、最適構成をご提案します。' },
	]
	return (
		<section id="faq" className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">よくある質問</h2>
					<div className="space-y-4">
						{faqs.map((f)=> (
							<div key={f.q} className="bg-white/5 rounded-xl border border-white/10 p-5">
								<div className="text-white font-semibold mb-2">{f.q}</div>
								<div className="text-gray-300 text-sm">{f.a}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
} 