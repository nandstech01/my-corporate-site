import Link from 'next/link'

const footerLinks = [
  {
    title: 'サービス',
    links: [
      { label: 'ホームページ制作', href: '#coverage' },
      { label: '業務システム開発', href: '#coverage' },
      { label: 'スマホアプリ開発', href: '#coverage' },
      { label: '無料見積もり', href: '/system-dev-lp/questionnaire' },
    ],
  },
  {
    title: '会社情報',
    links: [
      { label: '会社概要', href: 'https://nands.tech' },
      { label: 'プライバシーポリシー', href: 'https://nands.tech/privacy' },
    ],
  },
  {
    title: 'お問い合わせ',
    links: [
      { label: 'メール: contact@nands.tech', href: 'mailto:contact@nands.tech' },
    ],
  },
]

export default function SDLPFooter() {
  return (
    <footer data-sdlp className="bg-sdlp-footer-bg text-white">
      {/* Brand accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold mb-3">
              <span className="text-sdlp-accent">NANDS</span>{' '}
              <span className="text-white/80 text-sm font-normal">
                AI×システム開発
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              株式会社エヌアンドエス
              <br />
              〒520-0025
              <br />
              滋賀県大津市皇子が丘2丁目10-25
            </p>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white/80 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white/90 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white/90 transition-colors"
                        target={
                          link.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          link.href.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} 株式会社エヌアンドエス All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
