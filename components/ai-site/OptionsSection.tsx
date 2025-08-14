'use client'

function IconWrap({ children }: { children: React.ReactNode }) {
	return (
		<div className="w-12 h-12 aspect-square rounded-none bg-white/10 ring-1 ring-cyan-300/30 flex items-center justify-center text-cyan-300">
			{children}
		</div>
	)
}

function IconX() {
	return (
		<svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117z" />
		</svg>
	)
}

function IconInstagram() {
	return (
		<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" shapeRendering="geometricPrecision">
			{/* 中央に14x14の完全な正方形フレーム */}
			<rect x="5" y="5" width="14" height="14" rx="3" />
			<circle cx="12" cy="12" r="4" />
			<circle cx="16" cy="8" r="1.25" fill="currentColor" stroke="none" />
		</svg>
	)
}

function IconFacebook() {
	return (
		<svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
			<path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H8.08v-2.91h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62.72 0 1.64.13 2.06.19v2.26h-1.16c-1.14 0-1.5.71-1.5 1.44v1.74h2.56l-.41 2.91h-2.15V22c4.78-.78 8.5-4.93 8.5-9.94z" />
		</svg>
	)
}

function IconLinkedIn() {
	return (
		<svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	)
}

function IconYouTube() {
	return (
		<svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
			<path d="M23.5 7.5s-.23-1.64-.94-2.36c-.9-.94-1.9-.95-2.36-1C17.5 4 12 4 12 4h0s-5.5 0-8.2.14c-.46.05-1.46.06-2.36 1-.71.72-.94 2.36-.94 2.36S0 9.3 0 11.1v1.8c0 1.8.2 3.6.2 3.6s.23 1.64.94 2.36c.9.94 2.08.91 2.61 1.02C5.5 20 12 20 12 20s5.5 0 8.2-.14c.46-.05 1.46-.06 2.36-1 .71-.72.94-2.36.94-2.36s.2-1.8.2-3.6v-1.8c0-1.8-.2-3.6-.2-3.6zM9.75 14.7V8.9l6.05 2.9-6.05 2.9z" />
		</svg>
	)
}

function IconTikTok() {
	return (
		<svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12.9 2h2.28c.38 2.15 1.73 3.53 3.8 3.66V8c-1.43.14-2.7-.3-3.8-1.05v5.98c0 3.02-2.27 5.25-5.24 5.25-1.07 0-2.05-.3-2.86-.84a5.25 5.25 0 004.02-5.12V5.18h2.8zM9.94 7.81v2.33A5.25 5.25 0 006.96 17a5.23 5.23 0 01-.77-2.74c0-2.9 2.35-5.24 5.25-5.24.18 0 .35.01.52.03-1-.45-1.7-1.25-2.02-1.24z" />
		</svg>
	)
}

export default function OptionsSection() {
	const options = [
		{
			icon: <IconX />,
			title: 'X自動投稿',
			badge: '自動スケジュール',
			features: ['テキスト/画像/動画の自動投稿', '予約投稿・再投稿の自動化', '失敗時の自動リトライ']
		},
		{
			icon: <IconInstagram />,
			title: 'Instagram自動投稿',
			badge: 'プロアカ連携',
			features: ['自動ストーリー投稿', '自動フィード投稿', '自動リール投稿']
		},
		{
			icon: <IconFacebook />,
			title: 'Facebook自動投稿',
			badge: 'ページ運用',
			features: ['ページへの自動投稿', '画像/動画の自動配信', '予約配信・承認フロー連携']
		},
		{
			icon: <IconLinkedIn />,
			title: 'LinkedIn自動配信',
			badge: 'B2B向け',
			features: ['個人/企業ページの自動投稿', '画像/記事リンクの自動配信', '予約投稿・承認フロー連携']
		},
		{
			icon: <IconYouTube />,
			title: 'YouTube自動投稿',
			badge: '動画配信',
			features: ['動画/Shorts自動アップロード', 'サムネ自動設定', '再生リスト自動追加']
		},
		{
			icon: <IconTikTok />,
			title: 'TikTok自動投稿',
			badge: 'ショート動画',
			features: ['下書きアップロード自動化', '審査後の直接公開に対応', '投稿承認フローと連携']
		},
	]
	return (
		<section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">オプション：SNS自動配信</h2>
					<p className="text-slate-300">主要SNSに、わかりやすく安全に。連携〜承認〜自動運用まで一気通貫でサポートします。</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{options.map((o) => (
						<div key={o.title} className="relative bg-white/5 rounded-2xl border border-white/10 p-6 text-left">
							<div className="flex items-center gap-3 mb-3">
								<IconWrap>{o.icon}</IconWrap>
								<h3 className="text-white font-bold text-lg">{o.title}</h3>
							</div>
							<div className="absolute -top-3 right-6"><span className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold">{o.badge}</span></div>
							<ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
								{o.features.map((f) => (
									<li key={f}>{f}</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<p className="text-xs text-slate-400 text-center mt-6">※ 各SNSの仕様や上限は変わることがあります。私たちが最新版を確認しながら安全に実装・運用します。</p>
			</div>
		</section>
	)
} 