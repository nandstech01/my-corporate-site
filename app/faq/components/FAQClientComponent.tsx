'use client';

import React, { useEffect } from 'react';

interface FAQItem {
  id: string;
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  icon: string;
  items: FAQItem[];
}

interface FAQClientComponentProps {
  faqs: FAQCategory[];
}

// Fragment ID生成関数
function getFragmentId(itemId: string, category: string): string {
  const categoryMap: { [key: string]: string } = {
    "AI・テクノロジーサービス": "tech",
    "料金・契約": "pricing", 
    "サポート・導入": "support",
    "人材・研修": "hr",
    "マーケティング・AIO": "marketing",
    "AIサイト・ブランディング": "ai-site"
  };
  const categoryPrefix = categoryMap[category] || 'faq';
  
  // 最後のハイフン以降を番号として取得（ai-site-1 → 1）
  const parts = itemId.split('-');
  const itemNumber = parts[parts.length - 1] || '1';
  
  return `faq-${categoryPrefix}-${itemNumber}`;
}

const FAQClientComponent: React.FC<FAQClientComponentProps> = ({ faqs }) => {
  // 🆕 ディープリンク対応：URLハッシュ検出でスクロール
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      console.log('🔍 Fragment ID detected:', hash); // デバッグログ
      
      if (hash && hash.startsWith('faq-')) {
        // より確実なスクロール処理 - 複数タイミングで試行
        const scrollToElement = () => {
          const element = document.getElementById(hash);
          console.log('📍 Element found:', element); // デバッグログ
          
          if (element) {
            // Fragment ID要素の親要素（実際のFAQ項目）を取得
            const parentElement = element.parentElement;
            if (parentElement) {
              const headerHeight = 100; // 固定ヘッダー + マージン
              const elementTop = parentElement.offsetTop - headerHeight;
              
              window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
              });
              
              console.log('✅ Scrolled to parent element at:', elementTop); // デバッグログ
              return true;
            } else {
              // フォールバック：Fragment ID要素自体の位置を使用
              const headerHeight = 80;
              const elementTop = element.offsetTop - headerHeight;
              
              window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
              });
              
              console.log('✅ Scrolled to element at:', elementTop); // デバッグログ
              return true;
            }
          }
          return false;
        };

        // 複数タイミングで試行（100ms、500ms、1000ms）
        setTimeout(() => {
          if (!scrollToElement()) {
            setTimeout(() => {
              if (!scrollToElement()) {
                setTimeout(scrollToElement, 1000);
              }
            }, 500);
          }
        }, 100);
      }
    };

    // 初回ロード時とハッシュ変更時に実行
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [faqs]);

  // このコンポーネントは非表示で、ディープリンク機能のみ提供
  return null;
};

export default FAQClientComponent; 