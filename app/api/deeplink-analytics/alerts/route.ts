import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase接続設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// アラートデータの型定義
interface Alert {
  id: string;
  type: 'similarity_drop' | 'ai_quotation_surge' | 'performance_anomaly' | 'conversion_drop' | 'sns_spike';
  severity: 'critical' | 'warning' | 'info';
  fragment_id: string;
  complete_uri: string;
  current_value: number;
  previous_value: number;
  threshold: number;
  change_percentage: number;
  detected_at: string;
  title: string;
  description: string;
  recommended_actions: string[];
  auto_resolvable: boolean;
  estimated_impact: string;
}

interface AlertSummary {
  total_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  info_alerts: number;
  alerts_by_type: {
    similarity_drop: number;
    ai_quotation_surge: number;
    performance_anomaly: number;
    conversion_drop: number;
    sns_spike: number;
  };
  recent_alerts: Alert[];
  trending_issues: Array<{
    type: string;
    frequency: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
}

// アラートしきい値設定
const ALERT_THRESHOLDS = {
  similarity_drop: {
    critical: 0.6,   // 60%未満で重大アラート
    warning: 0.7,    // 70%未満で警告
    change_threshold: -15 // 15%以上の低下
  },
  ai_quotation_surge: {
    surge_multiplier: 2.0, // 2倍以上の増加
    minimum_quotations: 3   // 最低3件の引用が必要
  },
  performance_anomaly: {
    deviation_threshold: 2.0, // 標準偏差の2倍
    minimum_data_points: 5    // 最低5データポイント必要
  },
  conversion_drop: {
    critical: -50,   // 50%以上の低下で重大
    warning: -25,    // 25%以上の低下で警告
    minimum_conversions: 1
  },
  sns_spike: {
    surge_multiplier: 3.0, // 3倍以上の増加
    minimum_activity: 2
  }
};

// 類似度低下アラートの検知
async function detectSimilarityDropAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  try {
    // 現在の類似度データ取得
    const { data: currentData, error: currentError } = await supabase
      .from('deeplink_analytics')
      .select('fragment_id, complete_uri, similarity_score')
      .order('last_updated', { ascending: false });

    if (currentError) throw currentError;

    // 過去7日間の類似度履歴取得
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: historicalData, error: histError } = await supabase
      .from('similarity_history')
      .select('fragment_id, similarity_score, measured_at')
      .gte('measured_at', sevenDaysAgo.toISOString())
      .order('measured_at', { ascending: false });

    if (histError) throw histError;

    // 各Fragment IDの類似度変化を分析
    for (const current of currentData || []) {
      const historical = historicalData?.filter(h => h.fragment_id === current.fragment_id) || [];
      
      if (historical.length === 0) continue;
      
      // 平均類似度計算
      const avgHistorical = historical.reduce((sum, h) => sum + (h.similarity_score || 0), 0) / historical.length;
      const currentScore = current.similarity_score || 0;
      const changePercentage = ((currentScore - avgHistorical) / avgHistorical) * 100;

      // アラート条件チェック
      let severity: 'critical' | 'warning' | 'info' | null = null;
      
      if (currentScore < ALERT_THRESHOLDS.similarity_drop.critical || changePercentage < -30) {
        severity = 'critical';
      } else if (currentScore < ALERT_THRESHOLDS.similarity_drop.warning || changePercentage < ALERT_THRESHOLDS.similarity_drop.change_threshold) {
        severity = 'warning';
      }

      if (severity) {
        alerts.push({
          id: `similarity-${current.fragment_id}-${Date.now()}`,
          type: 'similarity_drop',
          severity,
          fragment_id: current.fragment_id,
          complete_uri: current.complete_uri,
          current_value: currentScore,
          previous_value: avgHistorical,
          threshold: severity === 'critical' ? ALERT_THRESHOLDS.similarity_drop.critical : ALERT_THRESHOLDS.similarity_drop.warning,
          change_percentage: Math.round(changePercentage * 100) / 100,
          detected_at: new Date().toISOString(),
          title: `類似度低下: ${current.fragment_id}`,
          description: `Fragment ID "${current.fragment_id}" の類似度が${Math.abs(changePercentage).toFixed(1)}%低下しました（${(currentScore * 100).toFixed(1)}% → ${(avgHistorical * 100).toFixed(1)}%）`,
          recommended_actions: [
            'コンテンツの関連性を向上させる',
            'トレンドRAGデータを統合する',
            'H1-H3見出しを最適化する',
            '構造化データを見直す'
          ],
          auto_resolvable: false,
          estimated_impact: severity === 'critical' ? 'AI引用率30%低下の可能性' : 'AI引用率15%低下の可能性'
        });
      }
    }
  } catch (error) {
    console.error('類似度低下アラート検知エラー:', error);
  }

  return alerts;
}

// AI引用急増アラートの検知
async function detectAIQuotationSurgeAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  try {
    // 過去24時間と前24時間のAI引用データ比較
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const dayBeforeYesterday = new Date(now);
    dayBeforeYesterday.setDate(now.getDate() - 2);

    const [
      { data: recentQuotations, error: recentError },
      { data: previousQuotations, error: prevError }
    ] = await Promise.all([
      supabase
        .from('ai_quotation_history')
        .select('fragment_id, complete_uri')
        .gte('detected_at', yesterday.toISOString()),
      supabase
        .from('ai_quotation_history')
        .select('fragment_id, complete_uri')
        .gte('detected_at', dayBeforeYesterday.toISOString())
        .lt('detected_at', yesterday.toISOString())
    ]);

    if (recentError) throw recentError;
    if (prevError) throw prevError;

    // Fragment IDごとの引用数集計
    const recentCounts = new Map<string, { count: number, uri: string }>();
    const previousCounts = new Map<string, number>();

    (recentQuotations || []).forEach(q => {
      const current = recentCounts.get(q.fragment_id) || { count: 0, uri: q.complete_uri };
      recentCounts.set(q.fragment_id, { count: current.count + 1, uri: q.complete_uri });
    });

    (previousQuotations || []).forEach(q => {
      previousCounts.set(q.fragment_id, (previousCounts.get(q.fragment_id) || 0) + 1);
    });

    // 急増検知
    for (const [fragmentId, recentData] of Array.from(recentCounts.entries())) {
      const previousCount = previousCounts.get(fragmentId) || 0;
      const recentCount = recentData.count;

      // 急増条件チェック
      if (recentCount >= ALERT_THRESHOLDS.ai_quotation_surge.minimum_quotations &&
          recentCount >= previousCount * ALERT_THRESHOLDS.ai_quotation_surge.surge_multiplier) {
        
        const changePercentage = previousCount > 0 
          ? ((recentCount - previousCount) / previousCount) * 100 
          : 100;

        alerts.push({
          id: `quotation-surge-${fragmentId}-${Date.now()}`,
          type: 'ai_quotation_surge',
          severity: changePercentage > 300 ? 'critical' : 'info',
          fragment_id: fragmentId,
          complete_uri: recentData.uri,
          current_value: recentCount,
          previous_value: previousCount,
          threshold: ALERT_THRESHOLDS.ai_quotation_surge.surge_multiplier,
          change_percentage: Math.round(changePercentage * 100) / 100,
          detected_at: new Date().toISOString(),
          title: `AI引用急増: ${fragmentId}`,
          description: `Fragment ID "${fragmentId}" のAI引用が急増しました（${previousCount}件 → ${recentCount}件、${changePercentage.toFixed(0)}%増加）`,
          recommended_actions: [
            'コンテンツの品質を維持する',
            '関連コンテンツを拡充する',
            'トラフィック増加に備える',
            'コンバージョン最適化を実施する'
          ],
          auto_resolvable: false,
          estimated_impact: '大幅なトラフィック増加とブランド認知向上が期待'
        });
      }
    }
  } catch (error) {
    console.error('AI引用急増アラート検知エラー:', error);
  }

  return alerts;
}

// パフォーマンス異常検知
async function detectPerformanceAnomalies(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  try {
    // 過去30日間のデータ取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analyticsData, error } = await supabase
      .from('deeplink_analytics')
      .select('fragment_id, complete_uri, click_count, conversion_count, last_updated')
      .gte('last_updated', thirtyDaysAgo.toISOString())
      .order('last_updated', { ascending: false });

    if (error) throw error;

    // Fragment IDごとのパフォーマンス分析
    const fragmentPerformance = new Map<string, {
      uri: string,
      clickCounts: number[],
      conversionCounts: number[]
    }>();

    (analyticsData || []).forEach((item: any) => {
      const existing = fragmentPerformance.get(item.fragment_id) || {
        uri: item.complete_uri,
        clickCounts: [],
        conversionCounts: []
      };
      
      existing.clickCounts.push(item.click_count || 0);
      existing.conversionCounts.push(item.conversion_count || 0);
      fragmentPerformance.set(item.fragment_id, existing);
    });

    // 異常検知
    for (const [fragmentId, data] of Array.from(fragmentPerformance.entries())) {
      if (data.clickCounts.length < ALERT_THRESHOLDS.performance_anomaly.minimum_data_points) continue;

      // 統計計算
      const clickAvg = data.clickCounts.reduce((a: number, b: number) => a + b, 0) / data.clickCounts.length;
      const clickStdDev = Math.sqrt(
        data.clickCounts.reduce((sum: number, x: number) => sum + Math.pow(x - clickAvg, 2), 0) / data.clickCounts.length
      );

      const latestClick = data.clickCounts[0];
      const zScore = clickStdDev > 0 ? Math.abs((latestClick - clickAvg) / clickStdDev) : 0;

      // 異常検知
      if (zScore > ALERT_THRESHOLDS.performance_anomaly.deviation_threshold) {
        const isPositiveAnomaly = latestClick > clickAvg;
        
        alerts.push({
          id: `performance-${fragmentId}-${Date.now()}`,
          type: 'performance_anomaly',
          severity: zScore > 3 ? 'critical' : 'warning',
          fragment_id: fragmentId,
          complete_uri: data.uri,
          current_value: latestClick,
          previous_value: clickAvg,
          threshold: ALERT_THRESHOLDS.performance_anomaly.deviation_threshold,
          change_percentage: ((latestClick - clickAvg) / Math.max(clickAvg, 1)) * 100,
          detected_at: new Date().toISOString(),
          title: `パフォーマンス異常: ${fragmentId}`,
          description: `Fragment ID "${fragmentId}" のクリック数が統計的に異常です（現在: ${latestClick}、平均: ${clickAvg.toFixed(1)}、Z-Score: ${zScore.toFixed(2)}）`,
          recommended_actions: isPositiveAnomaly ? [
            '急激な増加の原因を調査する',
            'サーバー負荷を監視する',
            'コンバージョン最適化を実施する'
          ] : [
            '急激な減少の原因を調査する',
            'コンテンツの問題を確認する',
            'SEO順位の変動を調査する'
          ],
          auto_resolvable: false,
          estimated_impact: isPositiveAnomaly ? '大幅なトラフィック増加' : 'トラフィック大幅減少'
        });
      }
    }
  } catch (error) {
    console.error('パフォーマンス異常検知エラー:', error);
  }

  return alerts;
}

// コンバージョン低下アラートの検知
async function detectConversionDropAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  try {
    // 現在と過去のコンバージョンデータ比較
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [
      { data: recentData, error: recentError },
      { data: previousData, error: prevError }
    ] = await Promise.all([
      supabase
        .from('deeplink_analytics')
        .select('fragment_id, complete_uri, conversion_count, click_count')
        .gte('last_updated', sevenDaysAgo.toISOString()),
      supabase
        .from('deeplink_analytics')
        .select('fragment_id, complete_uri, conversion_count, click_count')
        .gte('last_updated', fourteenDaysAgo.toISOString())
        .lt('last_updated', sevenDaysAgo.toISOString())
    ]);

    if (recentError) throw recentError;
    if (prevError) throw prevError;

    // コンバージョン率比較
    const recentConversions = new Map<string, { conversions: number, clicks: number, uri: string }>();
    const previousConversions = new Map<string, { conversions: number, clicks: number }>();

    (recentData || []).forEach((item: any) => {
      recentConversions.set(item.fragment_id, {
        conversions: item.conversion_count || 0,
        clicks: item.click_count || 0,
        uri: item.complete_uri
      });
    });

    (previousData || []).forEach((item: any) => {
      previousConversions.set(item.fragment_id, {
        conversions: item.conversion_count || 0,
        clicks: item.click_count || 0
      });
    });

    // コンバージョン低下検知
    for (const [fragmentId, recentData] of Array.from(recentConversions.entries())) {
      const previousData = previousConversions.get(fragmentId);
      if (!previousData || previousData.conversions < ALERT_THRESHOLDS.conversion_drop.minimum_conversions) continue;

      const recentRate = recentData.clicks > 0 ? (recentData.conversions / recentData.clicks) * 100 : 0;
      const previousRate = previousData.clicks > 0 ? (previousData.conversions / previousData.clicks) * 100 : 0;
      const changePercentage = previousRate > 0 ? ((recentRate - previousRate) / previousRate) * 100 : 0;

      // アラート条件チェック
      let severity: 'critical' | 'warning' | null = null;
      
      if (changePercentage <= ALERT_THRESHOLDS.conversion_drop.critical) {
        severity = 'critical';
      } else if (changePercentage <= ALERT_THRESHOLDS.conversion_drop.warning) {
        severity = 'warning';
      }

      if (severity) {
        alerts.push({
          id: `conversion-drop-${fragmentId}-${Date.now()}`,
          type: 'conversion_drop',
          severity,
          fragment_id: fragmentId,
          complete_uri: recentData.uri,
          current_value: recentRate,
          previous_value: previousRate,
          threshold: severity === 'critical' ? ALERT_THRESHOLDS.conversion_drop.critical : ALERT_THRESHOLDS.conversion_drop.warning,
          change_percentage: Math.round(changePercentage * 100) / 100,
          detected_at: new Date().toISOString(),
          title: `コンバージョン低下: ${fragmentId}`,
          description: `Fragment ID "${fragmentId}" のコンバージョン率が${Math.abs(changePercentage).toFixed(1)}%低下しました（${recentRate.toFixed(2)}% → ${previousRate.toFixed(2)}%）`,
          recommended_actions: [
            'ランディングページを最適化する',
            'CTA配置を見直す',
            'ユーザージャーニーを分析する',
            'A/Bテストを実施する'
          ],
          auto_resolvable: false,
          estimated_impact: severity === 'critical' ? '収益に深刻な影響' : '収益への中程度の影響'
        });
      }
    }
  } catch (error) {
    console.error('コンバージョン低下アラート検知エラー:', error);
  }

  return alerts;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚨 アラート検知開始...');

    // URLパラメータから設定を取得
    const { searchParams } = new URL(request.url);
    const alertType = searchParams.get('type'); // 特定のアラートタイプのみ取得
    const severity = searchParams.get('severity'); // 特定の重要度のみ取得
    const limit = parseInt(searchParams.get('limit') || '50');

    // 各種アラート検知を並行実行
    const [
      similarityAlerts,
      quotationAlerts,
      performanceAlerts,
      conversionAlerts
    ] = await Promise.all([
      !alertType || alertType === 'similarity_drop' ? detectSimilarityDropAlerts() : [],
      !alertType || alertType === 'ai_quotation_surge' ? detectAIQuotationSurgeAlerts() : [],
      !alertType || alertType === 'performance_anomaly' ? detectPerformanceAnomalies() : [],
      !alertType || alertType === 'conversion_drop' ? detectConversionDropAlerts() : []
    ]);

    // 全アラートを統合
    let allAlerts = [
      ...similarityAlerts,
      ...quotationAlerts,
      ...performanceAlerts,
      ...conversionAlerts
    ];

    // 重要度フィルタリング
    if (severity) {
      allAlerts = allAlerts.filter(alert => alert.severity === severity);
    }

    // 検知時刻順でソート
    allAlerts.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

    // 制限数で切り取り
    const limitedAlerts = allAlerts.slice(0, limit);

    // サマリー統計計算
    const summary: AlertSummary = {
      total_alerts: allAlerts.length,
      critical_alerts: allAlerts.filter(a => a.severity === 'critical').length,
      warning_alerts: allAlerts.filter(a => a.severity === 'warning').length,
      info_alerts: allAlerts.filter(a => a.severity === 'info').length,
      alerts_by_type: {
        similarity_drop: allAlerts.filter(a => a.type === 'similarity_drop').length,
        ai_quotation_surge: allAlerts.filter(a => a.type === 'ai_quotation_surge').length,
        performance_anomaly: allAlerts.filter(a => a.type === 'performance_anomaly').length,
        conversion_drop: allAlerts.filter(a => a.type === 'conversion_drop').length,
        sns_spike: allAlerts.filter(a => a.type === 'sns_spike').length
      },
      recent_alerts: limitedAlerts.slice(0, 10),
      trending_issues: [
        {
          type: 'similarity_drop',
          frequency: allAlerts.filter(a => a.type === 'similarity_drop').length,
          trend: 'stable'
        },
        {
          type: 'ai_quotation_surge',
          frequency: allAlerts.filter(a => a.type === 'ai_quotation_surge').length,
          trend: 'increasing'
        }
      ]
    };

    console.log('✅ アラート検知完了:', {
      totalAlerts: allAlerts.length,
      criticalAlerts: summary.critical_alerts,
      warningAlerts: summary.warning_alerts
    });

    return NextResponse.json({
      success: true,
      summary,
      alerts: limitedAlerts,
      filters: {
        type: alertType || 'all',
        severity: severity || 'all',
        limit
      },
      timestamp: new Date().toISOString(),
      message: `${allAlerts.length}件のアラートを検知しました`
    });

  } catch (error) {
    console.error('❌ アラート検知エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: 'アラートの検知に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}

// OPTIONSメソッド対応（CORS）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 