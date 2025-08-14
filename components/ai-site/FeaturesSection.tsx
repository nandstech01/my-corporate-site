'use client'

import TextType from '@/components/common/TextType'

const features = [
	{ title: 'エンティティRAG', desc: '企業固有情報をベクトル化し、AIの誤認識を回避', icon: '🔗' },
	{ title: 'チャットボット', desc: 'サイト内ナレッジに即応答、CV導線へ', icon: '💬' },
	{ title: 'レリバンスエンジニアリング', desc: '情報設計と内部リンクでAI/検索の理解を最大化', icon: '🧭' },
	{ title: '構造化データ 自動生成', desc: 'JSON-LDを自動付与し、AIに読める証拠を添付', icon: '🧱' },
	{ title: '自動ベクトルブログ生成', desc: '毎日、権威性を積み上げる長文生成＋再学習', icon: '📝' },
	{ title: 'Triple RAG＋スケジューラー', desc: '最新×自社×公開コーパスを自動運転', icon: '🕒' },
]

export default function FeaturesSection() {
	return (
		<section id="features" className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
						<TextType text="機能一覧" className="text-white" showCursor={false} startOnVisible as="span" />
					</h2>
					<p className="text-gray-300">AIに選ばれるための要素を標準搭載</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{features.map((f) => (
						<div key={f.title} className="bg-white/5 rounded-2xl border border-white/10 p-6">
							<div className="text-3xl mb-3" aria-hidden>{f.icon}</div>
							<h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
							<p className="text-gray-300 text-sm">{f.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
} 