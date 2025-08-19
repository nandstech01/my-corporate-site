'use client'

import TextType from '@/components/common/TextType'

const features = [
	{ 
		title: 'エンティティRAG', 
		desc: '企業固有情報をベクトル化し、AIの誤認識を回避', 
		icon: (
			<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
			</svg>
		)
	},
	{ 
		title: 'チャットボット', 
		desc: 'サイト内ナレッジに即応答、CV導線へ', 
		icon: (
			<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
			</svg>
		)
	},
	{ 
		title: 'レリバンスエンジニアリング', 
		desc: '情報設計と内部リンクでAI/検索の理解を最大化', 
		icon: (
			<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		)
	},
	{ 
		title: 'Fragment ID 自動付与', 
		desc: 'H1・FAQ・セクションに14個IDを生成、AI引用の精度向上', 
		icon: (
			<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
			</svg>
		)
	},
	{ 
		title: '自動ベクトルブログ生成', 
		desc: '毎日、権威性を積み上げる長文生成＋再学習', 
		icon: (
			<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
			</svg>
		)
	},
	{ 
		title: 'Triple RAG＋スケジューラー', 
		desc: '最新×自社×公開コーパスを自動運転', 
		icon: (
			<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		)
	},
]

export default function FeaturesSection() {
	return (
		<section id="features" className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 id="features-title" className="text-3xl lg:text-4xl font-bold text-white mb-4">
						<TextType text="機能一覧" className="text-white" showCursor={false} startOnVisible as="span" />
					</h2>
					<p className="text-gray-300">AIに選ばれるための要素を標準搭載</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{features.map((f) => (
						<div key={f.title} className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center md:text-left">
							<div className="mb-3 flex justify-center md:justify-start" aria-hidden="true">{f.icon}</div>
							<h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
							<p className="text-gray-300 text-sm">{f.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
} 