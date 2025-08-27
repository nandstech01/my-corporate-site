'use client';

import React from 'react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
  anchor?: string;
  children?: TOCItem[];
}

interface RelatedInfoLink {
  title: string;
  url: string;
  type: 'related' | 'faq';
}

interface TOCComponentProps {
  toc: TOCItem[];
  relatedInfo?: RelatedInfoLink[];
}

export default function TOCComponent({ toc, relatedInfo = [] }: TOCComponentProps) {
  
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (toc.length === 0) return null;

  // 階層構造をフラット化する関数
  const flattenTOC = (items: TOCItem[]): TOCItem[] => {
    const flattened: TOCItem[] = [];
    
    const addItems = (tocItems: TOCItem[]) => {
      tocItems.forEach(item => {
        flattened.push(item);
        if (item.children && item.children.length > 0) {
          addItems(item.children);
        }
      });
    };
    
    addItems(items);
    return flattened;
  };

  const flatToc = flattenTOC(toc).filter(item => item.id && item.id.trim() !== '');
  console.log('🔄 フラット化後TOC:', flatToc);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    
    // #を除去してクリーンなIDを取得
    const cleanId = id.replace('#', '');
    console.log('🎯 クリックされたID:', cleanId);
    
    // まず元のIDで検索
    let element = document.getElementById(cleanId);
    let foundId = cleanId;
    
    // 見つからない場合、サフィックス付きで検索（-2, -3, -4など）
    if (!element) {
      // ページ内の全ID要素を取得
      const allElementsWithId = document.querySelectorAll('[id]');
      const allIds = Array.from(allElementsWithId).map(el => el.id);
      
      // cleanIdで始まるIDを探す
      const matchingId = allIds.find(htmlId => 
        htmlId.startsWith(cleanId + '-') || htmlId === cleanId
      );
      
      if (matchingId) {
        element = document.getElementById(matchingId);
        foundId = matchingId;
        console.log('🔄 マッチしたID:', matchingId);
      }
    }
    
    console.log('🔍 見つかった要素:', element);
    
    if (element) {
      // より正確な位置計算
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      
      console.log('📍 要素の正確な位置:', elementTop);
      console.log('📍 現在のスクロール位置:', scrollTop);
      console.log('📍 要素のrect.top:', rect.top);
      
      window.scrollTo({
        top: elementTop - 80,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${foundId}`);
      console.log('✅ スクロール実行完了');
    } else {
      console.error('❌ 要素が見つかりません:', cleanId);
      // すべてのid属性を持つ要素を確認
      const allElementsWithId = document.querySelectorAll('[id]');
      console.log('🗂️ ページ内の全ID要素:', Array.from(allElementsWithId).map(el => el.id));
    }
  };

  // 表示する項目数を制御
  const maxItemsWhenCollapsed = 4;
  const shouldShowCollapseButton = flatToc.length > maxItemsWhenCollapsed || relatedInfo.length > 0;
  const displayItems = isExpanded ? flatToc : flatToc.slice(0, maxItemsWhenCollapsed);

  return (
    <div className="mb-10">
      <div className="bg-cyan-400 text-gray-900 py-3 px-4 flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          目次
        </h3>
        {shouldShowCollapseButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      <div className="border border-gray-200 border-t-0 rounded-b-lg bg-white overflow-hidden">
        <ul className="py-4 px-2">
          {displayItems.map((item: TOCItem, index: number) => {
            // H2項目のカウンターを計算
            const h2Items = flatToc.filter(tocItem => tocItem.level === 2);
            const h2Index = h2Items.findIndex(h2Item => h2Item.id === item.id);
            const isH2 = item.level === 2;
            const h2Number = isH2 ? h2Index + 1 : null;
            
            return (
              <li key={index} className="mb-3 last:mb-1" style={{ marginLeft: `${(item.level - 1) * 1}rem` }}>
                <a 
                  href={`#${item.anchor || item.id}`}
                  onClick={(e) => handleClick(e, item.anchor || item.id)}
                  className="flex items-center hover:text-cyan-500 text-sm transition-colors py-1.5 text-gray-700"
                >
                  {isH2 && (
                    <span className="flex-shrink-0 w-7 h-7 rounded-md bg-cyan-400 text-white flex items-center justify-center mr-3 font-semibold text-xs">
                      {h2Number}
                    </span>
                  )}
                  <span className="line-clamp-1">{item.title}</span>
                </a>
              </li>
            );
          })}
          
          {/* 関連情報を展開時のみ表示 */}
          {isExpanded && relatedInfo.length > 0 && (
            <>
              <li className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center text-sm font-medium text-gray-600 mb-3 cursor-default">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1a3 3 0 10-4.243-4.243l-1.102 1.1zm2.172-2.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.1a3 3 0 104.243 4.243l1.102-1.1z" />
                  </svg>
                  📚 関連情報
                </div>
              </li>
              {relatedInfo.map((link, index) => (
                <li key={`related-${index}`} className="mb-2">
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start hover:text-cyan-500 text-sm transition-colors py-1.5 text-gray-700"
                    style={{ marginLeft: '1rem' }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center mr-3 font-semibold text-xs">
                      {index + 1}
                    </span>
                    <span className="line-clamp-2">{link.title}</span>
                  </a>
                </li>
              ))}
            </>
          )}
        </ul>
        {shouldShowCollapseButton && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-cyan-600 hover:text-cyan-800 transition-colors flex items-center"
            >
              {isExpanded ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  折りたたむ
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  すべて表示 ({flatToc.length - maxItemsWhenCollapsed + (relatedInfo.length > 0 ? relatedInfo.length : 0)}項目)
                </>
              )}
            </button>
          </div>
                )}
      </div>
    </div>
  );
} 