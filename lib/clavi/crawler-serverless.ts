/**
 * CLAVI SaaS - Serverless Crawler
 *
 * @description
 * Fetch + Cheerio based crawler for Vercel serverless environment.
 * Puppeteer requires Chrome binary which isn't available on Vercel.
 * This provides a lightweight alternative using fetch and cheerio.
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-21
 */

import * as cheerio from 'cheerio';
import type { CrawlOptions, CrawlResult } from './types/crawler';

/**
 * Default User-Agent for crawling
 */
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; CLAVIBot/1.0; +https://nands.tech)';

/**
 * Serverless-compatible URL crawler using fetch + cheerio
 *
 * @param url - URL to crawl
 * @param options - Crawl options
 * @returns Crawl result
 */
export async function crawlUrlServerless(url: string, options?: CrawlOptions): Promise<CrawlResult> {
  const startTime = Date.now();
  const timeout = options?.timeout ?? 30000;
  const maxRetries = options?.maxRetries ?? 3;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': options?.userAgent ?? DEFAULT_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en;q=0.9',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const processingTime = Date.now() - startTime;

      // Extract metadata
      const metadata = extractMetadataFromCheerio($, url);

      // Extract headings
      const headings = extractHeadingsFromCheerio($);

      // Extract plain text
      const plainText = extractPlainTextFromCheerio($);

      // Extract links
      const links = extractLinksFromCheerio($, url);

      // Extract images
      const images = extractImagesFromCheerio($, url);

      // Extract JSON-LD
      const jsonLd = extractJsonLdFromCheerio($);

      // Extract entities (simplified version)
      const entities = extractEntitiesFromContent(plainText, metadata);

      // Calculate stats
      const stats = calculateStats(plainText, links);

      return {
        success: true,
        statusCode: response.status,
        url,
        finalUrl: response.url,
        crawledAt: new Date(),
        processingTime,
        retryCount: attempt - 1,
        htmlBody: $.html('body') || '',
        metadata: {
          ...metadata,
          lang: $('html').attr('lang') || null,
          publishedTime: $('meta[property="article:published_time"]').attr('content') || null,
          modifiedTime: $('meta[property="article:modified_time"]').attr('content') || null,
        },
        headings: headings.map(h => ({ ...h, path: [], children: [] })),
        links: links.map(l => ({ ...l, isNofollow: l.rel?.includes('nofollow') || false })),
        images: images.map(i => ({ ...i, title: null, loading: null })),
        plainText,
        jsonLd,
        entities: entities.map(e => ({ ...e, type: e.type as 'Person' | 'Organization' | 'Product' | 'Service' | 'Event' | 'Place' | 'Other', frequency: 1, confidence: 0.5, context: [] as string[] })),
        stats: {
          ...stats,
          totalChars: stats.charCount,
          paragraphCount: Math.floor(stats.charCount / 300),
          readingTime: Math.ceil(stats.wordCount / 200),
        },
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Crawler] Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return {
    success: false,
    statusCode: 0,
    url,
    finalUrl: url,
    crawledAt: new Date(),
    processingTime: Date.now() - startTime,
    retryCount: maxRetries,
    error: lastError?.message ?? 'Unknown error',
    htmlBody: '',
    metadata: {
      title: null,
      description: null,
      canonical: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      ogType: null,
      twitterCard: null,
      robots: null,
      charset: null,
      author: null,
      keywords: null,
      lang: null,
      publishedTime: null,
      modifiedTime: null,
    },
    headings: [],
    links: [],
    images: [],
    plainText: '',
    jsonLd: [],
    entities: [],
    stats: {
      totalChars: 0,
      wordCount: 0,
      paragraphCount: 0,
      headingCount: 0,
      linkCount: 0,
      imageCount: 0,
      internalLinkCount: 0,
      externalLinkCount: 0,
      readingTime: 0,
    },
  };
}

/**
 * Extract metadata from Cheerio document
 */
function extractMetadataFromCheerio($: cheerio.CheerioAPI, url: string) {
  const getMetaContent = (name: string): string | null => {
    return $(`meta[name="${name}"]`).attr('content')
      ?? $(`meta[property="${name}"]`).attr('content')
      ?? null;
  };

  const baseUrl = new URL(url).origin;
  const faviconHref = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href');

  return {
    title: $('title').text().trim() || '',
    description: getMetaContent('description') || '',
    canonical: $('link[rel="canonical"]').attr('href') || null,
    ogTitle: getMetaContent('og:title'),
    ogDescription: getMetaContent('og:description'),
    ogImage: getMetaContent('og:image'),
    ogUrl: getMetaContent('og:url'),
    ogType: getMetaContent('og:type'),
    twitterCard: getMetaContent('twitter:card'),
    twitterTitle: getMetaContent('twitter:title'),
    twitterDescription: getMetaContent('twitter:description'),
    twitterImage: getMetaContent('twitter:image'),
    robots: getMetaContent('robots'),
    viewport: getMetaContent('viewport'),
    charset: $('meta[charset]').attr('charset') || null,
    language: $('html').attr('lang') || null,
    author: getMetaContent('author'),
    keywords: getMetaContent('keywords'),
    generator: getMetaContent('generator'),
    favicon: faviconHref ? new URL(faviconHref, baseUrl).href : null,
  };
}

/**
 * Extract headings from Cheerio document
 */
function extractHeadingsFromCheerio($: cheerio.CheerioAPI) {
  const headings: Array<{ level: number; text: string; id: string | null }> = [];

  $('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const $el = $(element);
    const tagName = element.tagName?.toLowerCase() || 'h1';
    const level = parseInt(tagName.charAt(1), 10) || 1;
    const text = $el.text().trim();
    const id = $el.attr('id') || null;

    if (text) {
      headings.push({ level, text, id });
    }
  });

  return headings;
}

/**
 * Extract plain text from Cheerio document
 */
function extractPlainTextFromCheerio($: cheerio.CheerioAPI): string {
  // Remove script, style, and other non-content elements
  $('script, style, noscript, iframe, svg, nav, footer, header').remove();

  // Get text from body or main content
  const main = $('main, article, [role="main"]');
  const body = main.length > 0 ? main : $('body');

  return body.text()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50000); // Limit to 50K chars
}

/**
 * Extract links from Cheerio document
 */
function extractLinksFromCheerio($: cheerio.CheerioAPI, baseUrl: string) {
  const links: Array<{ href: string; text: string; isInternal: boolean; rel: string | null }> = [];
  const baseOrigin = new URL(baseUrl).origin;

  $('a[href]').each((_, element) => {
    const $el = $(element);
    const href = $el.attr('href');

    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
      return;
    }

    try {
      const absoluteUrl = new URL(href, baseUrl).href;
      const isInternal = absoluteUrl.startsWith(baseOrigin);

      links.push({
        href: absoluteUrl,
        text: $el.text().trim().substring(0, 200),
        isInternal,
        rel: $el.attr('rel') || null,
      });
    } catch {
      // Invalid URL, skip
    }
  });

  return links.slice(0, 200); // Limit to 200 links
}

/**
 * Extract images from Cheerio document
 */
function extractImagesFromCheerio($: cheerio.CheerioAPI, baseUrl: string) {
  const images: Array<{ src: string; alt: string | null; width: number | null; height: number | null }> = [];

  $('img[src]').each((_, element) => {
    const $el = $(element);
    const src = $el.attr('src');

    if (!src || src.startsWith('data:')) {
      return;
    }

    try {
      const absoluteUrl = new URL(src, baseUrl).href;

      images.push({
        src: absoluteUrl,
        alt: $el.attr('alt') || null,
        width: parseInt($el.attr('width') || '', 10) || null,
        height: parseInt($el.attr('height') || '', 10) || null,
      });
    } catch {
      // Invalid URL, skip
    }
  });

  return images.slice(0, 100); // Limit to 100 images
}

/**
 * Extract JSON-LD from Cheerio document
 */
function extractJsonLdFromCheerio($: cheerio.CheerioAPI): any[] {
  const jsonLd: any[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const content = $(element).html();
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          jsonLd.push(...parsed);
        } else {
          jsonLd.push(parsed);
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  return jsonLd;
}

/**
 * Extract entities from content (simplified version)
 */
function extractEntitiesFromContent(
  plainText: string,
  metadata: { title: string; description: string }
): Array<{ type: string; text: string }> {
  const entities: Array<{ type: string; text: string }> = [];

  // Extract organization name from title (common pattern: "Page Title | Company Name")
  const titleParts = metadata.title.split(/[|｜\-–—]/);
  if (titleParts.length > 1) {
    const orgName = titleParts[titleParts.length - 1].trim();
    if (orgName && orgName.length > 2 && orgName.length < 100) {
      entities.push({ type: 'Organization', text: orgName });
    }
  }

  return entities;
}

/**
 * Calculate content stats
 */
function calculateStats(
  plainText: string,
  links: Array<{ isInternal: boolean }>
) {
  const words = plainText.split(/\s+/).filter(w => w.length > 0);
  const internalLinks = links.filter(l => l.isInternal).length;
  const externalLinks = links.filter(l => !l.isInternal).length;

  return {
    wordCount: words.length,
    charCount: plainText.length,
    headingCount: 0, // Will be updated by caller
    linkCount: links.length,
    imageCount: 0, // Will be updated by caller
    internalLinkCount: internalLinks,
    externalLinkCount: externalLinks,
  };
}

/**
 * Convenience function to check if running in serverless environment
 */
export function isServerlessEnvironment(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );
}
