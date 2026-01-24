/**
 * CLAVI SaaS - URLクローラー型定義
 * 
 * @description
 * Puppeteerを使用したURLクローラーの型定義
 * 既存の構造化データシステムと統合可能
 * 
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 */

import { Page } from 'puppeteer';

// ========================================
// クロール設定
// ========================================

/**
 * クロールオプション
 */
export interface CrawlOptions {
  /**
   * タイムアウト（ミリ秒）
   * @default 30000
   */
  timeout?: number;

  /**
   * ユーザーエージェント
   * @default 'Mozilla/5.0 (compatible; CLAVIBot/1.0)'
   */
  userAgent?: string;

  /**
   * JavaScriptを有効にするか
   * @default true
   */
  enableJavaScript?: boolean;

  /**
   * 画像読み込みを有効にするか（高速化のため無効化推奨）
   * @default false
   */
  loadImages?: boolean;

  /**
   * CSSを読み込むか（高速化のため無効化推奨）
   * @default false
   */
  loadCSS?: boolean;

  /**
   * ビューポートサイズ
   */
  viewport?: {
    width: number;
    height: number;
  };

  /**
   * 待機時間（ページ読み込み後、ミリ秒）
   * @default 1000
   */
  waitAfterLoad?: number;

  /**
   * リトライ回数
   * @default 3
   */
  maxRetries?: number;

  /**
   * デバッグモード
   * @default false
   */
  debug?: boolean;
}

// ========================================
// クロール結果
// ========================================

/**
 * HTMLメタデータ
 */
export interface HtmlMetadata {
  /** ページタイトル */
  title: string | null;

  /** メタディスクリプション */
  description: string | null;

  /** メタキーワード */
  keywords: string | null;

  /** 正規URL */
  canonical: string | null;

  /** OGP画像 */
  ogImage: string | null;

  /** OGPタイトル */
  ogTitle: string | null;

  /** OGPディスクリプション */
  ogDescription: string | null;

  /** OGPタイプ */
  ogType: string | null;

  /** Twitter Card */
  twitterCard: string | null;

  /** 言語 */
  lang: string | null;

  /** 文字エンコーディング */
  charset: string | null;

  /** robots */
  robots: string | null;

  /** 著者 */
  author: string | null;

  /** 公開日 */
  publishedTime: string | null;

  /** 更新日 */
  modifiedTime: string | null;
}

/**
 * 見出し構造
 */
export interface HeadingStructure {
  /** レベル（1-6） */
  level: number;

  /** テキスト */
  text: string;

  /** ID属性 */
  id: string | null;

  /** 階層（親見出しからのパス） */
  path: string[];

  /** 子見出し */
  children: HeadingStructure[];
}

/**
 * リンク情報
 */
export interface LinkInfo {
  /** リンクテキスト */
  text: string;

  /** URL */
  href: string;

  /** rel属性 */
  rel: string | null;

  /** 内部リンクか */
  isInternal: boolean;

  /** nofollow属性があるか */
  isNofollow: boolean;
}

/**
 * 画像情報
 */
export interface ImageInfo {
  /** 画像URL */
  src: string;

  /** alt属性 */
  alt: string | null;

  /** title属性 */
  title: string | null;

  /** 幅 */
  width: number | null;

  /** 高さ */
  height: number | null;

  /** loading属性 */
  loading: string | null;
}

/**
 * JSON-LD情報
 */
export interface JsonLdInfo {
  /** @type */
  type: string;

  /** @context */
  context: string | null;

  /** JSON-LD全体（パース済み） */
  data: Record<string, any>;

  /** 生のJSON文字列 */
  raw: string;
}

/**
 * コンテンツ統計
 */
export interface ContentStats {
  /** 総文字数 */
  totalChars: number;

  /** 単語数 */
  wordCount: number;

  /** 段落数 */
  paragraphCount: number;

  /** 見出し数 */
  headingCount: number;

  /** リンク数 */
  linkCount: number;

  /** 画像数 */
  imageCount: number;

  /** 内部リンク数 */
  internalLinkCount: number;

  /** 外部リンク数 */
  externalLinkCount: number;

  /** 読了時間（分） */
  readingTime: number;
}

/**
 * エンティティ候補
 */
export interface EntityCandidate {
  /** エンティティタイプ */
  type: 'Person' | 'Organization' | 'Product' | 'Service' | 'Event' | 'Place' | 'Other';

  /** テキスト */
  text: string;

  /** 出現回数 */
  frequency: number;

  /** 信頼度（0-1） */
  confidence: number;

  /** コンテキスト（周辺テキスト） */
  context: string[];
}

/**
 * クロール結果
 */
export interface CrawlResult {
  /** クロール成功か */
  success: boolean;

  /** URL */
  url: string;

  /** 最終URL（リダイレクト後） */
  finalUrl: string;

  /** HTTPステータスコード */
  statusCode: number;

  /** HTMLメタデータ */
  metadata: HtmlMetadata;

  /** HTML本文（bodyタグ内） */
  htmlBody: string;

  /** プレーンテキスト（HTMLタグ除去後） */
  plainText: string;

  /** 見出し構造 */
  headings: HeadingStructure[];

  /** リンク一覧 */
  links: LinkInfo[];

  /** 画像一覧 */
  images: ImageInfo[];

  /** JSON-LD一覧 */
  jsonLd: JsonLdInfo[];

  /** コンテンツ統計 */
  stats: ContentStats;

  /** エンティティ候補 */
  entities: EntityCandidate[];

  /** クロール時刻 */
  crawledAt: Date;

  /** 処理時間（ミリ秒） */
  processingTime: number;

  /** エラーメッセージ（失敗時） */
  error?: string;

  /** エラースタック（失敗時） */
  errorStack?: string;

  /** リトライ回数 */
  retryCount: number;
}

// ========================================
// クローラー設定
// ========================================

/**
 * クローラー設定
 */
export interface CrawlerConfig {
  /** Puppeteer起動オプション */
  puppeteer: {
    /** ヘッドレスモード */
    headless: boolean;

    /** 引数 */
    args: string[];

    /** 実行パス */
    executablePath?: string;
  };

  /** デフォルトのクロールオプション */
  defaultOptions: CrawlOptions;

  /** 同時実行数 */
  concurrency: number;

  /** リクエスト間隔（ミリ秒） */
  requestDelay: number;

  /** キャッシュを使用するか */
  useCache: boolean;

  /** キャッシュの有効期限（秒） */
  cacheDuration: number;
}

// ========================================
// キャッシュ
// ========================================

/**
 * キャッシュエントリ
 */
export interface CacheEntry {
  /** URL */
  url: string;

  /** クロール結果 */
  result: CrawlResult;

  /** キャッシュ作成時刻 */
  cachedAt: Date;

  /** 有効期限 */
  expiresAt: Date;
}

// ========================================
// バッチクロール
// ========================================

/**
 * バッチクロールリクエスト
 */
export interface BatchCrawlRequest {
  /** URL一覧 */
  urls: string[];

  /** オプション */
  options?: CrawlOptions;

  /** 並列実行数 */
  concurrency?: number;

  /** プログレスコールバック */
  onProgress?: (completed: number, total: number, result: CrawlResult) => void;

  /** エラーコールバック */
  onError?: (url: string, error: Error) => void;
}

/**
 * バッチクロール結果
 */
export interface BatchCrawlResult {
  /** 成功した結果 */
  results: CrawlResult[];

  /** 失敗したURL */
  errors: Array<{
    url: string;
    error: string;
    errorStack?: string;
  }>;

  /** 統計 */
  stats: {
    total: number;
    success: number;
    failed: number;
    averageTime: number;
    totalTime: number;
  };
}

// ========================================
// ユーティリティ型
// ========================================

/**
 * Puppeteerページコンテキスト
 */
export interface PuppeteerContext {
  /** Puppeteerページインスタンス */
  page: Page;

  /** ブラウザインスタンス */
  browser: any;

  /** クロールオプション */
  options: CrawlOptions;
}

/**
 * クローラーイベント
 */
export type CrawlerEvent = 
  | { type: 'start'; url: string }
  | { type: 'success'; url: string; result: CrawlResult }
  | { type: 'error'; url: string; error: Error }
  | { type: 'retry'; url: string; retryCount: number }
  | { type: 'complete'; stats: BatchCrawlResult['stats'] };

/**
 * クローラーイベントハンドラ
 */
export type CrawlerEventHandler = (event: CrawlerEvent) => void;

