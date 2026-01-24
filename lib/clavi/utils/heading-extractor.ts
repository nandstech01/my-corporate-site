/**
 * CLAVI SaaS - 見出し抽出ユーティリティ
 * 
 * @description
 * HTMLから見出し構造を抽出し、階層構造を構築
 * Fragment ID生成の基礎となる
 * 
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 */

import { JSDOM } from 'jsdom';
import type { HeadingStructure } from '../types/crawler';

/**
 * 見出しレベルの有効範囲
 */
const VALID_HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
type HeadingLevel = typeof VALID_HEADING_LEVELS[number];

/**
 * 見出し抽出オプション
 */
export interface HeadingExtractorOptions {
  /**
   * 最大レベル（1-6）
   * @default 6
   */
  maxLevel?: HeadingLevel;

  /**
   * 最小レベル（1-6）
   * @default 1
   */
  minLevel?: HeadingLevel;

  /**
   * 空の見出しを無視するか
   * @default true
   */
  ignoreEmpty?: boolean;

  /**
   * ID属性を自動生成するか
   * @default true
   */
  generateIds?: boolean;

  /**
   * IDプレフィックス
   * @default 'heading'
   */
  idPrefix?: string;
}

/**
 * 内部的な見出しノード
 */
interface HeadingNode {
  level: number;
  text: string;
  id: string | null;
  element: Element;
  children: HeadingNode[];
}

/**
 * 見出しを抽出
 * 
 * @param html - HTML文字列
 * @param options - 抽出オプション
 * @returns 見出し構造の配列
 * 
 * @example
 * ```typescript
 * const html = `
 *   <h1>タイトル</h1>
 *   <h2>セクション1</h2>
 *   <h3>サブセクション1-1</h3>
 *   <h2>セクション2</h2>
 * `;
 * const headings = extractHeadings(html);
 * console.log(headings);
 * // [
 * //   {
 * //     level: 1,
 * //     text: 'タイトル',
 * //     id: 'heading-1-タイトル',
 * //     path: [],
 * //     children: [
 * //       {
 * //         level: 2,
 * //         text: 'セクション1',
 * //         id: null,
 * //         path: ['タイトル'],
 * //         children: [...]
 * //       },
 * //       ...
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function extractHeadings(
  html: string,
  options: HeadingExtractorOptions = {}
): HeadingStructure[] {
  const {
    maxLevel = 6,
    minLevel = 1,
    ignoreEmpty = true,
    generateIds = true,
    idPrefix = 'heading',
  } = options;

  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // 見出し要素を抽出
    const headingElements = Array.from(
      document.querySelectorAll(
        VALID_HEADING_LEVELS
          .filter(level => level >= minLevel && level <= maxLevel)
          .map(level => `h${level}`)
          .join(', ')
      )
    );

    if (headingElements.length === 0) {
      return [];
    }

    // フラットな見出しリストを作成
    const flatHeadings: HeadingNode[] = headingElements
      .map((element, index) => {
        const text = element.textContent?.trim() || '';

        // 空の見出しをスキップ
        if (ignoreEmpty && !text) {
          return null;
        }

        const level = parseInt(element.tagName.substring(1), 10);
        let id = element.getAttribute('id');

        // ID生成
        if (!id && generateIds) {
          id = generateHeadingId(text, level, index, idPrefix);
        }

        const node: HeadingNode = {
          level,
          text,
          id,
          element,
          children: [],
        };

        return node;
      })
      .filter((node): node is HeadingNode => node !== null);

    // 階層構造を構築
    const tree = buildHeadingTree(flatHeadings);

    // HeadingStructure型に変換
    return tree.map(node => convertToHeadingStructure(node, []));
  } catch (error) {
    console.error('見出し抽出エラー:', error);
    return [];
  }
}

/**
 * 見出しIDを生成
 * 
 * @param text - 見出しテキスト
 * @param level - 見出しレベル
 * @param index - インデックス
 * @param prefix - プレフィックス
 * @returns 生成されたID
 */
function generateHeadingId(
  text: string,
  level: number,
  index: number,
  prefix: string
): string {
  // テキストをスラグ化
  const slug = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
    .substring(0, 50); // 最大50文字

  return `${prefix}-${level}-${slug || `section-${index + 1}`}`;
}

/**
 * 見出しツリーを構築
 * 
 * @param flatHeadings - フラットな見出しリスト
 * @returns 階層構造を持つ見出しリスト
 */
function buildHeadingTree(flatHeadings: HeadingNode[]): HeadingNode[] {
  if (flatHeadings.length === 0) {
    return [];
  }

  const root: HeadingNode[] = [];
  const stack: HeadingNode[] = [];

  for (const heading of flatHeadings) {
    // スタックから現在のレベル以上の見出しを取り除く
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    // 親が存在する場合は子として追加、存在しない場合はルートに追加
    if (stack.length === 0) {
      root.push(heading);
    } else {
      stack[stack.length - 1].children.push(heading);
    }

    // スタックに追加
    stack.push(heading);
  }

  return root;
}

/**
 * HeadingNode を HeadingStructure に変換
 * 
 * @param node - HeadingNode
 * @param parentPath - 親のパス
 * @returns HeadingStructure
 */
function convertToHeadingStructure(
  node: HeadingNode,
  parentPath: string[]
): HeadingStructure {
  const currentPath = [...parentPath, node.text];

  return {
    level: node.level,
    text: node.text,
    id: node.id,
    path: currentPath,
    children: node.children.map(child =>
      convertToHeadingStructure(child, currentPath)
    ),
  };
}

/**
 * 見出しをフラット配列に変換
 * 
 * @param headings - 階層構造を持つ見出し
 * @returns フラットな見出し配列
 * 
 * @example
 * ```typescript
 * const flat = flattenHeadings(headings);
 * // [
 * //   { level: 1, text: 'タイトル', ... },
 * //   { level: 2, text: 'セクション1', ... },
 * //   { level: 3, text: 'サブセクション1-1', ... },
 * //   ...
 * // ]
 * ```
 */
export function flattenHeadings(headings: HeadingStructure[]): HeadingStructure[] {
  const result: HeadingStructure[] = [];

  function flatten(heading: HeadingStructure) {
    result.push({
      ...heading,
      children: [], // 子をクリア
    });

    for (const child of heading.children) {
      flatten(child);
    }
  }

  for (const heading of headings) {
    flatten(heading);
  }

  return result;
}

/**
 * 見出しからフラグメントIDを生成
 * 
 * @param heading - 見出し
 * @returns Fragment ID
 * 
 * @example
 * ```typescript
 * const fragmentId = generateFragmentId(heading);
 * // 'h2-03_p-05' (h2の3番目、段落5番目)
 * ```
 */
export function generateFragmentId(heading: HeadingStructure, index: number): string {
  // 見出しレベル + インデックス
  const levelPrefix = `h${heading.level}`;
  const indexStr = String(index + 1).padStart(2, '0');

  return `${levelPrefix}-${indexStr}`;
}

/**
 * 見出し統計を取得
 * 
 * @param headings - 見出し構造
 * @returns 統計情報
 */
export function getHeadingStats(headings: HeadingStructure[]): {
  total: number;
  byLevel: Record<number, number>;
  maxDepth: number;
  avgLength: number;
} {
  let total = 0;
  const byLevel: Record<number, number> = {};
  let maxDepth = 0;
  let totalLength = 0;

  function traverse(heading: HeadingStructure, depth: number) {
    total++;
    byLevel[heading.level] = (byLevel[heading.level] || 0) + 1;
    maxDepth = Math.max(maxDepth, depth);
    totalLength += heading.text.length;

    for (const child of heading.children) {
      traverse(child, depth + 1);
    }
  }

  for (const heading of headings) {
    traverse(heading, 1);
  }

  return {
    total,
    byLevel,
    maxDepth,
    avgLength: total > 0 ? Math.round(totalLength / total) : 0,
  };
}

/**
 * 見出しツリーを文字列として出力（デバッグ用）
 * 
 * @param headings - 見出し構造
 * @returns ツリー文字列
 * 
 * @example
 * ```typescript
 * console.log(printHeadingTree(headings));
 * // タイトル (h1) [heading-1-タイトル]
 * //   セクション1 (h2)
 * //     サブセクション1-1 (h3)
 * //   セクション2 (h2)
 * ```
 */
export function printHeadingTree(headings: HeadingStructure[]): string {
  const lines: string[] = [];

  function print(heading: HeadingStructure, indent: number) {
    const prefix = '  '.repeat(indent);
    const idInfo = heading.id ? ` [${heading.id}]` : '';
    lines.push(`${prefix}${heading.text} (h${heading.level})${idInfo}`);

    for (const child of heading.children) {
      print(child, indent + 1);
    }
  }

  for (const heading of headings) {
    print(heading, 0);
  }

  return lines.join('\n');
}

