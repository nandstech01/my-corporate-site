/**
 * CLAVI SaaS - テナント設定型定義
 *
 * @description
 * テナント毎のsameAs, Author設定を管理するための型定義
 * Phase 8: Google AIO表示最適化のための設定
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-20
 */

// ========================================
// sameAs 設定
// ========================================

/**
 * 組織（Organization）のsameAs設定
 * SNS/外部プロファイルリンク
 */
export interface OrganizationSameAs {
  /** Twitter/X URL */
  twitter?: string;
  /** LinkedIn Company URL */
  linkedin?: string;
  /** Facebook Page URL */
  facebook?: string;
  /** YouTube Channel URL */
  youtube?: string;
  /** GitHub Organization URL */
  github?: string;
  /** その他のカスタムURL */
  custom?: string[];
}

/**
 * 著者（Person）のsameAs設定
 */
export interface AuthorSameAs {
  /** Twitter/X URL */
  twitter?: string;
  /** LinkedIn Profile URL */
  linkedin?: string;
  /** GitHub Profile URL */
  github?: string;
  /** YouTube Channel URL */
  youtube?: string;
}

/**
 * sameAs設定全体
 */
export interface SameAsSettings {
  /** 組織のsameAs */
  organization?: OrganizationSameAs;
  /** 著者のsameAs */
  author?: AuthorSameAs;
}

// ========================================
// Author 設定
// ========================================

/**
 * 著者（Person）設定
 */
export interface AuthorSettings {
  /** 氏名（必須） */
  name: string;
  /** 役職 */
  jobTitle?: string;
  /** 説明文 */
  description?: string;
  /** 専門分野（最大10個） */
  expertise?: string[];
  /** プロフィール画像URL */
  image?: string;
  /** sameAsリンク */
  sameAs?: AuthorSameAs;
}

// ========================================
// テナント設定全体
// ========================================

/**
 * テナント設定
 * clavi.tenants.settingsカラムに保存されるJSONB構造
 */
export interface TenantSettings {
  /** sameAs設定 */
  sameAs?: SameAsSettings;
  /** 著者設定 */
  author?: AuthorSettings;
  /** 最終更新日時 */
  updatedAt?: string;
}

// ========================================
// API リクエスト/レスポンス型
// ========================================

/**
 * 設定取得レスポンス
 */
export interface GetSettingsResponse {
  success: boolean;
  settings: TenantSettings;
}

/**
 * 設定更新リクエスト
 */
export interface UpdateSettingsRequest {
  sameAs?: SameAsSettings;
  author?: AuthorSettings;
}

/**
 * 設定更新レスポンス
 */
export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
  settings: TenantSettings;
}

// ========================================
// ユーティリティ型
// ========================================

/**
 * sameAs URLの配列を構築
 */
export function buildSameAsArray(
  sameAs: OrganizationSameAs | AuthorSameAs | undefined
): string[] {
  if (!sameAs) return [];

  const urls: string[] = [];

  if ('twitter' in sameAs && sameAs.twitter) {
    urls.push(sameAs.twitter);
  }
  if ('linkedin' in sameAs && sameAs.linkedin) {
    urls.push(sameAs.linkedin);
  }
  if ('facebook' in sameAs && (sameAs as OrganizationSameAs).facebook) {
    urls.push((sameAs as OrganizationSameAs).facebook!);
  }
  if ('youtube' in sameAs && sameAs.youtube) {
    urls.push(sameAs.youtube);
  }
  if ('github' in sameAs && sameAs.github) {
    urls.push(sameAs.github);
  }
  if ('custom' in sameAs && (sameAs as OrganizationSameAs).custom) {
    urls.push(...(sameAs as OrganizationSameAs).custom!);
  }

  return urls.filter(url => url && url.trim().length > 0);
}

/**
 * 重複を除去した配列を返す
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * 設定のバリデーション
 */
export function validateTenantSettings(settings: TenantSettings): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Author設定のバリデーション
  if (settings.author) {
    if (settings.author.name && settings.author.name.length > 100) {
      errors.push('著者名は100文字以内にしてください');
    }
    if (settings.author.jobTitle && settings.author.jobTitle.length > 100) {
      errors.push('役職は100文字以内にしてください');
    }
    if (settings.author.description && settings.author.description.length > 500) {
      errors.push('説明文は500文字以内にしてください');
    }
    if (settings.author.expertise && settings.author.expertise.length > 10) {
      errors.push('専門分野は最大10個までです');
    }
  }

  // URL形式のバリデーション（簡易）
  const urlFields = [
    settings.sameAs?.organization?.twitter,
    settings.sameAs?.organization?.linkedin,
    settings.sameAs?.organization?.facebook,
    settings.sameAs?.organization?.youtube,
    settings.sameAs?.organization?.github,
    settings.sameAs?.author?.twitter,
    settings.sameAs?.author?.linkedin,
    settings.sameAs?.author?.github,
    settings.sameAs?.author?.youtube,
    settings.author?.image,
  ];

  for (const url of urlFields) {
    if (url && !isValidUrl(url)) {
      errors.push(`無効なURL: ${url}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * URL形式チェック（簡易）
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ========================================
// デフォルト値
// ========================================

/**
 * デフォルトのテナント設定
 */
export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  sameAs: {
    organization: {},
    author: {},
  },
  author: undefined,
};
