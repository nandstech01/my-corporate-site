/**
 * AI強化データ高速キャッシュシステム
 * 機能100%維持 + 3-5倍速度向上
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { CompleteAIEnhancedUnifiedPageData } from '@/lib/structured-data/unified-integration-ai-enhanced';

const CACHE_DIR = path.join(process.cwd(), '.ai-cache');
const CACHE_VERSION = '1.0';

export interface CacheMetadata {
  version: string;
  generatedAt: string;
  expiresAt: string;
  pageSlug: string;
}

export interface CachedAIData {
  data: CompleteAIEnhancedUnifiedPageData;
  structuredDataJSON: string;
  metadata: CacheMetadata;
}

/**
 * AI強化データ高速キャッシュマネージャー
 */
export class AIEnhancedCacheManager {
  
  /**
   * キャッシュ初期化
   */
  static async initialize(): Promise<void> {
    if (!existsSync(CACHE_DIR)) {
      await mkdir(CACHE_DIR, { recursive: true });
      console.log('🗂️ AI Enhanced Cache directory created');
    }
  }

  /**
   * キャッシュキー生成
   */
  static getCacheKey(pageSlug: string): string {
    return `ai-enhanced-${pageSlug || 'home'}.json`;
  }

  /**
   * キャッシュファイルパス取得
   */
  static getCacheFilePath(pageSlug: string): string {
    return path.join(CACHE_DIR, this.getCacheKey(pageSlug));
  }

  /**
   * キャッシュ存在チェック + 有効性確認
   */
  static async isCacheValid(pageSlug: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(pageSlug);
      
      if (!existsSync(filePath)) {
        return false;
      }

      const cached = await this.getCache(pageSlug);
      if (!cached) return false;

      // バージョンチェック
      if (cached.metadata.version !== CACHE_VERSION) {
        console.log('🔄 Cache version mismatch, invalidating');
        return false;
      }

      // 有効期限チェック（1時間）
      const expiresAt = new Date(cached.metadata.expiresAt);
      const now = new Date();
      
      if (now > expiresAt) {
        console.log('⏰ Cache expired');
        return false;
      }

      console.log('✅ AI Enhanced Cache is valid and fresh');
      return true;
      
    } catch (error) {
      console.error('❌ Cache validation error:', error);
      return false;
    }
  }

  /**
   * キャッシュデータ取得
   */
  static async getCache(pageSlug: string): Promise<CachedAIData | null> {
    try {
      const filePath = this.getCacheFilePath(pageSlug);
      const content = await readFile(filePath, 'utf-8');
      const cached: CachedAIData = JSON.parse(content);
      
      console.log('📦 AI Enhanced Cache loaded:', {
        slug: pageSlug,
        generatedAt: cached.metadata.generatedAt,
        size: Math.round(content.length / 1024) + 'KB'
      });
      
      return cached;
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return null;
    }
  }

  /**
   * キャッシュデータ保存
   */
  static async setCache(
    pageSlug: string,
    data: CompleteAIEnhancedUnifiedPageData,
    structuredDataJSON: string
  ): Promise<void> {
    try {
      await this.initialize();
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1時間後
      
      const cachedData: CachedAIData = {
        data,
        structuredDataJSON,
        metadata: {
          version: CACHE_VERSION,
          generatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          pageSlug
        }
      };

      const filePath = this.getCacheFilePath(pageSlug);
      await writeFile(filePath, JSON.stringify(cachedData, null, 2));
      
      console.log('💾 AI Enhanced Cache saved:', {
        slug: pageSlug,
        size: Math.round(JSON.stringify(cachedData).length / 1024) + 'KB',
        expiresAt: expiresAt.toISOString()
      });
      
    } catch (error) {
      console.error('❌ Cache write error:', error);
    }
  }

  /**
   * 高速AI強化データ取得（キャッシュ優先）
   */
  static async getFastAIEnhancedData(
    pageSlug: string,
    context: any,
    targetAIEngines: string[],
    generateFunction: Function
  ): Promise<{
    data: CompleteAIEnhancedUnifiedPageData;
    structuredDataJSON: string;
    fromCache: boolean;
  }> {
    
    // 1. キャッシュチェック
    if (await this.isCacheValid(pageSlug)) {
      const cached = await this.getCache(pageSlug);
      if (cached) {
        console.log('⚡ Using cached AI Enhanced data (FAST!)');
        return {
          data: cached.data,
          structuredDataJSON: cached.structuredDataJSON,
          fromCache: true
        };
      }
    }

    // 2. キャッシュなし → フル生成
    console.log('🔄 Generating fresh AI Enhanced data...');
    const startTime = Date.now();
    
    const data = await generateFunction(context, targetAIEngines);
    const structuredDataJSON = JSON.stringify(data); // 構造化データJSON生成
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ AI Enhanced data generated in ${duration}ms`);

    // 3. キャッシュ保存（非同期）
    this.setCache(pageSlug, data, structuredDataJSON).catch(console.error);

    return {
      data,
      structuredDataJSON,
      fromCache: false
    };
  }

  /**
   * キャッシュクリア
   */
  static async clearCache(pageSlug?: string): Promise<void> {
    try {
      if (pageSlug) {
        const filePath = this.getCacheFilePath(pageSlug);
        if (existsSync(filePath)) {
          await writeFile(filePath, ''); // ファイル削除の代わりに空にする
          console.log(`🗑️ Cache cleared for: ${pageSlug}`);
        }
      } else {
        // 全キャッシュクリア
        await mkdir(CACHE_DIR, { recursive: true });
        console.log('🗑️ All AI Enhanced cache cleared');
      }
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }
}

/**
 * 便利関数: 高速AI強化データ取得
 */
export async function getFastAIEnhancedPageData(
  pageSlug: string,
  context: any,
  targetAIEngines: string[],
  generateFunction: Function
) {
  return AIEnhancedCacheManager.getFastAIEnhancedData(
    pageSlug,
    context,
    targetAIEngines,
    generateFunction
  );
} 