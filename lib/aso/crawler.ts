/**
 * ASO SaaS - メインクローラー
 * 
 * @description
 * Puppeteerを使用したURLクローラー
 * 既存の構造化データシステムと統合可能
 * 
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import type {
  CrawlOptions,
  CrawlResult,
  BatchCrawlRequest,
  BatchCrawlResult,
  CrawlerConfig,
  CrawlerEventHandler,
} from './types/crawler';
import { extractHeadings } from './utils/heading-extractor';
import {
  extractMetadata,
  extractJsonLd,
  extractLinks,
  extractImages,
  extractPlainText,
  calculateContentStats,
} from './utils/metadata-extractor';

/**
 * デフォルトクローラー設定
 */
const DEFAULT_CRAWLER_CONFIG: CrawlerConfig = {
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
  defaultOptions: {
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (compatible; ASOBot/1.0; +https://nands.tech)',
    enableJavaScript: true,
    loadImages: false,
    loadCSS: false,
    viewport: {
      width: 1920,
      height: 1080,
    },
    waitAfterLoad: 1000,
    maxRetries: 3,
    debug: false,
  },
  concurrency: 3,
  requestDelay: 1000,
  useCache: false,
  cacheDuration: 3600,
};

/**
 * URLクローラークラス
 */
export class UrlCrawler {
  private config: CrawlerConfig;
  private browser: Browser | null = null;
  private eventHandlers: Set<CrawlerEventHandler> = new Set();

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      ...DEFAULT_CRAWLER_CONFIG,
      ...config,
      puppeteer: {
        ...DEFAULT_CRAWLER_CONFIG.puppeteer,
        ...config.puppeteer,
      },
      defaultOptions: {
        ...DEFAULT_CRAWLER_CONFIG.defaultOptions,
        ...config.defaultOptions,
      },
    };
  }

  /**
   * イベントハンドラを登録
   */
  on(handler: CrawlerEventHandler): void {
    this.eventHandlers.add(handler);
  }

  /**
   * イベントハンドラを解除
   */
  off(handler: CrawlerEventHandler): void {
    this.eventHandlers.delete(handler);
  }

  /**
   * イベントを発火
   */
  private emit(event: Parameters<CrawlerEventHandler>[0]): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('イベントハンドラエラー:', error);
      }
    });
  }

  /**
   * ブラウザを初期化
   */
  private async initBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    this.browser = await puppeteer.launch(this.config.puppeteer);
    return this.browser;
  }

  /**
   * ブラウザをクローズ
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 単一URLをクロール
   * 
   * @param url - クロール対象URL
   * @param options - クロールオプション
   * @returns クロール結果
   */
  async crawl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    const defaults = this.config.defaultOptions;
    const mergedOptions: Required<CrawlOptions> = {
      timeout: options.timeout ?? defaults.timeout ?? 30000,
      userAgent: options.userAgent ?? defaults.userAgent ?? 'Mozilla/5.0 (compatible; ASOBot/1.0)',
      enableJavaScript: options.enableJavaScript ?? defaults.enableJavaScript ?? true,
      loadImages: options.loadImages ?? defaults.loadImages ?? false,
      loadCSS: options.loadCSS ?? defaults.loadCSS ?? false,
      viewport: options.viewport ?? defaults.viewport ?? { width: 1920, height: 1080 },
      waitAfterLoad: options.waitAfterLoad ?? defaults.waitAfterLoad ?? 1000,
      maxRetries: options.maxRetries ?? defaults.maxRetries ?? 3,
      debug: options.debug ?? defaults.debug ?? false,
    };
    const startTime = Date.now();
    let retryCount = 0;

    this.emit({ type: 'start', url });

    while (retryCount <= mergedOptions.maxRetries) {
      try {
        const result = await this.crawlWithRetry(url, mergedOptions, retryCount);
        
        if (result.success) {
          this.emit({ type: 'success', url, result });
          return result;
        }

        // リトライ
        retryCount++;
        if (retryCount <= mergedOptions.maxRetries) {
          this.emit({ type: 'retry', url, retryCount });
          await this.delay(1000 * retryCount); // 指数バックオフ
        }
      } catch (error) {
        retryCount++;
        if (retryCount > mergedOptions.maxRetries) {
          const errorResult = this.createErrorResult(
            url,
            error as Error,
            retryCount - 1,
            Date.now() - startTime
          );
          this.emit({ type: 'error', url, error: error as Error });
          return errorResult;
        }
        this.emit({ type: 'retry', url, retryCount });
        await this.delay(1000 * retryCount);
      }
    }

    // ここには到達しないはずだが、型安全のため
    return this.createErrorResult(
      url,
      new Error('Max retries exceeded'),
      retryCount,
      Date.now() - startTime
    );
  }

  /**
   * リトライ付きクロール
   */
  private async crawlWithRetry(
    url: string,
    options: Required<CrawlOptions>,
    retryCount: number
  ): Promise<CrawlResult> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // ページ設定
      await this.configurePage(page, options);

      // ページに移動
      const response = await page.goto(url, {
        timeout: options.timeout,
        waitUntil: 'domcontentloaded',
      });

      if (!response) {
        throw new Error('No response from page');
      }

      const statusCode = response.status();

      // 4xx, 5xxエラー
      if (statusCode >= 400) {
        throw new Error(`HTTP ${statusCode}`);
      }

      // 待機
      await this.delay(options.waitAfterLoad);

      // 最終URL（リダイレクト後）
      const finalUrl = page.url();

      // HTMLを取得
      const html = await page.content();

      // パース
      const result = await this.parseHtml(html, url, finalUrl, statusCode, retryCount);

      return result;
    } finally {
      await page.close();
    }
  }

  /**
   * ページを設定
   */
  private async configurePage(page: Page, options: Required<CrawlOptions>): Promise<void> {
    // ビューポート
    if (options.viewport) {
      await page.setViewport(options.viewport);
    }

    // ユーザーエージェント
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent);
    }

    // JavaScript有効/無効
    await page.setJavaScriptEnabled(options.enableJavaScript);

    // リソース読み込み制御（画像、CSS、フォント等）
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();

      if (!options.loadImages && (resourceType === 'image' || resourceType === 'media')) {
        request.abort();
      } else if (!options.loadCSS && (resourceType === 'stylesheet' || resourceType === 'font')) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // デバッグログ
    if (options.debug) {
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('pageerror', error => console.error('PAGE ERROR:', error));
    }
  }

  /**
   * HTMLをパース
   */
  private async parseHtml(
    html: string,
    originalUrl: string,
    finalUrl: string,
    statusCode: number,
    retryCount: number
  ): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // メタデータ抽出
      const metadata = extractMetadata(html, finalUrl);

      // body要素のみ抽出
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const htmlBody = bodyMatch ? bodyMatch[1] : html;

      // プレーンテキスト抽出
      const plainText = extractPlainText(html);

      // 見出し抽出
      const headings = extractHeadings(htmlBody);

      // リンク抽出
      const links = extractLinks(htmlBody, finalUrl);

      // 画像抽出
      const images = extractImages(htmlBody, finalUrl);

      // JSON-LD抽出
      const jsonLd = extractJsonLd(html);

      // コンテンツ統計
      const internalLinkCount = links.filter(link => link.isInternal).length;
      const stats = calculateContentStats(
        plainText,
        headings.length,
        links.length,
        images.length,
        internalLinkCount
      );

      // エンティティ候補（簡易実装：頻出単語）
      const entities = this.extractSimpleEntities(plainText);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        url: originalUrl,
        finalUrl,
        statusCode,
        metadata,
        htmlBody,
        plainText,
        headings,
        links,
        images,
        jsonLd,
        stats,
        entities,
        crawledAt: new Date(),
        processingTime,
        retryCount,
      };
    } catch (error) {
      throw new Error(`HTML parsing failed: ${(error as Error).message}`);
    }
  }

  /**
   * 簡易エンティティ抽出（頻出単語ベース）
   */
  private extractSimpleEntities(text: string): Array<{
    type: 'Person' | 'Organization' | 'Product' | 'Service' | 'Event' | 'Place' | 'Other';
    text: string;
    frequency: number;
    confidence: number;
    context: string[];
  }> {
    // 簡易実装：頻出単語をエンティティ候補とする
    // 本格実装では、LLMやNLPライブラリを使用
    const words = text.match(/[\u4e00-\u9faf]{2,}|[a-zA-Z]{3,}/g) || [];
    const wordCount = new Map<string, number>();

    words.forEach(word => {
      if (word.length < 2) return;
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // 頻度上位10件
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, freq]) => ({
        type: 'Other' as const,
        text: word,
        frequency: freq,
        confidence: Math.min(freq / 10, 1), // 簡易信頼度
        context: [],
      }));
  }

  /**
   * エラー結果を作成
   */
  private createErrorResult(
    url: string,
    error: Error,
    retryCount: number,
    processingTime: number
  ): CrawlResult {
    return {
      success: false,
      url,
      finalUrl: url,
      statusCode: 0,
      metadata: {
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
      },
      htmlBody: '',
      plainText: '',
      headings: [],
      links: [],
      images: [],
      jsonLd: [],
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
      entities: [],
      crawledAt: new Date(),
      processingTime,
      error: error.message,
      errorStack: error.stack,
      retryCount,
    };
  }

  /**
   * バッチクロール
   * 
   * @param request - バッチクロールリクエスト
   * @returns バッチクロール結果
   */
  async batchCrawl(request: BatchCrawlRequest): Promise<BatchCrawlResult> {
    const { urls, options, concurrency = this.config.concurrency, onProgress, onError } = request;

    const results: CrawlResult[] = [];
    const errors: BatchCrawlResult['errors'] = [];
    const startTime = Date.now();

    // 並列実行
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);

      const batchResults = await Promise.allSettled(
        batch.map(url => this.crawl(url, options))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const crawlResult = result.value;
          if (crawlResult.success) {
            results.push(crawlResult);
          } else {
            errors.push({
              url: crawlResult.url,
              error: crawlResult.error || 'Unknown error',
              errorStack: crawlResult.errorStack,
            });
            onError?.(crawlResult.url, new Error(crawlResult.error));
          }
          onProgress?.(results.length + errors.length, urls.length, crawlResult);
        } else {
          const url = batch[index];
          errors.push({
            url,
            error: result.reason?.message || 'Unknown error',
            errorStack: result.reason?.stack,
          });
          onError?.(url, result.reason);
        }
      });

      // 次のバッチまで待機
      if (i + concurrency < urls.length) {
        await this.delay(this.config.requestDelay);
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0;

    const stats = {
      total: urls.length,
      success: results.length,
      failed: errors.length,
      averageTime: avgTime,
      totalTime,
    };

    this.emit({ type: 'complete', stats });

    return {
      results,
      errors,
      stats,
    };
  }

  /**
   * 待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 単一URLをクロール（シンプルAPI）
 * 
 * @param url - クロール対象URL
 * @param options - クロールオプション
 * @returns クロール結果
 */
export async function crawlUrl(url: string, options?: CrawlOptions): Promise<CrawlResult> {
  const crawler = new UrlCrawler();
  try {
    return await crawler.crawl(url, options);
  } finally {
    await crawler.close();
  }
}

/**
 * 複数URLをバッチクロール（シンプルAPI）
 * 
 * @param request - バッチクロールリクエスト
 * @returns バッチクロール結果
 */
export async function batchCrawlUrls(request: BatchCrawlRequest): Promise<BatchCrawlResult> {
  const crawler = new UrlCrawler();
  try {
    return await crawler.batchCrawl(request);
  } finally {
    await crawler.close();
  }
}

