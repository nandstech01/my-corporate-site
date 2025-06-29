'use client';

import React from 'react';

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  subsections?: TOCItem[];
}

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  items, 
  className = "" 
}) => {
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
                    className="flex items-start p-4 rounded-xl border border-gray-200 
                             hover:border-blue-300 hover:bg-blue-50 transition-all duration-300
                             group-hover:shadow-md"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 
                                   rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 
                                   transition-colors mb-2 leading-tight">
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
                  
                  {/* Subsections - using anchor tags instead of divs with onClick */}
                  {item.subsections && item.subsections.length > 0 && (
                    <div className="mt-3 ml-12 space-y-1">
                      {item.subsections.map((subsection, subIndex) => (
                        <a
                          key={subIndex}
                          href={`#${subsection.id}`}
                          className="block text-sm text-gray-600 hover:text-blue-600 
                                   transition-colors hover:underline pl-2 border-l-2 
                                   border-gray-200 hover:border-blue-300
                                   py-1 hover:bg-blue-50 rounded"
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