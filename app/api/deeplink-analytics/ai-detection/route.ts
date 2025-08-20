import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// AI検索エンジンの定義（詳細版）
const AI_SEARCH_ENGINES = [
  {
    name: 'ChatGPT',
    engine: 'ChatGPT',
    patterns: {
      userAgent: ['ChatGPT', 'OpenAI', 'GPTBot', 'ChatGPT-User'],
      referrer: ['chat.openai.com', 'chatgpt.com', 'openai.com/chatgpt'],
      queryParams: ['chatgpt', 'openai']
    },
    confidence: 0.95
  },
  {
    name: 'Google AI (Gemini/Bard)',
    engine: 'Google AI',
    patterns: {
      userAgent: ['GoogleAI', 'Bard', 'Gemini', 'Google-Extended'],
      referrer: ['bard.google.com', 'gemini.google.com', 'ai.google.com', 'google.com/search'],
      queryParams: ['bard', 'gemini', 'google-ai', 'ai']
    },
    confidence: 0.90
  },
  {
    name: 'Claude AI',
    engine: 'Claude',
    patterns: {
      userAgent: ['Claude', 'AnthropicAI', 'ClaudeBot'],
      referrer: ['claude.ai', 'www.claude.ai', 'anthropic.com'],
      queryParams: ['claude']
    },
    confidence: 0.95
  },
  {
    name: 'Perplexity AI',
    engine: 'Perplexity',
    patterns: {
      userAgent: ['PerplexityBot', 'Perplexity', 'PerplexityAI'],
      referrer: ['perplexity.ai', 'www.perplexity.ai'],
      queryParams: ['perplexity']
    },
    confidence: 0.95
  },
  {
    name: 'Microsoft Copilot',
    engine: 'Copilot',
    patterns: {
      userAgent: ['Copilot', 'BingBot', 'Microsoft'],
      referrer: ['copilot.microsoft.com', 'bing.com/chat', 'edge.microsoft.com'],
      queryParams: ['copilot', 'bing-ai']
    },
    confidence: 0.85
  }
];

// AI引用検出関数
function detectAIEngine(userAgent: string, referrer: string, queryString: string): {
  engine: string | null;
  confidence: number;
  detectionMethod: string[];
} {
  const detectionMethods: string[] = [];
  let bestMatch = { engine: null as string | null, confidence: 0 };

  for (const aiEngine of AI_SEARCH_ENGINES) {
    let currentConfidence = 0;
    const methods: string[] = [];

    // User-Agent検証
    const userAgentMatch = aiEngine.patterns.userAgent.some(pattern => 
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );
    if (userAgentMatch) {
      currentConfidence += 0.4;
      methods.push('user-agent');
    }

    // Referrer検証
    const referrerMatch = aiEngine.patterns.referrer.some(pattern => 
      referrer.toLowerCase().includes(pattern.toLowerCase())
    );
    if (referrerMatch) {
      currentConfidence += 0.5;
      methods.push('referrer');
    }

    // Query Parameter検証
    const queryMatch = aiEngine.patterns.queryParams.some(pattern => 
      queryString.toLowerCase().includes(pattern.toLowerCase())
    );
    if (queryMatch) {
      currentConfidence += 0.3;
      methods.push('query-params');
    }

    // 最低信頼度チェック
    if (currentConfidence >= 0.3 && currentConfidence > bestMatch.confidence) {
      bestMatch = {
        engine: aiEngine.engine,
        confidence: Math.min(currentConfidence * aiEngine.confidence, 1.0)
      };
      detectionMethods.splice(0, detectionMethods.length, ...methods);
    }
  }

  return {
    engine: bestMatch.engine,
    confidence: bestMatch.confidence,
    detectionMethod: detectionMethods
  };
}

// Fragment ID抽出関数
function extractFragmentId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hash ? urlObj.hash.substring(1) : null;
  } catch {
    return null;
  }
}

// AI引用記録関数
async function recordAIQuotation(
  fragmentId: string,
  completeUri: string,
  aiEngine: string,
  confidence: number,
  detectionMethod: string[],
  userAgent: string,
  referrer: string
) {
  try {
    const { data, error } = await supabase
      .from('ai_quotation_history')
      .insert({
        fragment_id: fragmentId,
        complete_uri: completeUri,
        ai_engine: aiEngine,
        quotation_context: `自動検出: ${detectionMethod.join(', ')} (信頼度: ${(confidence * 100).toFixed(1)}%)`,
        quotation_quality_score: confidence,
        quotation_type: 'auto-detected',
        detected_source: 'auto-detection'
      });

    if (error) throw error;

    // deeplink_analyticsテーブルも更新
    const { error: updateError } = await supabase
      .from('deeplink_analytics')
      .upsert({
        fragment_id: fragmentId,
        complete_uri: completeUri,
        page_path: new URL(completeUri).pathname,
        ai_quotation_count: 1
      }, {
        onConflict: 'fragment_id,page_path',
        ignoreDuplicates: false
      });

    if (updateError) {
      console.error('deeplink_analytics更新エラー:', updateError);
    }

    return { success: true, data };
  } catch (error) {
    console.error('AI引用記録エラー:', error);
    return { success: false, error };
  }
}

// POST: AI引用検出（リアルタイム）
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI引用自動検出開始...');

    const body = await request.json();
    const {
      url,
      userAgent = '',
      referrer = '',
      queryString = ''
    } = body;

    // 必須パラメータチェック
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URLが必要です'
      }, { status: 400 });
    }

    // Fragment ID抽出
    const fragmentId = extractFragmentId(url);
    if (!fragmentId) {
      return NextResponse.json({
        success: false,
        error: 'Fragment IDが見つかりません'
      }, { status: 400 });
    }

    // AI引用検出
    const detection = detectAIEngine(userAgent, referrer, queryString);

    if (!detection.engine || detection.confidence < 0.3) {
      return NextResponse.json({
        success: false,
        message: 'AI検索エンジンが検出されませんでした',
        detection
      });
    }

    // AI引用記録
    const recordResult = await recordAIQuotation(
      fragmentId,
      url,
      detection.engine,
      detection.confidence,
      detection.detectionMethod,
      userAgent,
      referrer
    );

    console.log(`✅ AI引用検出成功: ${detection.engine} (${fragmentId})`);

    return NextResponse.json({
      success: true,
      detection: {
        engine: detection.engine,
        confidence: detection.confidence,
        method: detection.detectionMethod,
        fragmentId,
        recorded: recordResult.success
      }
    });

  } catch (error) {
    console.error('AI引用検出エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'AI引用検出に失敗しました'
    }, { status: 500 });
  }
}

// GET: 検出統計取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 検出統計取得
    const { data: detections, error } = await supabase
      .from('ai_quotation_history')
      .select('*')
      .eq('detected_source', 'auto-detection')
      .gte('detected_at', startDate.toISOString())
      .order('detected_at', { ascending: false });

    if (error) throw error;

    // 統計集計
    const stats = {
      totalDetections: detections?.length || 0,
      byEngine: {} as Record<string, number>,
      byConfidence: {
        high: 0,    // 0.8+
        medium: 0,  // 0.5-0.8
        low: 0      // 0.3-0.5
      },
      recentDetections: detections?.slice(0, 10) || []
    };

    detections?.forEach(detection => {
      // エンジン別集計
      stats.byEngine[detection.ai_engine] = (stats.byEngine[detection.ai_engine] || 0) + 1;

      // 信頼度別集計
      const confidence = detection.quotation_quality_score || 0;
      if (confidence >= 0.8) stats.byConfidence.high++;
      else if (confidence >= 0.5) stats.byConfidence.medium++;
      else stats.byConfidence.low++;
    });

    return NextResponse.json({
      success: true,
      stats,
      period: `過去${days}日間`
    });

  } catch (error) {
    console.error('検出統計取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: '統計取得に失敗しました'
    }, { status: 500 });
  }
} 