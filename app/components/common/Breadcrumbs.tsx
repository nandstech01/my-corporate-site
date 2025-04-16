'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customItems?: BreadcrumbItem[];
  homeIcon?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items = [], 
  customItems = [],
  homeIcon = true
}) => {
  const pathname = usePathname() || '';
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // ホームを常に追加
  breadcrumbItems.push({ name: 'ホーム', path: '/' });
  
  // カスタムアイテムがあればそれを優先
  if (customItems.length > 0) {
    breadcrumbItems.push(...customItems);
  } else if (items.length > 0) {
    // 指定されたアイテムがあればそれを追加
    breadcrumbItems.push(...items);
  } else {
    // パスからアイテムを自動生成
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      // セグメント名を適切な表示名に変換（必要に応じてカスタマイズ）
      let name = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // 特定のパスに対して名前をマッピング
      const pathNameMap: Record<string, string> = {
        'about': '会社概要',
        'services': 'サービス',
        'blog': 'ブログ',
        'contact': 'お問い合わせ',
        'reskilling': 'リスキリング',
        'sustainability': 'サステナビリティ',
        'privacy': 'プライバシーポリシー',
        'terms': '利用規約',
        'faq': 'よくある質問',
      };
      
      if (pathNameMap[segment]) {
        name = pathNameMap[segment];
      }
      
      breadcrumbItems.push({ name, path: currentPath });
    });
  }
  
  // 構造化データを生成
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@id': `https://nands.tech${item.path}`,
        'name': item.name
      }
    }))
  };

  return (
    <>
      <Script
        id="breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="パンくずリスト" className="py-3 text-sm mb-4">
        <ol className="flex flex-wrap items-center">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            
            return (
              <li key={`breadcrumb-${index}-${item.path}`} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                
                {isLast ? (
                  <span className="text-gray-800 font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link 
                    href={item.path}
                    className="text-gray-600 hover:text-blue-700 hover:underline"
                  >
                    {index === 0 && homeIcon ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {item.name}
                      </span>
                    ) : (
                      item.name
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs; 