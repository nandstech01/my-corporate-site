'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useClaviTheme } from '@/app/clavi/context';

const footerLinks = {
  product: [
    { label: '機能', href: '/clavi/features' },
    { label: '料金', href: '/clavi/pricing' },
    { label: '事例', href: '/clavi/case-studies' },
  ],
  features: [
    { label: '分析', href: '/clavi/features/analyze' },
    { label: '生成', href: '/clavi/features/generate' },
    { label: '拡張', href: '/clavi/features/expand' },
  ],
  company: [
    { label: 'お問い合わせ', href: '/clavi/contact' },
    { label: 'ブログ', href: '/clavi/blog' },
  ],
};

export default function ClaviFooter() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <footer
      className="border-t transition-colors duration-200"
      style={{
        background: isDark ? '#0F172A' : '#FFFFFF',
        borderColor: isDark ? '#1E293B' : '#E2E8F0'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/clavi-logo.png"
                alt="CLAVI"
                width={32}
                height={32}
                className="rounded-full"
                style={{
                  filter: isDark ? 'brightness(0) invert(1)' : 'none',
                }}
              />
              <span
                className="font-black text-lg"
                style={{ color: isDark ? '#F8FAFC' : '#1E3A8A' }}
              >
                CLAVI
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: isDark ? '#E2E8F0' : '#374151' }}
            >
              AIに見つかるための構造化データ最適化。
              ChatGPT・Gemini・Perplexityでの引用率を向上。
            </p>
          </div>

          {/* Product */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: isDark ? '#E2E8F0' : '#334155' }}
            >
              プロダクト
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: isDark ? '#E2E8F0' : '#374151' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: isDark ? '#E2E8F0' : '#334155' }}
            >
              機能
            </h3>
            <ul className="space-y-2">
              {footerLinks.features.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: isDark ? '#E2E8F0' : '#374151' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: isDark ? '#E2E8F0' : '#334155' }}
            >
              会社
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: isDark ? '#E2E8F0' : '#374151' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: isDark ? '#1E293B' : '#E2E8F0' }}
        >
          <p
            className="text-xs"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            &copy; 2026 CLAVI - AI検索最適化プラットフォーム
          </p>
          <p
            className="text-xs"
            style={{ color: isDark ? '#475569' : '#CBD5E1' }}
          >
            Powered by Schema.org &amp; JSON-LD
          </p>
        </div>
      </div>
    </footer>
  );
}
