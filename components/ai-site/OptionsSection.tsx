'use client'

export default function OptionsSection() {
	const options = [
		{
			title: 'X（旧Twitter）自動投稿',
			desc: 'POST /2/tweets、/2/media/upload（v2の分割アップロード）。スコープ：tweet.write / media.write など。',
			badge: 'OAuth 2.0 PKCE'
		},
		{
			title: 'Instagram 自動投稿（フィード/リール/ストーリーズ）',
			desc: '{ig-user-id}/media → media_publish。media_type=IMAGE/REELS/CAROUSEL/STORIES。権限・審査必須。',
			badge: 'Graph API'
		},
		{
			title: 'LinkedIn 自動配信（個人/企業）',
			desc: 'Posts API /rest/posts。w_member_social / w_organization_social（審査）。',
			badge: 'Posts API'
		},
		{
			title: 'YouTube 自動投稿（動画/Shorts）',
			desc: 'videos.insert（Resumable推奨）、thumbnails.set、playlistItems.insert。日次10,000ユニット。',
			badge: 'YouTube Data API'
		},
		{
			title: 'TikTok 自動投稿（Draft/Direct）',
			desc: 'Content Posting API。video.upload / video.publish。未監査クライアントは公開制限あり。',
			badge: 'Content Posting API'
		},
	]
	return (
		<section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">オプション：SNS自動配信</h2>
					<p className="text-slate-300">X / Instagram / LinkedIn / YouTube / TikTok を公式仕様準拠で実装</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{options.map((o) => (
						<div key={o.title} className="relative bg-white/5 rounded-2xl border border-white/10 p-6 text-left">
							<div className="absolute -top-3 left-6"><span className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold">{o.badge}</span></div>
							<h3 className="text-white font-bold text-lg mb-2">{o.title}</h3>
							<p className="text-gray-300 text-sm leading-relaxed">{o.desc}</p>
						</div>
					))}
				</div>
				<p className="text-xs text-slate-400 text-center mt-6">※ APIのレート・権限・エンドポイントは頻繁に更新されます。実装時は最新の公式ドキュメントをご確認ください。</p>
			</div>
		</section>
	)
} 