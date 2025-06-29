'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LPFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* 会社情報 */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NANDS
              </Link>
              <p className="text-gray-400 mt-2">株式会社エヌアンドエス</p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              2008年の設立以来、働く人の「次のステージ」をサポートする総合人材支援企業として、
              時代に寄り添ったソリューションを提供しています。
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                滋賀県大津市皇子が丘２丁目10−25−3004号
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                0120-558-551
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                contact@nands.tech
              </div>
            </div>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-lg font-semibold mb-4">サービス</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/reskilling" className="hover:text-white transition-colors">AI研修・リスキリング</Link></li>
              <li><Link href="/system-development" className="hover:text-white transition-colors">システム開発</Link></li>
              <li><Link href="/sns-automation" className="hover:text-white transition-colors">SNS自動化</Link></li>
              <li><Link href="/vector-rag" className="hover:text-white transition-colors">ベクトル検索・RAG</Link></li>
              <li><Link href="/aio-seo" className="hover:text-white transition-colors">AIO対策・SEO</Link></li>
            </ul>
          </div>

          {/* 会社情報 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">会社情報</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">会社概要</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">ブログ</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
            </ul>
          </div>
        </div>

        {/* 実績・認定 */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-6">実績・認定</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-blue-400 mb-1">94%</div>
                <div className="text-xs text-gray-400">コスト削減実績</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-green-400 mb-1">98%</div>
                <div className="text-xs text-gray-400">助成金申請成功率</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-purple-400 mb-1">150%</div>
                <div className="text-xs text-gray-400">給与向上実績</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-orange-400 mb-1">24日</div>
                <div className="text-xs text-gray-400">投資回収期間</div>
              </div>
            </div>
          </div>
        </div>

        {/* 助成金情報 */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-2xl border border-amber-500/20 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-amber-400 font-semibold">人材開発支援助成金対応</span>
            </div>
            <p className="text-sm text-gray-300">
              厚生労働省認定の助成金を活用し、実質25%負担でAI人材を育成。
              <br />
              申請サポートから研修実施まで完全バックアップいたします。
            </p>
          </div>
        </div>

        {/* SNS・コピーライト */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="https://twitter.com/nands_tech" target="_blank" rel="noopener noreferrer" 
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Link>
              <Link href="https://www.linkedin.com/company/nands-tech" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </div>
            
            <div className="text-center lg:text-right">
              <p className="text-sm text-gray-400">
                © 2025 NANDS Inc. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                働く人の次のステージをサポート
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 