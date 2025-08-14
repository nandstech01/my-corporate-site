'use client'

export default function DemoSection() {
	return (
		<section className="py-20 bg-gradient-to-br from-gray-900 to-slate-800">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">デモ</h2>
					<p className="text-gray-300 mb-8">AI回答の引用→クリック→LP導線の体験イメージ（15–30秒）</p>
					<div className="aspect-video w-full rounded-xl border border-white/10 bg-black/30" />
				</div>
			</div>
		</section>
	)
} 