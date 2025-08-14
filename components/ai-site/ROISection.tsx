'use client'

export default function ROISection() {
	return (
		<section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">ROIミニ計算</h2>
					<p className="text-gray-300 mb-6">月間AI経由クリック × 想定CVR × LTV ＝ 月間見込売上（目安）</p>
					<div className="grid md:grid-cols-3 gap-4 text-left">
						<input placeholder="月間クリック" className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" />
						<input placeholder="CVR(%)" className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" />
						<input placeholder="LTV(円)" className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" />
					</div>
					<div className="mt-4 text-gray-400 text-sm">※ 算定は目安です／実績を保証するものではありません</div>
				</div>
			</div>
		</section>
	)
} 