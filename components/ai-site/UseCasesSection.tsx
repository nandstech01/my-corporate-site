'use client'

export default function UseCasesSection() {
	return (
		<section className="py-20 bg-gradient-to-br from-gray-900 to-slate-800">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">ユースケース</h2>
					<p className="text-gray-300">業種別の導入イメージ（抜粋）</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					<div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-left">
						<h3 className="text-white font-bold mb-2">製造BtoB</h3>
						<p className="text-gray-300 text-sm">製品仕様・導入事例・技術資料をエンティティ化し、AIに“正しく”理解させる</p>
					</div>
					<div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-left">
						<h3 className="text-white font-bold mb-2">士業</h3>
						<p className="text-gray-300 text-sm">法令・手続・Q&AをRAGで一元化し、問い合わせ前の自己解決率を高める</p>
					</div>
					<div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-left">
						<h3 className="text-white font-bold mb-2">地域サービス</h3>
						<p className="text-gray-300 text-sm">最新トレンドRAGで地域性を反映、検索・AIからの自然導線を増やす</p>
					</div>
				</div>
			</div>
		</section>
	)
} 