import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import remarkSlug from 'remark-slug';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ParsedMarkdown {
  htmlContent: string;
  toc: TocItem[];
}

export async function parseMarkdown(markdown: string): Promise<ParsedMarkdown> {
  // 目次アイテムを収集
  const tocItems: TocItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    tocItems.push({
      id,
      text,
      level,
    });
  }

  // マークダウンをHTMLに変換
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, {
      heading: '目次',
      tight: true,
    })
    .use(remarkSlug)
    .use(remarkHtml)
    .process(markdown);

  return {
    htmlContent: processedContent.toString(),
    toc: tocItems,
  };
} 