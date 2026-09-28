import React, { isValidElement, type ReactElement, type ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Element, Root } from 'hast';
import LINEConversionButton from './LINEConversionButton';
import MarkdownImage from './MarkdownImage';
import GuideBlock, { type GuideRenderContext } from '@/components/guide/GuideBlock';
import { buildGuideComponents, guideFence, rehypeGuideSections, textOf } from '@/components/guide/guide-markdown';
import { parseHeadingText, type GuideTocItem } from '@/app/posts/_lib/post-text';

/**
 * 記事本文の Markdown を描く (サーバー部品)。
 * react-markdown はサーバーだけで動き、ブラウザには HTML だけが届く (JS と本文の二重送信をしない)。
 * - ```nands-* のコードフェンスはガイドのブロック (components/guide) として描く
 * - 見出しの id は app/posts/_lib/post-text の parseHeadingText。ガイドの目次は renderMarkdown が
 *   同じ描画結果の見出しから作るので、目次のリンク先と本文の id が必ず一致する
 */

interface MarkdownContentProps {
  content: string;
  /** ガイド (category_tags に guide) のときだけ渡す。本文中の自動の LINE 導線を出さず、相談フォームの送信元に slug を使う */
  guide?: GuideRenderContext;
}

interface HeadingData {
  h2Index?: number;
  faqIndex?: number;
}

/**
 * 見出しに通し番号を付ける rehype プラグイン (描画の順番に依存しないように、木の上で数える)。
 * h2 は何番目か (3 番目の後に LINE の導線)、h4 の「Q: …」は FAQ の id (faq-1, faq-2, …)。
 */
function rehypeHeadingIndex() {
  return (tree: Root) => {
    let h2 = 0;
    let faq = 0;
    const visit = (node: Root | Element) => {
      for (const child of node.children) {
        if (child.type !== 'element') continue;
        if (child.tagName === 'h2') {
          h2 += 1;
          child.data = { ...child.data, h2Index: h2 } as Element['data'];
        } else if (child.tagName === 'h4') {
          const heading = parseHeadingText(textOf(child));
          if (!heading.explicit && /^Q[：:]\s*(.+)/.test(heading.text)) {
            faq += 1;
            child.data = { ...child.data, faqIndex: faq } as Element['data'];
          }
        }
        visit(child);
      }
    };
    visit(tree);
  };
}

function headingData(node: Element | undefined): HeadingData {
  return (node?.data ?? {}) as HeadingData;
}

/** 見出しの末尾の {#id} を消す (太字・コードなどのインラインの装飾はそのまま残す) */
function stripTrailingFragment(children: ReactNode): ReactNode {
  const list = React.Children.toArray(children);
  const last = list[list.length - 1];
  if (typeof last !== 'string') return list;
  return [...list.slice(0, -1), last.replace(/\s*\{#[^}]+\}\s*$/, '')];
}

/** 段落・リスト・表のセルに残った {#id} を消す */
function stripFragmentIds(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') return node.replace(/\s*\{#[^}]+\}\s*/g, ' ').trim();
  if (Array.isArray(node)) return node.map(stripFragmentIds);
  return node;
}

/** Storage のパス (http で始まらない) は Supabase Storage の公開 URL にする */
function resolveImageSrc(src: string): string {
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${src}` : src;
}

/**
 * 画像の title に "1200x630" のように書かれていれば、その幅と高さ (レイアウトずれを防ぐ)。
 * 書かれていない画像は大きさが分からないので付けない (推測の値を付けると小さい画像が引き伸ばされる)。
 * ガイドのパイプラインは本文の画像に必ず "幅x高さ" を書く
 */
function imageSize(title: string | undefined): { width: number; height: number } | undefined {
  const match = title?.match(/^\s*(\d{2,4})x(\d{2,4})\s*$/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined;
}

function buildComponents(guide: GuideRenderContext | undefined): Components {
  const autoLineCta = guide === undefined;

  return {
    pre({ node, children }) {
      const fence = guideFence(node);
      if (fence) return <GuideBlock lang={fence.lang} raw={fence.raw} context={guide} />;
      return <pre>{children}</pre>;
    },
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <pre className="my-6 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto">
          <code className={`language-${match[1]} font-mono text-sm`}>
            {String(children).replace(/\n$/, '')}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded font-mono text-sm">
          {children}
        </code>
      );
    },
    h1() {
      // H1タイトルは記事本文中に表示しない（タイトル欄で既に表示済み）
      return null;
    },
    h2({ node, children }) {
      const { text, id } = parseHeadingText(node ? textOf(node) : '');
      const { h2Index } = headingData(node);
      // FAQセクションを検出（よくある質問、Q&A、FAQ等）
      const isFAQSection = /よくある質問|Q&A|Q＆A|FAQ|よくあるご質問/i.test(text);

      return (
        <>
          {/* FAQセクションの直前にLINEボタンを挿入 */}
          {autoLineCta && isFAQSection && <LINEConversionButton position="before-faq" />}

          <h2
            id={id || undefined}
            className="not-prose bg-gray-50 dark:bg-gray-800 mt-10 mb-5 py-2 pl-4 pr-2 text-lg font-bold text-gray-800 dark:text-gray-100 border-l-4 border-cyan-400 dark:border-cyan-500"
          >
            {stripTrailingFragment(children)}
          </h2>

          {/* 3番目のh2の直後にLINEボタンを挿入 */}
          {autoLineCta && h2Index === 3 && <LINEConversionButton position="after-3rd-h2" />}
        </>
      );
    },
    h3({ node, children }) {
      const { id } = parseHeadingText(node ? textOf(node) : '');
      return (
        <h3
          id={id || undefined}
          className="not-prose h3-gradient-underline mt-8 mb-4 text-base font-bold text-gray-700 dark:text-gray-200"
        >
          {stripTrailingFragment(children)}
        </h3>
      );
    },
    h4({ node, children }) {
      const heading = parseHeadingText(node ? textOf(node) : '');
      const { faqIndex } = headingData(node);
      // FAQ質問の自動Fragment ID生成（AI引用最適化）
      const id = faqIndex !== undefined ? `faq-${faqIndex}` : heading.id;
      return (
        <h4
          id={id || undefined}
          className="mt-6 mb-3 text-lg font-bold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-1"
        >
          {stripTrailingFragment(children)}
        </h4>
      );
    },
    p({ children }) {
      return <p className="my-4 leading-relaxed text-gray-700 dark:text-gray-300 text-base">{stripFragmentIds(children)}</p>;
    },
    ul({ children }) {
      return <ul className="not-prose my-4 text-base space-y-2 pl-8" style={{ listStyleType: 'disc', listStylePosition: 'outside', display: 'block' }}>{children}</ul>;
    },
    ol({ children }) {
      return <ol className="not-prose my-4 text-base space-y-2 pl-8" style={{ listStyleType: 'decimal', listStylePosition: 'outside', display: 'block' }}>{children}</ol>;
    },
    li({ children }) {
      return <li className="text-gray-700 dark:text-gray-300 text-base leading-relaxed ml-0" style={{ display: 'list-item' }}>{stripFragmentIds(children)}</li>;
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
        {stripFragmentIds(children)}
      </td>
    ),
    strong({ children }) {
      return <span className="font-bold highlight-marker">{children}</span>;
    },
    em({ children }) {
      return <em className="italic text-gray-700 dark:text-gray-300">{children}</em>;
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
    img({ src, alt, title }) {
      if (!src) return null;
      const size = imageSize(title);
      // 画像は段落 (<p>) の中に来るので、ブロック要素 (div・p) ではなく span で包む (不正な入れ子を作らない)
      return (
        <span className="block my-6 text-center">
          <MarkdownImage
            src={resolveImageSrc(src)}
            alt={alt || ''}
            width={size?.width}
            height={size?.height}
            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
          />
          {alt && (
            <span className="block text-sm text-gray-500 mt-2 italic">{alt}</span>
          )}
        </span>
      );
    },
  };
}

export interface RenderedMarkdown {
  /** 本文の要素 (MarkdownFrame の中に置く) */
  readonly element: ReactElement;
  /** 本文の h2・h3 (id が空・重複のものは除く)。ガイドの目次に使う */
  readonly headings: GuideTocItem[];
}

/** 描画結果の木から h2・h3 を集める (目次の id = 本文の id) */
function collectHeadings(root: ReactNode, components: Components): GuideTocItem[] {
  const levels = new Map<unknown, 2 | 3>([[components.h2, 2], [components.h3, 3]]);
  const seen = new Set<string>();
  const headings: GuideTocItem[] = [];
  const walk = (node: ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as { node?: Element; children?: ReactNode };
      const level = levels.get(child.type);
      if (level && props.node) {
        const { text, id } = parseHeadingText(textOf(props.node));
        if (id && !seen.has(id)) {
          seen.add(id);
          headings.push({ id, text, level });
        }
        return;
      }
      walk(props.children);
    });
  };
  walk(root);
  return headings;
}

/**
 * Markdown を 1 回だけ解析して、本文の要素と見出しの一覧を返す。
 * ガイドのページはこの見出しで目次を作り、要素を MarkdownFrame に入れて描く。
 */
export function renderMarkdown(content: string, guide?: GuideRenderContext): RenderedMarkdown {
  // ガイドは専用の部品 (components/guide/guide-markdown) と、h2 ごとの区画に分ける処理を使う
  const components = guide ? buildGuideComponents(guide) : buildComponents(guide);
  const element = Markdown({
    children: content,
    components,
    remarkPlugins: [remarkGfm],
    rehypePlugins: guide ? [rehypeHeadingIndex, rehypeGuideSections] : [rehypeHeadingIndex],
  });
  return { element, headings: collectHeadings(element, components) };
}

/** ガイドの本文の外枠 (区画ごとの帯は本文の中の section が持つ。prose のクラスは使わない) */
export function GuideBody({ children }: { children: ReactNode }) {
  return <div className="guide-body">{children}</div>;
}

/** 本文の外枠 (従来の記事と同じクラス) */
export function MarkdownFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="prose dark:prose-invert max-w-none prose-lg prose-img:rounded-lg">{children}</div>
    </div>
  );
}

export default function MarkdownContent({ content, guide }: MarkdownContentProps) {
  return <MarkdownFrame>{renderMarkdown(content, guide).element}</MarkdownFrame>;
}
