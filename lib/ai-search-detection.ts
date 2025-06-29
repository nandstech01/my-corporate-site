// Phase 4: AI検索流入検知システム
// ChatGPT・Perplexity・Google AI Mode等からの流入を自動検知

export interface AISearchSource {
  name: string;
  type: 'chatgpt' | 'perplexity' | 'google-ai' | 'claude' | 'bard' | 'other';
  userAgentPatterns: string[];
  referrerPatterns: string[];
  queryParams?: string[];
  confidence: number; // 0-1の信頼度
}

export interface TrafficSource {
  source: AISearchSource | null;
  isAISearch: boolean;
  confidence: number;
  detectionMethod: 'user-agent' | 'referrer' | 'query-param' | 'unknown';
  rawUserAgent?: string;
  rawReferrer?: string;
  timestamp: number;
}

export interface AISearchStats {
  totalVisits: number;
  aiSearchVisits: number;
  aiSearchPercentage: number;
  sourceBreakdown: Record<string, number>;
  conversionRate?: number;
  avgSessionDuration?: number;
}

/**
 * AI検索エンジンの定義
 */
const AI_SEARCH_SOURCES: AISearchSource[] = [
  {
    name: 'ChatGPT Search',
    type: 'chatgpt',
    userAgentPatterns: [
      'ChatGPT',
      'OpenAI',
      'GPTBot',
      'ChatGPT-User'
    ],
    referrerPatterns: [
      'chat.openai.com',
      'chatgpt.com',
      'openai.com/chatgpt'
    ],
    queryParams: ['chatgpt', 'openai'],
    confidence: 0.9
  },
  {
    name: 'Perplexity AI',
    type: 'perplexity',
    userAgentPatterns: [
      'PerplexityBot',
      'Perplexity',
      'PerplexityAI'
    ],
    referrerPatterns: [
      'perplexity.ai',
      'www.perplexity.ai'
    ],
    queryParams: ['perplexity'],
    confidence: 0.95
  },
  {
    name: 'Google AI Mode',
    type: 'google-ai',
    userAgentPatterns: [
      'GoogleAI',
      'Bard',
      'Gemini'
    ],
    referrerPatterns: [
      'bard.google.com',
      'gemini.google.com',
      'ai.google.com'
    ],
    queryParams: ['bard', 'gemini', 'google-ai'],
    confidence: 0.85
  },
  {
    name: 'Claude AI',
    type: 'claude',
    userAgentPatterns: [
      'Claude',
      'AnthropicAI',
      'ClaudeBot'
    ],
    referrerPatterns: [
      'claude.ai',
      'www.claude.ai',
      'anthropic.com'
    ],
    queryParams: ['claude'],
    confidence: 0.9
  },
  {
    name: 'Other AI Search',
    type: 'other',
    userAgentPatterns: [
      'AI',
      'Bot',
      'Assistant',
      'Search'
    ],
    referrerPatterns: [],
    confidence: 0.3
  }
];

/**
 * AI検索流入検知システム
 */
export class AISearchDetectionSystem {
  private sources: AISearchSource[];
  private detectionHistory: TrafficSource[] = [];

  constructor() {
    this.sources = AI_SEARCH_SOURCES;
  }

  /**
   * リクエストヘッダーからAI検索流入を検知
   */
  detectAISearchTraffic(headers: Headers, url?: string): TrafficSource {
    const userAgent = headers.get('user-agent') || '';
    const referrer = headers.get('referer') || headers.get('referrer') || '';
    const timestamp = Date.now();

    // User-Agentベースの検知
    const userAgentDetection = this.detectByUserAgent(userAgent);
    if (userAgentDetection.source) {
      const result: TrafficSource = {
        source: userAgentDetection.source,
        isAISearch: true,
        confidence: userAgentDetection.confidence,
        detectionMethod: 'user-agent',
        rawUserAgent: userAgent,
        rawReferrer: referrer,
        timestamp
      };
      this.detectionHistory.push(result);
      return result;
    }

    // リファラーベースの検知
    const referrerDetection = this.detectByReferrer(referrer);
    if (referrerDetection.source) {
      const result: TrafficSource = {
        source: referrerDetection.source,
        isAISearch: true,
        confidence: referrerDetection.confidence,
        detectionMethod: 'referrer',
        rawUserAgent: userAgent,
        rawReferrer: referrer,
        timestamp
      };
      this.detectionHistory.push(result);
      return result;
    }

    // クエリパラメータベースの検知
    if (url) {
      const queryDetection = this.detectByQueryParams(url);
      if (queryDetection.source) {
        const result: TrafficSource = {
          source: queryDetection.source,
          isAISearch: true,
          confidence: queryDetection.confidence,
          detectionMethod: 'query-param',
          rawUserAgent: userAgent,
          rawReferrer: referrer,
          timestamp
        };
        this.detectionHistory.push(result);
        return result;
      }
    }

    // AI検索ではない通常のトラフィック
    const result: TrafficSource = {
      source: null,
      isAISearch: false,
      confidence: 0,
      detectionMethod: 'unknown',
      rawUserAgent: userAgent,
      rawReferrer: referrer,
      timestamp
    };
    this.detectionHistory.push(result);
    return result;
  }

  /**
   * User-Agentパターンマッチング
   */
  private detectByUserAgent(userAgent: string): { source: AISearchSource | null; confidence: number } {
    for (const source of this.sources) {
      for (const pattern of source.userAgentPatterns) {
        if (userAgent.toLowerCase().includes(pattern.toLowerCase())) {
          return {
            source,
            confidence: source.confidence
          };
        }
      }
    }
    return { source: null, confidence: 0 };
  }

  /**
   * リファラーパターンマッチング
   */
  private detectByReferrer(referrer: string): { source: AISearchSource | null; confidence: number } {
    if (!referrer) return { source: null, confidence: 0 };

    for (const source of this.sources) {
      for (const pattern of source.referrerPatterns) {
        if (referrer.toLowerCase().includes(pattern.toLowerCase())) {
          return {
            source,
            confidence: source.confidence
          };
        }
      }
    }
    return { source: null, confidence: 0 };
  }

  /**
   * クエリパラメータマッチング
   */
  private detectByQueryParams(url: string): { source: AISearchSource | null; confidence: number } {
    try {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;

      for (const source of this.sources) {
        if (source.queryParams) {
          for (const param of source.queryParams) {
            if (searchParams.has(param)) {
              return {
                source,
                confidence: Math.max(0.5, source.confidence - 0.2) // クエリパラメータは信頼度を少し下げる
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('URL parsing error:', error);
    }
    return { source: null, confidence: 0 };
  }

  /**
   * AI検索トラフィック統計生成
   */
  generateAISearchStats(timeRange: number = 24 * 60 * 60 * 1000): AISearchStats {
    const cutoffTime = Date.now() - timeRange;
    const recentTraffic = this.detectionHistory.filter(traffic => traffic.timestamp > cutoffTime);
    
    const totalVisits = recentTraffic.length;
    const aiSearchVisits = recentTraffic.filter(traffic => traffic.isAISearch).length;
    const aiSearchPercentage = totalVisits > 0 ? (aiSearchVisits / totalVisits) * 100 : 0;

    const sourceBreakdown: Record<string, number> = {};
    recentTraffic.forEach(traffic => {
      if (traffic.source) {
        sourceBreakdown[traffic.source.name] = (sourceBreakdown[traffic.source.name] || 0) + 1;
      }
    });

    return {
      totalVisits,
      aiSearchVisits,
      aiSearchPercentage,
      sourceBreakdown
    };
  }

  /**
   * Click-Recovery Bannerを表示すべきかの判定
   */
  shouldShowClickRecoveryBanner(trafficSource: TrafficSource): boolean {
    return trafficSource.isAISearch && trafficSource.confidence > 0.5;
  }

  /**
   * AI検索ソース別のメッセージ生成
   */
  generateRecoveryMessage(trafficSource: TrafficSource): {
    title: string;
    message: string;
    ctaText: string;
    urgency: 'low' | 'medium' | 'high';
  } {
    if (!trafficSource.source) {
      return {
        title: 'より詳しい情報をお探しですか？',
        message: '当サイトでは最新のAI技術情報を提供しています。',
        ctaText: 'サービス一覧を見る',
        urgency: 'low'
      };
    }

    const sourceMessages: Record<string, any> = {
      'ChatGPT Search': {
        title: 'ChatGPTでご覧いただき、ありがとうございます！',
        message: '当社では最新のAI技術を活用したソリューションを提供しています。詳細な情報や具体的なご相談をお気軽にお聞かせください。',
        ctaText: '無料相談を申し込む',
        urgency: 'high'
      },
      'Perplexity AI': {
        title: 'Perplexity AIからお越しいただき、ありがとうございます！',
        message: 'AI検索でお調べいただいた内容について、より詳しいサービス情報や実装事例をご用意しています。',
        ctaText: '詳細を確認する',
        urgency: 'high'
      },
      'Google AI Mode': {
        title: 'Google AI検索からお越しいただき、ありがとうございます！',
        message: '検索されたトピックに関する包括的なソリューションを提供しています。お気軽にお問い合わせください。',
        ctaText: 'お問い合わせ',
        urgency: 'medium'
      }
    };

    return sourceMessages[trafficSource.source.name] || sourceMessages['ChatGPT Search'];
  }

  /**
   * AI検索流入ログの取得
   */
  getDetectionHistory(limit: number = 100): TrafficSource[] {
    return this.detectionHistory.slice(-limit);
  }

  /**
   * 検知履歴のクリア
   */
  clearDetectionHistory(): void {
    this.detectionHistory = [];
  }
}

// シングルトンインスタンス
export const aiSearchDetection = new AISearchDetectionSystem(); 