'use client';

import React, { useState, useEffect } from 'react';

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  subsections?: TOCItem[];
  // Mike King理論準拠 - AI検索最適化拡張プロパティ
  semanticWeight?: number;
  targetQueries?: string[];
  entities?: string[];
}

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
  compact?: boolean; // 軽量版フラグ
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  items, 
  className = "",
  compact = false 
}) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期表示時の実行
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // 軽量版（メインページ用）- Mike King理論準拠セマンティック重み付け対応
  if (compact) {
    return (
      <div className={`toc-container ${className}`}>
        <div className="container mx-auto px-4">
          <nav className="toc-nav" aria-label="AI検索最適化ページ内ナビゲーション">
            {items.map((item) => {
              // セマンティック重み付けによる視覚的優先度
              const semanticLevel = item.semanticWeight ? 
                item.semanticWeight >= 0.9 ? 'high' : 
                item.semanticWeight >= 0.85 ? 'medium' : 'standard' : 'standard';
              
              const semanticClass = {
                'high': 'toc-link-high-semantic',
                'medium': 'toc-link-medium-semantic', 
                'standard': 'toc-link'
              }[semanticLevel];

              // テキスト省略関数（文字数制限を緩和）
              const truncateText = (text: string, maxLength: number = 35) => {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + '...';
              };

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`${semanticClass} ${activeSection === item.id ? 'active' : ''}`}
                  aria-current={activeSection === item.id ? 'location' : undefined}
                  title={`${item.title} | セマンティック重み: ${item.semanticWeight || 'N/A'} | 対象クエリ: ${item.targetQueries?.join(', ') || 'N/A'}`}
                >
                  <svg 
                    className="w-4 h-4 mr-2 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={semanticLevel === 'high' ? 3 : semanticLevel === 'medium' ? 2.5 : 2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                  <span className="truncate">
                    {truncateText(item.title)}
                  </span>
                  {item.semanticWeight && (
                    <span className="ml-2 px-2 py-1 text-xs bg-black bg-opacity-20 text-white rounded-full flex-shrink-0 hidden md:inline-block">
                      {(item.semanticWeight * 100).toFixed(0)}%
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Fragment ID最適化スキーマ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SiteNavigationElement",
              "name": "ページ内ナビゲーション",
              "description": "Fragment ID対応ページ内ナビゲーション",
              "hasPart": items.map((item, index) => ({
                "@type": "WebPageElement",
                "@id": `#${item.id}`,
                "name": item.title,
                "position": index + 1,
                "url": `#${item.id}`,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "url": "https://nands.tech"
                }
              }))
            })
          }}
        />
      </div>
    );
  }

  // フルサイズ版（記事ページ用）
  return (
    <section className={`py-16 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg 
                className="w-6 h-6 mr-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              目次
            </h2>
            <p className="text-blue-100 mt-2">
              このページの内容に素早くアクセス
            </p>
          </div>
          
          <nav className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {items.map((item, index) => (
                <div key={index} className="group">
                  <a
                    href={`#${item.id}`}
                    className={`flex items-start p-4 rounded-xl border transition-all duration-300 group-hover:shadow-md ${
                      activeSection === item.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 
                                   rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold transition-colors mb-2 leading-tight ${
                        activeSection === item.id 
                          ? 'text-blue-600' 
                          : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {item.title}
                      </h3>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                               transition-colors flex-shrink-0 mt-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </a>
                  
                  {/* Subsections */}
                  {item.subsections && item.subsections.length > 0 && (
                    <div className="mt-3 ml-12 space-y-1">
                      {item.subsections.map((subsection, subIndex) => (
                        <a
                          key={subIndex}
                          href={`#${subsection.id}`}
                          className={`block text-sm transition-colors hover:underline pl-2 border-l-2 py-1 hover:bg-blue-50 rounded ${
                            activeSection === subsection.id
                              ? 'text-blue-600 border-blue-300'
                              : 'text-gray-600 hover:text-blue-600 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {subsection.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
          
          {/* Fragment ID対応・hasPartスキーマ生成 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "hasPart": items.map((item, index) => ({
                  "@type": "Article",
                  "@id": `#${item.id}`,
                  "name": item.title,
                  "position": index + 1,
                  "isPartOf": {
                    "@type": "WebPage"
                  },
                  ...(item.subsections && item.subsections.length > 0 && {
                    "hasPart": item.subsections.map((sub, subIndex) => ({
                      "@type": "Article", 
                      "@id": `#${sub.id}`,
                      "name": sub.title,
                      "position": subIndex + 1
                    }))
                  })
                }))
              })
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default TableOfContents; 