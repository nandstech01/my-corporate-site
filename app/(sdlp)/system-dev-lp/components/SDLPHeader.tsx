'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'

const navItems = [
  { label: '対応領域', href: '#coverage' },
  { label: 'サービスについて', href: '#about' },
  { label: 'お問い合わせ', href: '#contact' },
]

export default function SDLPHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header data-sdlp className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sdlp-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/system-dev-lp"
            className="flex items-center gap-2 text-sdlp-text font-bold text-lg"
          >
            <span className="text-sdlp-primary">N&S</span>
            <span className="hidden sm:inline text-sm font-normal text-sdlp-text-secondary">
              システム開発
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-sdlp-text-secondary hover:text-sdlp-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:0120-407-638"
              className="flex items-center gap-1.5 text-sm text-sdlp-text-secondary hover:text-sdlp-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>0120-407-638</span>
            </a>
            <Link
              href="/system-dev-lp/questionnaire"
              className="rounded-lg bg-sdlp-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-sdlp-primary-hover transition-colors"
            >
              無料見積もり
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-sdlp-text-secondary"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="メニュー"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-sdlp-border py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-2 py-2 text-sm text-sdlp-text-secondary hover:text-sdlp-primary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="tel:0120-407-638"
              className="flex items-center gap-1.5 px-2 py-2 text-sm text-sdlp-text-secondary"
            >
              <Phone className="h-4 w-4" />
              0120-407-638
            </a>
            <Link
              href="/system-dev-lp/questionnaire"
              className="block mx-2 text-center rounded-lg bg-sdlp-primary px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              無料見積もり
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
