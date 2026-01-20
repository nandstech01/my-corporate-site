/**
 * ASO SaaS - URL分析API
 *
 * @description
 * URLを受け取り、クロール→分析→保存を実行
 * carve-out基盤と統合（認証、RLS、テナント分離）
 * Phase 8: sameAs, Author Schema, 型別マージ機能追加
 *
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 * @updated 2026-01-20
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { crawlUrl } from '@/lib/aso/crawler';
import { HasPartSchemaSystem } from '@/lib/structured-data/haspart-schema-system';
import { ASOFragmentVectorizer } from '@/lib/aso/fragment-vectorizer';
import { ASOSchemaMerger } from '@/lib/aso/schema-merger';
import { ASOSchemaGenerator } from '@/lib/aso/schema-generator';
import { ASOEntityExtractor } from '@/lib/aso/entity-extractor';
import type { AnalysisData, HasPartSchema } from '@/lib/aso/types/analysis';
import type { TenantSettings } from '@/lib/aso/types/tenant-settings';
import * as crypto from 'crypto';

/**
 * URL分析リクエスト型
 */
interface AnalyzeRequest {
  url: string;
  pipeline_version?: string;
}

/**
 * URL分析レスポンス型
 */
interface AnalyzeResponse {
  analysis_id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created: boolean;
  message: string;
}

/**
 * POST /api/aso/analyze
 * 
 * URLを分析し、結果をデータベースに保存
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/aso/analyze', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ url: 'https://example.com' })
 * });
 * const data = await response.json();
 * console.log(data.analysis_id);
 * ```
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // 1. リクエストボディの解析
    const body: AnalyzeRequest = await request.json();
    const { url, pipeline_version = process.env.ASO_PIPELINE_VERSION || 'v1' } = body;

    // バリデーション
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // URL形式チェック
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 2. 認証確認（carve-out基盤）
    // Authorization ヘッダーまたはCookieから認証
    const authHeader = request.headers.get('authorization');
    let supabase;
    
    if (authHeader?.startsWith('Bearer ')) {
      // Authorization ヘッダーがある場合（テスト・外部API用）
      // Bearer token（ユーザーJWT / ジョブJWT）で Supabase に認証し、RLS を強制する
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      // Cookieベース認証（通常のブラウザリクエスト）
      // 🔍 デバッグ: Cookie確認（本番では出さない）
      if (process.env.NODE_ENV !== 'production') {
      const cookieStore = cookies();
      const allCookies = cookieStore.getAll();
      console.log('[ASO] 🍪 Cookies received:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
      }
      
      supabase = createRouteHandlerClient({ cookies });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[ASO] Auth result:', { 
      userId: user?.id, 
      email: user?.email, 
      error: authError?.message 
    });
    
    if (authError || !user) {
      console.error('[ASO] ❌ Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. テナントコンテキスト取得
    // まずRPC関数を試す（JWT claim優先）
    let tenant_id: string | null = null;
    let tenant_role: string | null = null;

    const { data: context, error: contextError } = await supabase
      .rpc('get_current_tenant_context');

    if (!contextError && context?.tenant_id) {
      tenant_id = context.tenant_id;
      tenant_role = context.tenant_role;
    } else {
      // Fallback: RPC関数でuser_idを引数として渡す
      console.log('[ASO] RPC failed, using fallback. User ID:', user.id);
      
      const { data: membership, error: membershipError } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      console.log('[ASO] Membership query result:', { membership, error: membershipError });

      if (membershipError || !membership) {
        console.error('[ASO] No tenant context:', membershipError);
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
          { status: 403 }
        );
      }

      tenant_id = membership.tenant_id;
      tenant_role = membership.role;
      console.log('[ASO] Using tenant from fallback:', tenant_id, tenant_role);
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context. Please select or join a tenant.' },
        { status: 403 }
      );
    }

    // 3.5. 使用量制限チェック（Phase 7: Stripe課金統合）
    const { data: usageData, error: usageError } = await supabase
      .rpc('check_usage_limit', { p_tenant_id: tenant_id });

    if (usageError) {
      console.error('[ASO] Usage check error:', usageError);
      // 使用量チェック失敗は非ブロッキング（ログのみ）
    } else if (usageData && Array.isArray(usageData) && usageData.length > 0) {
      const usage = usageData[0];
      console.log('[ASO] Usage check:', usage);

      if (!usage.is_allowed) {
        return NextResponse.json(
          {
            error: 'Usage limit exceeded',
            details: {
              current_usage: usage.current_usage,
              usage_limit: usage.usage_limit,
              tier: usage.tier,
              message: `月間URL分析上限（${usage.usage_limit}件）に達しました。プランをアップグレードしてください。`,
            },
          },
          { status: 429 }
        );
      }
    }

    // 4. 冪等性キー生成
    // Phase 1締め方針:
    // - original_url: ユーザー入力（そのまま保存）→ クローリング・表示用
    // - normalized_url: 冪等性キー用（url_hash計算）
    // - canonical_url: Phase 2+で実装（<link rel="canonical">から取得）
    const original_url = url;
    const normalized_url = normalizeUrl(url);
    const url_hash = generateUrlHash(normalized_url);
    const idempotency_key = `${tenant_id}_${url_hash}_${pipeline_version}`;
    
    console.log('[ASO] URL hash generated:', { 
      original_url, 
      normalized_url, 
      url_hash, 
      tenant_id, 
      pipeline_version 
    });

    // 5. 既存分析チェック（冪等性）
    const { data: existingData, error: checkError } = await supabase
      .rpc('check_existing_analysis', {
        p_tenant_id: tenant_id,
        p_url_hash: url_hash,
        p_pipeline_version: pipeline_version
      });
    
    console.log('[ASO] Existing check result:', { existingData, checkError, dataType: typeof existingData, isArray: Array.isArray(existingData) });
    
    if (checkError) {
      console.error('既存分析チェックエラー:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing analysis' },
        { status: 500 }
      );
    }

    // RPC関数はTABLE形式で返すので、配列として扱う
    const existingAnalysis = existingData && Array.isArray(existingData) && existingData.length > 0 
      ? existingData[0] 
      : null;
    
    console.log('[ASO] Existing analysis:', existingAnalysis);

    // 既存分析が存在する場合
    if (existingAnalysis) {
      return NextResponse.json<AnalyzeResponse>(
        {
          analysis_id: existingAnalysis.id,
          url: existingAnalysis.url,
          status: existingAnalysis.status || 'pending',
          created: false,
          message: 'Analysis already exists for this URL and pipeline version',
        },
        { status: 200 }
      );
    }

    // 6. URLクロール実行
    console.log(`[ASO] Crawling URL: ${url}`);
    const crawlResult = await crawlUrl(url, {
      timeout: 30000,
      maxRetries: 3,
    });

    if (!crawlResult.success) {
      // クロール失敗時もデータベースに記録
      const { data: failedAnalysis, error: insertError } = await supabase
        .rpc('insert_failed_analysis', {
          p_tenant_id: tenant_id,
          p_url: url,
          p_pipeline_version: pipeline_version,
          p_status: 'failed',
          p_error_message: crawlResult.error || 'Crawl failed',
        })
        .single<{ id: string }>();

      if (insertError) {
        console.error('失敗分析記録エラー:', insertError);
      }

      return NextResponse.json(
        {
          error: 'Failed to crawl URL',
          details: crawlResult.error,
        },
        { status: 500 }
      );
    }

    // 7. 分析データ準備（型安全）
    const analysis_data: AnalysisData = {
      crawl: {
        status_code: crawlResult.statusCode,
        final_url: crawlResult.finalUrl,
        crawled_at: crawlResult.crawledAt,
        processing_time: crawlResult.processingTime,
      },
      metadata: crawlResult.metadata,
      content: {
        plain_text: crawlResult.plainText.substring(0, 10000), // 最大10,000文字
        stats: crawlResult.stats,
      },
      headings: crawlResult.headings.map(h => ({
        level: h.level,
        text: h.text,
        id: h.id,
      })),
      links: crawlResult.links.slice(0, 100), // 最大100件
      images: crawlResult.images.slice(0, 50), // 最大50件
      jsonLd: crawlResult.jsonLd,
      entities: crawlResult.entities.slice(0, 20), // 最大20件
    };

    // 7.1. Fragment ID生成（Phase 4.1）
    console.log(`[ASO] Generating Fragment IDs from ${crawlResult.headings.length} headings`);
    
    // 見出しからFragment ID自動生成（日本語対応: eng-next実装）
    const fragmentIds = crawlResult.headings.map((heading, index) => {
      const text = heading.text.trim();

      // 英数字のみの場合: 従来のサニタイズ
      const asciiOnly = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);

      // 日本語を含む場合: URLエンコード
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);

      if (hasJapanese) {
        const encoded = encodeURIComponent(text.replace(/\s+/g, '-').substring(0, 30));
        return `h${heading.level}-${encoded}-${index + 1}`;
      }

      return `h${heading.level}-${asciiOnly || 'section'}-${index + 1}`;
    });

    // HasPartSchemaSystem で hasPart スキーマ生成
    const hasPartSystem = new HasPartSchemaSystem({ baseUrl: url });
    const { fragmentSchemas } = hasPartSystem.generateFragmentBasedSchema(
      fragmentIds,
      url,
      crawlResult.metadata.title || 'Untitled',
      undefined // TOCItems（オプション、今回は未使用）
    );

    // analysis_data に追加（型安全）
    analysis_data.fragment_ids = fragmentSchemas.map((f: HasPartSchema) => f['@id']);
    analysis_data.fragment_schemas = fragmentSchemas;

    console.log(`[ASO] Generated ${fragmentSchemas.length} Fragment IDs`);

    // 7.2. Phase 8: テナント設定取得 & Schema生成 & マージ
    let tenantSettings: TenantSettings = {};
    let structuredData: any = null;
    let mergeReport: any = null;

    try {
      // テナント設定取得（RPC経由 - asoスキーマはREST APIで公開されていないため）
      const { data: settingsData, error: settingsError } = await supabase
        .rpc('get_tenant_settings_by_id', { p_tenant_id: tenant_id });

      if (!settingsError && settingsData) {
        tenantSettings = settingsData as TenantSettings;
        console.log(`[ASO] Tenant settings loaded: sameAs=${!!tenantSettings.sameAs}, author=${!!tenantSettings.author}`);
      } else if (settingsError) {
        console.warn('[ASO] Failed to load tenant settings:', settingsError.message);
      }

      // Schema Generator でJSON-LD生成（sameAs, Author追加）
      const schemaGenerator = new ASOSchemaGenerator();
      const generatedSchema = schemaGenerator.generateSchema({
        url,
        title: crawlResult.metadata.title || 'Untitled',
        description: crawlResult.metadata.description || '',
        fragments: crawlResult.headings.map((heading, index) => ({
          fragmentId: fragmentIds[index],
          title: heading.text,
          fullContent: heading.text, // 見出しテキストを使用（本文抽出は将来拡張）
        })),
        entities: {
          organization: crawlResult.entities.find(e => e.type === 'Organization') ? {
            name: crawlResult.entities.find(e => e.type === 'Organization')?.text || '',
            url: url,
            description: crawlResult.metadata.description || '',
            evidence: 'Extracted from page metadata'
          } : undefined,
          services: crawlResult.entities.filter(e => e.type === 'Service').map(e => ({
            name: e.text,
            description: '',
            evidence: 'Extracted from page content'
          })),
          products: crawlResult.entities.filter(e => e.type === 'Product').map(e => ({
            name: e.text,
            description: '',
            evidence: 'Extracted from page content'
          })),
          knowsAbout: crawlResult.entities.filter(e => e.type === 'Other').map(e => e.text).slice(0, 5),
        },
        tenantSettings,
      });

      // Schema Merger で既存JSON-LDとマージ
      const schemaMerger = new ASOSchemaMerger();
      const mergeResult = schemaMerger.mergeWithExisting(
        crawlResult.jsonLd,
        generatedSchema,
        tenantSettings
      );

      structuredData = mergeResult.merged;
      mergeReport = {
        conflicts: mergeResult.conflicts,
        additions: mergeResult.additions,
        warnings: mergeResult.warnings,
      };

      console.log(`[ASO] Schema merge completed: ${mergeResult.additions.length} additions, ${mergeResult.warnings.length} warnings`);
    } catch (schemaError) {
      console.error('[ASO] Schema generation/merge error (non-blocking):', schemaError);
    }

    // Phase 8: structured_data と merge_report を analysis_data に追加
    if (structuredData) {
      analysis_data.structured_data = structuredData;
    }
    if (mergeReport) {
      analysis_data.merge_report = mergeReport;
    }

    // 8. AI構造化スコア計算（簡易版）
    const ai_structure_score = calculateAiStructureScore(crawlResult);

    // 9. データベースに保存
    const { data: newAnalysis, error: insertError } = await supabase
      .rpc('insert_client_analysis', {
        p_tenant_id: tenant_id,
        p_url: url,
        p_pipeline_version: pipeline_version,
        p_company_name: extractCompanyName(crawlResult),
        p_analysis_data: analysis_data,
        p_ai_structure_score: ai_structure_score,
        p_status: 'completed',
      })
      .single<{ id: string }>();

    if (insertError) {
      console.error('分析保存エラー:', insertError);
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      );
    }

    // 9.5. 使用量インクリメント（Phase 7: Stripe課金統合）
    try {
      const { error: incrementError } = await supabase
        .rpc('increment_usage', { p_tenant_id: tenant_id });

      if (incrementError) {
        console.error('[ASO] Usage increment error (non-blocking):', incrementError);
      } else {
        console.log('[ASO] Usage incremented for tenant:', tenant_id);
      }
    } catch (incrementErr) {
      console.error('[ASO] Usage increment exception (non-blocking):', incrementErr);
    }

    // 10. Phase 4.2: Fragment ベクトル化（eng-backend実装）
    try {
      console.log(`[ASO] Starting Fragment vectorization for analysis ${newAnalysis.id}`);
      const vectorizer = new ASOFragmentVectorizer();
      const vectorResult = await vectorizer.vectorizeFragments({
        analysis_id: newAnalysis.id,
        tenant_id: tenant_id,
        fragments: analysis_data.fragment_ids?.map((fragmentId, index) => ({
          fragment_id: fragmentId,
          title: crawlResult.headings[index]?.text || 'Untitled',
          content: crawlResult.headings[index]?.text || '', // 50-150語パッセージ（見出しテキストを使用）
        })) || [],
      });
      console.log(`[ASO] Vectorized ${vectorResult.successCount}/${vectorResult.totalCount} fragments`);
    } catch (vectorError) {
      // ベクトル化失敗でも分析結果は返す（ログのみ）
      console.error('[ASO] Fragment vectorization failed (non-blocking):', vectorError);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[ASO] Analysis completed: ${newAnalysis.id} (${processingTime}ms)`);

    return NextResponse.json<AnalyzeResponse>(
      {
        analysis_id: newAnalysis.id,
        url,
        status: 'completed',
        created: true,
        message: 'URL analysis completed successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ASO] Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * URLハッシュを生成
 * 
 * ⚠️ Phase 1締め: normalized_url を受け取る（既に正規化済み）
 * 
 * Phase 1: MD5を維持（既存データとの互換性）
 * Phase 2: SHA-256へ移行予定（pipeline_version v2.0.0）
 * 
 * @param normalizedUrl - 正規化済みURL
 * @returns URLハッシュ（MD5）
 */
function generateUrlHash(normalizedUrl: string): string {
  // Phase 1: MD5を維持（既存データとの互換性優先）
  return crypto.createHash('md5').update(normalizedUrl).digest('hex');
}

/**
 * URLを正規化（冪等性キー生成専用）
 * 
 * ⚠️ 重要: この正規化は「冪等性キー（url_hash）生成専用」です
 * - 実際のクローリングは original_url を使用
 * - canonical_url は Phase 2+ で実装
 * 
 * 正規化ルール（Phase 1締め）:
 * 1. プロトコルを統一（http → https）※キー用のみ
 * 2. www を除去
 * 3. 末尾スラッシュを削除
 * 4. トラッキングパラメータを除去（UTM、fbclid、gclid等）
 * 5. クエリパラメータをソート
 * 6. フラグメント（#）を除去
 * 7. デフォルトポート（:80, :443）を除去
 * 
 * @param url - 元のURL
 * @returns 正規化されたURL（冪等性キー用）
 * 
 * @example
 * normalizeUrl('http://www.example.com/path/?utm_source=twitter&id=123#section')
 * // → 'https://example.com/path?id=123'
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // 1. プロトコルを統一（http → https）※キー用のみ
    const protocol = 'https:';
    
    // 2. www を除去
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // 3. 末尾スラッシュ削除（ルートパス以外）
    let path = parsed.pathname;
    if (path !== '/' && path.endsWith('/')) {
      path = path.replace(/\/+$/, '');
    }
    if (path === '/') {
      path = '';
    }
    
    // 4. トラッキングパラメータを除去（Phase 1固定リスト）
    // Phase 2+: DB/設定でテナント別拡張可能に
    const TRACKING_PARAMS = new Set([
      // UTMパラメータ
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      // Facebook
      'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref',
      // Google
      'gclid', 'gclsrc', 'dclid',
      // Twitter
      'twclid',
      // その他
      'ref', 'mc_cid', 'mc_eid', '_ga', 'cn', 'ncid',
      // Microsoft
      'msclkid',
      // LinkedIn
      'li_fat_id',
      // 汎用
      'source', 'campaign'
    ]);
    
    const cleanParams = Array.from(parsed.searchParams.entries())
      .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
      .sort();
    
    const sortedSearch = cleanParams.length > 0
      ? '?' + cleanParams.map(([k, v]) => `${k}=${v}`).join('&')
      : '';
    
    // 5. デフォルトポート除去（:80, :443）
    const port = parsed.port;
    const portSuffix = (port && port !== '80' && port !== '443') ? `:${port}` : '';
    
    // 6. フラグメント（#）は自動的に除外される（parsed.hash を使わない）
    
    const normalized = `${protocol}//${hostname}${portSuffix}${path}${sortedSearch}`;
    
    console.log('[ASO] URL normalized:', { original: url, normalized });
    
    return normalized;
  } catch (error) {
    console.error('[ASO] URL normalization error:', error);
    return url;  // エラー時は元のURLを返す
  }
}

/**
 * 会社名を抽出
 * 
 * @param crawlResult - クロール結果
 * @returns 会社名（推定）
 */
function extractCompanyName(crawlResult: any): string | null {
  // 優先順位: og:site_name > title > エンティティ
  if (crawlResult.metadata.ogTitle) {
    return crawlResult.metadata.ogTitle.substring(0, 100);
  }
  
  if (crawlResult.metadata.title) {
    return crawlResult.metadata.title.substring(0, 100);
  }
  
  // エンティティから組織名を探す
  const orgEntity = crawlResult.entities.find((e: any) => e.type === 'Organization');
  if (orgEntity) {
    return orgEntity.text.substring(0, 100);
  }
  
  return null;
}

/**
 * AI構造化スコアを計算
 * 
 * @param crawlResult - クロール結果
 * @returns スコア（0-100）
 */
function calculateAiStructureScore(crawlResult: any): number {
  let score = 0;
  
  // メタデータの充実度（最大30点）
  if (crawlResult.metadata.title) score += 5;
  if (crawlResult.metadata.description) score += 5;
  if (crawlResult.metadata.ogImage) score += 5;
  if (crawlResult.metadata.ogTitle) score += 5;
  if (crawlResult.metadata.canonical) score += 5;
  if (crawlResult.jsonLd.length > 0) score += 5;
  
  // 見出し構造（最大20点）
  const headingCount = crawlResult.headings.length;
  if (headingCount > 0) score += 5;
  if (headingCount >= 3) score += 5;
  if (headingCount >= 5) score += 5;
  if (headingCount >= 10) score += 5;
  
  // コンテンツ品質（最大30点）
  const wordCount = crawlResult.stats.wordCount;
  if (wordCount >= 300) score += 5;
  if (wordCount >= 500) score += 5;
  if (wordCount >= 1000) score += 5;
  if (wordCount >= 2000) score += 5;
  if (crawlResult.images.length >= 3) score += 5;
  if (crawlResult.links.length >= 5) score += 5;
  
  // 内部リンク（最大10点）
  const internalLinkCount = crawlResult.stats.internalLinkCount;
  if (internalLinkCount >= 3) score += 5;
  if (internalLinkCount >= 10) score += 5;
  
  // エンティティ（最大10点）
  if (crawlResult.entities.length >= 5) score += 5;
  if (crawlResult.entities.length >= 10) score += 5;
  
  return Math.min(score, 100);
}

