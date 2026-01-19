/**
 * ASO SaaS - メタデータ抽出ユーティリティ
 * 
 * @description
 * HTMLからSEO/AIO最適化に必要なメタデータを抽出
 * 
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 */

import { JSDOM } from 'jsdom';
import type { HtmlMetadata, JsonLdInfo, LinkInfo, ImageInfo } from '../types/crawler';

/**
 * メタデータを抽出
 * 
 * @param html - HTML文字列
 * @param url - ページURL
 * @returns HTMLメタデータ
 */
export function extractMetadata(html: string, url: string): HtmlMetadata {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    return {
      title: getTitle(document),
      description: getMetaContent(document, 'description'),
      keywords: getMetaContent(document, 'keywords'),
      canonical: getCanonicalUrl(document, url),
      ogImage: getOgMeta(document, 'image'),
      ogTitle: getOgMeta(document, 'title'),
      ogDescription: getOgMeta(document, 'description'),
      ogType: getOgMeta(document, 'type'),
      twitterCard: getTwitterMeta(document, 'card'),
      lang: document.documentElement.getAttribute('lang'),
      charset: getCharset(document),
      robots: getMetaContent(document, 'robots'),
      author: getMetaContent(document, 'author'),
      publishedTime: getOgMeta(document, 'article:published_time'),
      modifiedTime: getOgMeta(document, 'article:modified_time'),
    };
  } catch (error) {
    console.error('メタデータ抽出エラー:', error);
    return createEmptyMetadata();
  }
}

/**
 * タイトルを取得
 */
function getTitle(document: Document): string | null {
  const titleElement = document.querySelector('title');
  return titleElement?.textContent?.trim() || null;
}

/**
 * メタタグの内容を取得
 */
function getMetaContent(document: Document, name: string): string | null {
  const metaElement = document.querySelector(`meta[name="${name}"]`);
  return metaElement?.getAttribute('content')?.trim() || null;
}

/**
 * OGPメタタグを取得
 */
function getOgMeta(document: Document, property: string): string | null {
  const ogElement = document.querySelector(`meta[property="og:${property}"]`);
  return ogElement?.getAttribute('content')?.trim() || null;
}

/**
 * Twitter Cardメタタグを取得
 */
function getTwitterMeta(document: Document, name: string): string | null {
  const twitterElement = document.querySelector(`meta[name="twitter:${name}"]`);
  return twitterElement?.getAttribute('content')?.trim() || null;
}

/**
 * 正規URLを取得
 */
function getCanonicalUrl(document: Document, fallbackUrl: string): string | null {
  const canonicalElement = document.querySelector('link[rel="canonical"]');
  return canonicalElement?.getAttribute('href')?.trim() || fallbackUrl;
}

/**
 * 文字エンコーディングを取得
 */
function getCharset(document: Document): string | null {
  const charsetMeta = document.querySelector('meta[charset]');
  if (charsetMeta) {
    return charsetMeta.getAttribute('charset');
  }

  const contentTypeMeta = document.querySelector('meta[http-equiv="Content-Type"]');
  if (contentTypeMeta) {
    const content = contentTypeMeta.getAttribute('content');
    const match = content?.match(/charset=([^;]+)/);
    return match?.[1]?.trim() || null;
  }

  return null;
}

/**
 * 空のメタデータを作成
 */
function createEmptyMetadata(): HtmlMetadata {
  return {
    title: null,
    description: null,
    keywords: null,
    canonical: null,
    ogImage: null,
    ogTitle: null,
    ogDescription: null,
    ogType: null,
    twitterCard: null,
    lang: null,
    charset: null,
    robots: null,
    author: null,
    publishedTime: null,
    modifiedTime: null,
  };
}

/**
 * JSON-LDを抽出
 * 
 * @param html - HTML文字列
 * @returns JSON-LD情報の配列
 */
export function extractJsonLd(html: string): JsonLdInfo[] {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const jsonLdScripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );

    return jsonLdScripts
      .map(script => {
        try {
          const raw = script.textContent?.trim() || '';
          if (!raw) return null;

          const data = JSON.parse(raw);
          const type = data['@type'] || 'Unknown';
          const context = data['@context'] || null;

          return {
            type,
            context,
            data,
            raw,
          };
        } catch (error) {
          console.error('JSON-LDパースエラー:', error);
          return null;
        }
      })
      .filter((item): item is JsonLdInfo => item !== null);
  } catch (error) {
    console.error('JSON-LD抽出エラー:', error);
    return [];
  }
}

/**
 * リンクを抽出
 * 
 * @param html - HTML文字列
 * @param baseUrl - ベースURL
 * @returns リンク情報の配列
 */
export function extractLinks(html: string, baseUrl: string): LinkInfo[] {
  try {
    const dom = new JSDOM(html, { url: baseUrl });
    const document = dom.window.document;

    const linkElements = Array.from(document.querySelectorAll('a[href]'));

    return linkElements
      .map(element => {
        const href = element.getAttribute('href')?.trim();
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
          return null;
        }

        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          const baseHostname = new URL(baseUrl).hostname;
          const linkHostname = new URL(absoluteUrl).hostname;

          const text = element.textContent?.trim() || '';
          const rel = element.getAttribute('rel');
          const isInternal = linkHostname === baseHostname;
          const isNofollow = rel?.includes('nofollow') || false;

          return {
            text,
            href: absoluteUrl,
            rel,
            isInternal,
            isNofollow,
          };
        } catch (error) {
          return null;
        }
      })
      .filter((link): link is LinkInfo => link !== null);
  } catch (error) {
    console.error('リンク抽出エラー:', error);
    return [];
  }
}

/**
 * 画像を抽出
 * 
 * @param html - HTML文字列
 * @param baseUrl - ベースURL
 * @returns 画像情報の配列
 */
export function extractImages(html: string, baseUrl: string): ImageInfo[] {
  try {
    const dom = new JSDOM(html, { url: baseUrl });
    const document = dom.window.document;

    const imageElements = Array.from(document.querySelectorAll('img[src]'));

    return imageElements
      .map(element => {
        const src = element.getAttribute('src')?.trim();
        if (!src) return null;

        try {
          const absoluteUrl = new URL(src, baseUrl).href;

          const alt = element.getAttribute('alt')?.trim() || null;
          const title = element.getAttribute('title')?.trim() || null;
          const widthAttr = element.getAttribute('width');
          const heightAttr = element.getAttribute('height');
          const loading = element.getAttribute('loading');

          return {
            src: absoluteUrl,
            alt,
            title,
            width: widthAttr ? parseInt(widthAttr, 10) : null,
            height: heightAttr ? parseInt(heightAttr, 10) : null,
            loading,
          };
        } catch (error) {
          return null;
        }
      })
      .filter((image): image is ImageInfo => image !== null);
  } catch (error) {
    console.error('画像抽出エラー:', error);
    return [];
  }
}

/**
 * プレーンテキストを抽出
 * 
 * @param html - HTML文字列
 * @returns プレーンテキスト
 */
export function extractPlainText(html: string): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // script, style, noscriptタグを削除
    const removeElements = document.querySelectorAll('script, style, noscript, iframe');
    removeElements.forEach(element => element.remove());

    // bodyのテキストを取得
    const body = document.querySelector('body');
    const text = body?.textContent || '';

    // 連続する空白・改行を1つのスペースに
    return text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('プレーンテキスト抽出エラー:', error);
    return '';
  }
}

/**
 * コンテンツ統計を計算
 * 
 * @param plainText - プレーンテキスト
 * @param headingCount - 見出し数
 * @param linkCount - リンク数
 * @param imageCount - 画像数
 * @param internalLinkCount - 内部リンク数
 * @returns コンテンツ統計
 */
export function calculateContentStats(
  plainText: string,
  headingCount: number,
  linkCount: number,
  imageCount: number,
  internalLinkCount: number
): {
  totalChars: number;
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  readingTime: number;
} {
  const totalChars = plainText.length;

  // 日本語文字と英単語を分けてカウント
  const japaneseChars = (plainText.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g) || []).length;
  const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length;
  const wordCount = japaneseChars + englishWords;

  // 段落数（簡易計算：改行または句点で分割）
  const paragraphCount = Math.max(
    (plainText.match(/\n\n+/g) || []).length + 1,
    (plainText.match(/[。！？]/g) || []).length
  );

  // 読了時間（分）: 日本語400文字/分、英語200単語/分
  const japaneseReadingTime = japaneseChars / 400;
  const englishReadingTime = englishWords / 200;
  const readingTime = Math.ceil(japaneseReadingTime + englishReadingTime);

  return {
    totalChars,
    wordCount,
    paragraphCount,
    headingCount,
    linkCount,
    imageCount,
    internalLinkCount,
    externalLinkCount: linkCount - internalLinkCount,
    readingTime: Math.max(1, readingTime), // 最低1分
  };
}

