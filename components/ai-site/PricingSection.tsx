'use client'

export default function PricingSection() {
	return (
		<section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">価格・プラン</h2>
					<p className="text-gray-300 mb-10">明瞭価格で意思決定を前に進める</p>
					<div className="grid md:grid-cols-2 gap-6">
						<div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-left">
							<h3 className="text-white font-bold text-xl mb-3">AIサイト 最低限パッケージ</h3>
							<div className="text-cyan-300 text-3xl font-extrabold mb-2">450万円<span className="text-base text-gray-300 font-medium">（税別）</span></div>
							<ul className="text-gray-300 text-sm list-disc pl-5 space-y-1">
								<li>6機能一式・要件定義・初期データ投入・公開まで</li>
								<li>導入目安：6–10週間（要件次第）</li>
							</ul>
						</div>
						<div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-left">
							<h3 className="text-white font-bold text-xl mb-3">月額運用</h3>
							<div className="text-cyan-300 text-3xl font-extrabold mb-2">10–15万円</div>
							<p className="text-gray-300 text-sm">監視・軽微改修・最適化。AI検索仕様変更の調整を継続対応。</p>
						</div>
					</div>
					<div className="mt-6 text-gray-400 text-sm">※ 価格は要件・分野により変動する場合があります</div>
				</div>
			</div>
		</section>
	)
} 