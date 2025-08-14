'use client'

export default function SubsidySection() {
	return (
		<section id="subsidy" className="py-20 bg-gradient-to-br from-gray-900 to-slate-800">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">IT補助金</h2>
					<p className="text-gray-300 mb-6">補助率の目安：最大 2/3（類型・採択に依存）／活用例：450万円 → 実質負担 約150万円（採択時）</p>
					<button className="px-8 py-4 rounded-xl bg-white/10 text-white font-semibold ring-1 ring-white/20 hover:bg-white/15">補助金の要件を確認する</button>
				</div>
			</div>
		</section>
	)
} 