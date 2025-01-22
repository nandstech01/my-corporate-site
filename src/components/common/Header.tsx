'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HamburgerMenu from '../HamburgerMenu';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="N&S Logo"
              width={120}
              height={40}
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>
        </div>

        <nav className="hidden lg:flex space-x-4">
          {[
            { href: '/', label: 'ホーム' },
            { href: '/services', label: 'サービス' },
            { href: '/seo-support', label: 'SEO支援' },
            { href: '/about', label: '会社概要' },
            { href: '/contact', label: 'お問い合わせ' }
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-600 hover:text-gray-900"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="lg:hidden">
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
}