'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Plugin } from 'unified';

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

  // 見出しから目次を生成
  useEffect(() => {
    if (!content) return;

    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const tocItems: TocItem[] = [];
    let match;
    let counter = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // #の数
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      if (level <= 4) { // h2, h3, h4のみを目次に含める
        // 一意のIDを確保するためにカウンターを追加
        tocItems.push({ 
          id: id || `heading-${counter}`, 
          text, 
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
      {/* 目次 */}
      {toc.length > 0 && (
        <div className="mb-10">
          <div className="bg-cyan-400 text-gray-900 py-3 px-4 flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              目次
            </h3>
            <button 
              onClick={() => setIsTocOpen(!isTocOpen)} 
              className="text-gray-900 focus:outline-none"
            >
              {isTocOpen ? '−' : '＋'}
            </button>
          </div>

          <div 
            className={`border border-gray-200 border-t-0 rounded-b-lg bg-white overflow-hidden transition-all duration-300 ${isTocOpen ? 'max-h-96' : 'max-h-0'}`}
          >
            <ul className="py-4 px-2">
              {toc.filter(item => item.level === 2).map((item, index) => (
                <li 
                  key={`toc-${item.id}-${index}`}
                  className="mb-3 last:mb-1"
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(item.id);
                    }}
                    className={`flex items-center hover:text-cyan-500 text-sm transition-colors py-1.5 ${
                      activeHeading === item.id 
                        ? 'text-cyan-500 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-md bg-cyan-400 text-white flex items-center justify-center mr-3 font-semibold">
                      {index + 1}
                    </span>
                    <span className="line-clamp-1">{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
            {toc.filter(item => item.level === 2).length > 8 && (
              <div className="text-center pb-3">
                <button
                  onClick={() => setIsTocOpen(!isTocOpen)}
                  className="text-sm text-blue-600 hover:text-blue-800 px-4 py-1 rounded-full border border-blue-200 hover:border-blue-400 transition-colors"
                >
                  {isTocOpen ? '折りたたむ' : 'もっと見る'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div ref={contentRef} className="prose max-w-none prose-lg prose-img:rounded-lg">
        <ReactMarkdown
          components={{
            code({className, children}) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={match[1]}
                  PreTag="div"
                  className="my-6 rounded-lg"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
                  {children}
                </code>
              );
            },
            h2({children}) {
              const id = String(children)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              
              return (
                <h2 
                  id={id}
                  className="not-prose bg-gray-50 mt-10 mb-5 py-2 pl-4 pr-2 text-lg font-bold text-gray-800 border-l-4 border-cyan-400"
                >
                  {children}
                </h2>
              );
            },
            h3({children}) {
              const id = String(children)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              
              return (
                <h3 
                  id={id}
                  className="not-prose h3-gradient-underline mt-8 mb-4 text-base font-bold text-gray-700"
                >
                  {children}
                </h3>
              );
            },
            h4({children}) {
              const id = String(children)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              
              return (
                <h4 
                  id={id}
                  className="mt-6 mb-3 text-lg font-bold text-gray-700 border-b border-gray-300 pb-1"
                >
                  {children}
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