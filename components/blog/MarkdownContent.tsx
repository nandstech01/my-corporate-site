'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// セキュリティ脆弱性のため react-syntax-highlighter を削除
// 代替案として基本的なコードブロック表示を使用
import type { Plugin } from 'unified';

// TypeScript Window拡張
declare global {
  interface Window {
    __faqCounter?: number;
  }
}

interface MarkdownContentProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const faqCounterRef = useRef<number>(0); // FAQ質問カウンター
  const usedIdsRef = useRef<Set<string>>(new Set()); // 重複ID防止

  // 見出しから目次を生成
  useEffect(() => {
    if (!content) return;

    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const tocItems: TocItem[] = [];
    let match;
    let counter = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // #の数
      const rawText = match[2];
      
      // Fragment ID パターンをチェック ({#id} 形式)
      const fragmentMatch = rawText.match(/^(.*?)\s*\{#([^}]+)\}$/);
      
      let displayText = rawText;
      let id = '';
      
      if (fragmentMatch) {
        // Fragment IDが見つかった場合、表示テキストとIDを分離
        displayText = fragmentMatch[1].trim();
        id = fragmentMatch[2];
      } else {
        // 従来通りのID生成
        id = rawText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }

      if (level <= 4) { // h2, h3, h4のみを目次に含める
        // 一意のIDを確保するためにカウンターを追加（Fragment IDが無い場合のみ）
        const finalId = id || `heading-${counter}`;
        tocItems.push({ 
          id: finalId, 
          text: displayText, 
          level 
        });
        counter++;
      }
    }

    setToc(tocItems);
  }, [content]);

  // スクロール監視で現在の見出しをハイライト
  useEffect(() => {
    if (!contentRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const headings = contentRef.current.querySelectorAll('h2, h3, h4');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [content]);

  // 見出しをクリックした時にスクロール
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveHeading(id);
      setIsTocOpen(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* 目次はページレベルで表示するため、ここでは削除 */}
      
      <div ref={contentRef} className="prose max-w-none prose-lg prose-img:rounded-lg">
        <ReactMarkdown
          components={{
            code({className, children}) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <pre className="my-6 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                  <code className={`language-${match[1]} font-mono text-sm`}>
                    {String(children).replace(/\n$/, '')}
                  </code>
                </pre>
              ) : (
                <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
                  {children}
                </code>
              );
            },
            h1({children}) {
              // H1タイトルは記事本文中に表示しない（タイトル欄で既に表示済み）
              return null;
            },
            h2({children}) {
              // Fragment ID パターンをチェック ({#id} 形式)
              const childrenStr = String(children);
              const fragmentMatch = childrenStr.match(/^(.*?)\s*\{#([^}]+)\}$/);
              
              let displayText = childrenStr;
              let id = '';
              
              if (fragmentMatch) {
                // Fragment IDが見つかった場合、表示テキストとIDを分離
                displayText = fragmentMatch[1].trim();
                id = fragmentMatch[2];
              } else {
                // 従来通りのID生成
                id = childrenStr
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');
              }
              
              // 🔧 重複ID防止処理
              let uniqueId = id;
              let counter = 1;
              while (usedIdsRef.current.has(uniqueId)) {
                uniqueId = `${id}-${counter}`;
                counter++;
              }
              usedIdsRef.current.add(uniqueId);
              
              return (
                <h2 
                  id={uniqueId}
                  className="not-prose bg-gray-50 mt-10 mb-5 py-2 pl-4 pr-2 text-lg font-bold text-gray-800 border-l-4 border-cyan-400"
                >
                  {displayText}
                </h2>
              );
            },
            h3({children}) {
              // Fragment ID パターンをチェック ({#id} 形式)
              const childrenStr = String(children);
              const fragmentMatch = childrenStr.match(/^(.*?)\s*\{#([^}]+)\}$/);
              
              let displayText = childrenStr;
              let id = '';
              
              if (fragmentMatch) {
                // Fragment IDが見つかった場合、表示テキストとIDを分離
                displayText = fragmentMatch[1].trim();
                id = fragmentMatch[2];
              } else {
                // 従来通りのID生成
                id = childrenStr
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');
              }
              
              // 🔧 重複ID防止処理
              let uniqueId = id;
              let counter = 1;
              while (usedIdsRef.current.has(uniqueId)) {
                uniqueId = `${id}-${counter}`;
                counter++;
              }
              usedIdsRef.current.add(uniqueId);
              
              return (
                <h3 
                  id={uniqueId}
                  className="not-prose h3-gradient-underline mt-8 mb-4 text-base font-bold text-gray-700"
                >
                  {displayText}
                </h3>
              );
            },
            h4({children}) {
              // Fragment ID パターンをチェック ({#id} 形式)
              const childrenStr = String(children);
              const fragmentMatch = childrenStr.match(/^(.*?)\s*\{#([^}]+)\}$/);
              
              let displayText = childrenStr;
              let id = '';
              
              if (fragmentMatch) {
                // Fragment IDが見つかった場合、表示テキストとIDを分離
                displayText = fragmentMatch[1].trim();
                id = fragmentMatch[2];
              } else {
                // FAQ質問の自動Fragment ID生成（AI引用最適化）
                if (childrenStr.match(/^Q[：:]\s*(.+)/)) {
                  // FAQ質問のカウンターを管理（useRef使用）
                  faqCounterRef.current += 1;
                  id = `faq-${faqCounterRef.current}`;
                } else {
                  // 従来通りのID生成
                  id = childrenStr
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                }
              }
              
              // 🔧 重複ID防止処理
              let uniqueId = id;
              let counter = 1;
              while (usedIdsRef.current.has(uniqueId)) {
                uniqueId = `${id}-${counter}`;
                counter++;
              }
              usedIdsRef.current.add(uniqueId);
              
              return (
                <h4 
                  id={uniqueId}
                  className="mt-6 mb-3 text-lg font-bold text-gray-700 border-b border-gray-300 pb-1"
                >
                  {displayText}
                </h4>
              );
            },
            p({ children }) {
              return <p className="my-4 leading-relaxed text-gray-700 text-base">{children}</p>;
            },
            ul({ children }) {
              return <ul className="my-4 text-base list-disc space-y-2 pl-6">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="my-4 text-base list-decimal space-y-2 pl-6">{children}</ol>;
            },
            li({ children }) {
              return <li className="text-gray-700 text-base">{children}</li>;
            },
            table: ({ children }) => (
              <div className="sticky-table-container my-6 overflow-x-auto shadow-md rounded-none">
                <table className="sticky-first-column-table not-prose w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-cyan-400 text-gray-900">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="py-3 px-4 font-semibold text-center text-gray-900 bg-cyan-400">
                {children}
              </th>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            ),
            td: ({ children }) => (
              <td className="py-3 px-4 text-gray-700 border-b border-gray-200 bg-white">
                {children}
              </td>
            ),
            strong({ children }) {
              return <span className="font-bold highlight-marker">{children}</span>;
            },
            a({ href, children }) {
              const isLongUrl = typeof children === 'string' && children.length > 60;
              const displayText = isLongUrl && typeof children === 'string' 
                ? children.substring(0, 50) + '...' 
                : children;
              
              return (
                <a 
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="not-prose text-blue-600 hover:text-blue-800 underline transition-colors duration-200 break-words hyphens-auto"
                  style={{ 
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    lineBreak: 'anywhere',
                    maxWidth: '100%',
                    display: 'inline-block'
                  }}
                  title={href}
                >
                  {displayText}
                </a>
              );
            },
            img({ src, alt }) {
              if (!src) return null;
              
              // Supabase Storageの画像URLを処理
              let processedSrc = src;
              if (!src.startsWith('http')) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (supabaseUrl) {
                  processedSrc = `${supabaseUrl}/storage/v1/object/public/${src}`;
                }
              }
              
              return (
                <div className="my-6 text-center">
                  <img
                    src={processedSrc}
                    alt={alt || ''}
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    onError={(e) => {
                      console.log('Image load error:', processedSrc);
                      // デフォルト画像へのフォールバック
                      e.currentTarget.src = '/images/default-post.jpg';
                    }}
                  />
                  {alt && (
                    <p className="text-sm text-gray-500 mt-2 italic">{alt}</p>
                  )}
                </div>
              );
            },
          }}
          // @ts-ignore - Type issues with remarkGfm
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
} 