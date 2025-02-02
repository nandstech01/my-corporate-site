'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const BUSINESS_CATEGORIES = [
  {
    id: 'fukugyo',
    name: '副業支援',
  },
  {
    id: 'reskilling',
    name: '法人向けリスキリング',
  },
  {
    id: 'corporate',
    name: '個人向けリスキリング',
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">NANDS TECH</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-8">
            {BUSINESS_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/blog/${category.id}`}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-600"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/chatgpt-special"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              ChatGPT特集
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">メニューを開く</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {BUSINESS_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/blog/${category.id}`}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/chatgpt-special"
              className="block pl-3 pr-4 py-2 text-base font-medium text-purple-600 hover:text-purple-500 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              ChatGPT特集
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 