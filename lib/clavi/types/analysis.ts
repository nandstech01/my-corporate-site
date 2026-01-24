/**
 * CLAVI SaaS - 分析データ型定義
 *
 * @description
 * URL分析APIの出力データ型定義
 * Phase 4.1で追加されたFragment ID関連の型を含む
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-17
 */

import type {
  HtmlMetadata,
  ContentStats,
  LinkInfo,
  ImageInfo,
  JsonLdInfo,
  EntityCandidate
} from './crawler';

// HasPartSchemaを共有モジュールからインポート・再エクスポート
import type { HasPartSchema } from '@/lib/structured-data/haspart-schema-system';
export type { HasPartSchema };

// ========================================
// 分析データ構造
// ========================================

/**
 * クロール情報
 */
export interface CrawlInfo {
  /** HTTPステータスコード */
  status_code: number;

  /** 最終URL（リダイレクト後） */
  final_url: string;

  /** クロール日時 */
  crawled_at: Date;

  /** 処理時間（ミリ秒） */
  processing_time: number;
}

/**
 * コンテンツ情報
 */
export interface ContentInfo {
  /** プレーンテキスト（最大10,000文字） */
  plain_text: string;

  /** コンテンツ統計 */
  stats: ContentStats;
}

/**
 * 簡略化された見出し情報
 */
export interface HeadingInfo {
  /** レベル（1-6） */
  level: number;

  /** テキスト */
  text: string;

  /** ID属性 */
  id: string | null;
}

/**
 * 分析データ（analysis_data）
 *
 * @description
 * URL分析APIの出力データ構造
 * Supabaseのclient_analysesテーブルに保存される
 */
export interface AnalysisData {
  /** クロール情報 */
  crawl: CrawlInfo;

  /** HTMLメタデータ */
  metadata: HtmlMetadata;

  /** コンテンツ情報 */
  content: ContentInfo;

  /** 見出し一覧（最大制限なし） */
  headings: HeadingInfo[];

  /** リンク一覧（最大100件） */
  links: LinkInfo[];

  /** 画像一覧（最大50件） */
  images: ImageInfo[];

  /** JSON-LD一覧 */
  jsonLd: JsonLdInfo[];

  /** エンティティ候補（最大20件） */
  entities: EntityCandidate[];

  // Phase 4.1 追加フィールド（オプショナル）

  /** Fragment ID一覧 */
  fragment_ids?: string[];

  /** Fragment Schema一覧（HasPartSchema互換） */
  fragment_schemas?: HasPartSchema[];

  // Phase 8 追加フィールド（オプショナル）

  /** 生成・マージ済みJSON-LDスキーマ */
  structured_data?: any;

  /** スキーママージレポート */
  merge_report?: {
    /** 衝突情報 */
    conflicts: any[];
    /** 追加されたプロパティ */
    additions: string[];
    /** 警告メッセージ */
    warnings: string[];
  };
}

// ========================================
// エクスポート
// ========================================

export type {
  HtmlMetadata,
  ContentStats,
  LinkInfo,
  ImageInfo,
  JsonLdInfo,
  EntityCandidate
} from './crawler';
