'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function LPHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header className="relative z-50 bg-white border-b border-gray-200/70">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="N&S Logo"
              width={120}
              height={40}
              className="w-auto h-8"
              priority
            />
          </Link>

          {/* デスクトップメニュー */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="#services"
              onClick={(e) => { e.preventDefault(); scrollToId('services') }}
              className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100"
            >
              サービス
            </Link>
            <Link
              href="#results"
              onClick={(e) => { e.preventDefault(); scrollToId('results') }}
              className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100"
            >
              実績
            </Link>
            <Link
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollToId('contact') }}
              className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100"
            >
              お問い合わせ
            </Link>

            {/* パートナーボタン - ミニマル＆プレミアム */}
            <Link 
              href="/partners"
              aria-label="パートナー"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-md hover:shadow-lg ring-1 ring-cyan-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              パートナー
            </Link>
          </nav>

          {/* モバイル版：パートナーボタンとメニューボタン */}
          <div className="md:hidden flex items-center gap-3">
            {/* パートナーボタン - モバイル（ミニマル） */}
            <Link 
              href="/partners"
              aria-label="パートナー"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-semibold text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-md ring-1 ring-cyan-200 transition-colors duration-200 active:opacity-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              パートナー
            </Link>
            
            {/* ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-cyan-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0"
          >
            <div className="mx-3 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/70 ring-1 ring-white/60 shadow-[0_12px_40px_rgba(2,132,199,0.12)] overflow-hidden">
              <div className="pointer-events-none -mx-3 -mt-3 h-8 bg-gradient-to-b from-white/80 to-transparent"></div>
              <nav className="px-4 py-4 space-y-2">
                <Link
                  href="#services"
                  onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); scrollToId('services') }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/95 ring-1 ring-gray-200/70 hover:ring-cyan-200 shadow-sm hover:shadow-md text-gray-800 hover:text-cyan-700 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" /></svg>
                    </span>
                    <span className="font-semibold">サービス</span>
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link
                  href="#results"
                  onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); scrollToId('results') }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/95 ring-1 ring-gray-200/70 hover:ring-cyan-200 shadow-sm hover:shadow-md text-gray-800 hover:text-cyan-700 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 11V3m0 8a4 4 0 100 8 4 4 0 000-8zm7 4a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <span className="font-semibold">実績</span>
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); scrollToId('contact') }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/95 ring-1 ring-gray-200/70 hover:ring-cyan-200 shadow-sm hover:shadow-md text-gray-800 hover:text-cyan-700 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                    <span className="font-semibold">お問い合わせ</span>
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </nav>
              <div className="h-3" />
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
} 