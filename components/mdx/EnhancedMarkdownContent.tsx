'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Plugin } from 'unified';

interface EnhancedMarkdownContentProps {
  content: string;
  isMDX?: boolean; // MDXコンテンツかどうかのフラグ
}

// MDXコンテンツかどうかを判定する関数
const detectMDXContent = (content: string): boolean => {
  // MDX特有の記法を検出
  const mdxPatterns = [
    /<[A-Z][a-zA-Z0-9]*/, // Reactコンポーネント（大文字で始まる）
    /import\s+/,          // import文
    /export\s+/,          // export文
    /{[^}]*}/,            // JSX式
  ];
  
  return mdxPatterns.some(pattern => pattern.test(content));
};

// ReactMarkdown用のコンポーネント定義
const createMarkdownComponents = () => ({
  code({className, children, ...props}: any) {
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
      <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm" {...props}>
        {children}
      </code>
    );
  },
  p({ children, ...props }: any) {
    return <p className="text-gray-700 leading-relaxed mb-4" {...props}>{children}</p>;
  },
  h1({ children, ...props }: any) {
    return <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props}>{children}</h1>;
  },
  h2({ children, ...props }: any) {
    return <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200" {...props}>{children}</h2>;
  },
  h3({ children, ...props }: any) {
    return <h3 className="text-xl font-bold text-gray-800 mt-5 mb-3" {...props}>{children}</h3>;
  },
  h4({ children, ...props }: any) {
    return <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2" {...props}>{children}</h4>;
  },
  h5({ children, ...props }: any) {
    return <h5 className="text-base font-bold text-gray-800 mt-3 mb-2" {...props}>{children}</h5>;
  },
  h6({ children, ...props }: any) {
    return <h6 className="text-sm font-bold text-gray-800 mt-3 mb-2" {...props}>{children}</h6>;
  },
  ul({ children, ...props }: any) {
    return <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>{children}</ul>;
  },
  ol({ children, ...props }: any) {
    return <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>{children}</ol>;
  },
  li({ children, ...props }: any) {
    return <li className="text-gray-700" {...props}>{children}</li>;
  },
  blockquote({ children, ...props }: any) {
    return (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700" {...props}>
        {children}
      </blockquote>
    );
  },
  table: ({ children, ...props }: any) => (
    <div className="sticky-table-container my-6 overflow-x-auto shadow-md rounded-none">
      <table className="sticky-first-column-table not-prose w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-cyan-400 text-gray-900" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="py-3 px-4 font-semibold text-center text-gray-900 bg-cyan-400" {...props}>
      {children}
    </th>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="bg-white divide-y divide-gray-200" {...props}>
      {children}
    </tbody>
  ),
  td: ({ children, ...props }: any) => (
    <td className="py-3 px-4 text-gray-700 border-b border-gray-200 bg-white" {...props}>
      {children}
    </td>
  ),
  strong({ children, ...props }: any) {
    return <span className="font-bold highlight-marker" {...props}>{children}</span>;
  }
});

export default function EnhancedMarkdownContent({ 
  content, 
  isMDX 
}: EnhancedMarkdownContentProps) {
  const [isClient, setIsClient] = useState(false);
  const [tocVisible, setTocVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);

  // MDXコンテンツかどうかを自動判定（フラグが指定されていない場合）
  const shouldUseMDX = isMDX ?? detectMDXContent(content);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (contentRef.current && isClient) {
      const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingData = Array.from(headingElements).map((el, index) => {
        const id = el.id || `heading-${index}`;
        if (!el.id) {
          el.id = id;
        }
        return {
          id,
          text: el.textContent || '',
          level: parseInt(el.tagName.charAt(1))
        };
      });
      setHeadings(headingData);
    }
  }, [content, isClient]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  const markdownComponents = createMarkdownComponents();

  // 共通のレンダリング部分
  const renderContent = () => (
    <ReactMarkdown
      components={markdownComponents}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );

  const renderTOC = () => (
    headings.length > 0 && (
      <div className="w-64 hidden lg:block">
        <div className="sticky top-8">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">目次</h3>
              <button
                onClick={() => setTocVisible(!tocVisible)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {tocVisible ? '隠す' : '表示'}
              </button>
            </div>
            {tocVisible && (
              <nav className="toc-nav">
                <ul className="space-y-1 text-sm">
                  {headings.map((heading) => (
                    <li key={heading.id} style={{ marginLeft: `${(heading.level - 1) * 12}px` }}>
                      <a
                        href={`#${heading.id}`}
                        className="text-gray-600 hover:text-blue-600 transition-colors block py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(heading.id)?.scrollIntoView({
                            behavior: 'smooth'
                          });
                        }}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    )
  );

  // MDXコンテンツの場合（将来的な拡張用）
  if (shouldUseMDX) {
    return (
      <div className="enhanced-markdown-content">
        <div className="flex gap-8">
          <div className="flex-1">
            <div ref={contentRef} className="prose max-w-none prose-lg prose-img:rounded-lg">
              {renderContent()}
            </div>
          </div>
          {renderTOC()}
        </div>
      </div>
    );
  }

  // 通常のMarkdownコンテンツ（既存の処理を保持）
  return (
    <div className="markdown-content">
      <div className="flex gap-8">
        <div className="flex-1">
          <div ref={contentRef} className="prose max-w-none prose-lg prose-img:rounded-lg">
            {renderContent()}
          </div>
        </div>
        {renderTOC()}
      </div>
    </div>
  );
} 