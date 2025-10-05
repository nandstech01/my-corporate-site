/**
 * トレンドRAG品質スコアリングシステム
 * 
 * 設計理念:
 * - トレンドRAGは「使い捨て」の情報源
 * - 厳密な品質管理で低品質データを排除
 * - 24時間以内の新鮮なデータのみ使用
 * 
 * @author N&S Corporation
 * @date 2025-10-05
 */

export interface TrendSource {
  name: string;
  url: string;
  description: string;
  published?: string;
  age?: string;
}

export interface TrendQualityScore {
  sourceReliability: number;  // ソース信頼性（0-100）
  freshness: number;          // 鮮度（0-100）
  contentQuality: number;     // コンテンツ品質（0-100）
  totalScore: number;         // 総合スコア（0-100）
  
  // 詳細情報
  sourceTier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  ageInHours: number;
  qualityBreakdown: {
    hasSufficientTitle: boolean;
    hasSufficientDescription: boolean;
    hasKeywords: boolean;
    hasValidURL: boolean;
    hasPublishDate: boolean;
  };
  
  // 判定結果
  isQualified: boolean;  // 60点以上かどうか
  reason?: string;       // 不合格の理由
}

/**
 * ソース信頼性階層
 */
const SOURCE_TIERS = {
  tier1: {
    sources: ['NHK', 'Nikkei', '日本経済新聞', 'Reuters', 'Bloomberg', 'BBC', 'CNN'],
    score: 95,
    description: '公的機関・大手メディア'
  },
  tier2: {
    sources: ['Impress', 'ITmedia', 'TechCrunch', 'Gigazine', 'Engadget', 'The Verge', 'Wired'],
    score: 80,
    description: '専門技術メディア'
  },
  tier3: {
    sources: ['YouTube', 'Note', 'Qiita', 'Zenn', 'Medium'],
    score: 60,
    description: 'コミュニティメディア'
  },
  tier4: {
    sources: [],
    score: 40,
    description: 'その他のソース'
  }
};

/**
 * AIキーワードリスト（トレンド判定用）
 */
const AI_KEYWORDS = [
  'AI', 'ChatGPT', 'GPT', 'OpenAI', 'Claude', 'Anthropic',
  'Gemini', 'Google AI', 'Perplexity', 'LLM', '大規模言語モデル',
  '生成AI', '人工知能', '機械学習', 'ディープラーニング',
  'AI検索', 'AIモード', 'AIO', 'LLMO', 'GEO',
  'AI活用', 'AI導入', 'DX', 'デジタルトランスフォーメーション'
];

/**
 * トレンド品質スコアを計算
 */
export function calculateTrendQualityScore(source: TrendSource): TrendQualityScore {
  // 1. ソース信頼性スコア
  const { sourceTier, sourceReliability } = calculateSourceReliability(source.name);
  
  // 2. 鮮度スコア
  const { ageInHours, freshness } = calculateFreshness(source.age || source.published);
  
  // 3. コンテンツ品質スコア
  const { contentQuality, qualityBreakdown } = calculateContentQuality(source);
  
  // 総合スコア計算
  const totalScore = Math.round(
    sourceReliability * 0.4 +
    freshness * 0.4 +
    contentQuality * 0.2
  );
  
  // 合格判定（60点以上）
  const isQualified = totalScore >= 60;
  let reason: string | undefined;
  
  if (!isQualified) {
    if (freshness < 50) {
      reason = '鮮度不足（24時間以上経過）';
    } else if (sourceReliability < 40) {
      reason = 'ソース信頼性不足';
    } else if (contentQuality < 40) {
      reason = 'コンテンツ品質不足';
    } else {
      reason = '総合スコア不足';
    }
  }
  
  return {
    sourceReliability,
    freshness,
    contentQuality,
    totalScore,
    sourceTier,
    ageInHours,
    qualityBreakdown,
    isQualified,
    reason
  };
}

/**
 * ソース信頼性スコア計算
 */
function calculateSourceReliability(sourceName: string): {
  sourceTier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  sourceReliability: number;
} {
  const normalizedSource = sourceName.toLowerCase();
  
  for (const [tier, config] of Object.entries(SOURCE_TIERS)) {
    const isMatch = config.sources.some(s => 
      normalizedSource.includes(s.toLowerCase())
    );
    
    if (isMatch) {
      return {
        sourceTier: tier as any,
        sourceReliability: config.score
      };
    }
  }
  
  // デフォルトはtier4
  return {
    sourceTier: 'tier4',
    sourceReliability: SOURCE_TIERS.tier4.score
  };
}

/**
 * 鮮度スコア計算
 */
function calculateFreshness(dateString?: string): {
  ageInHours: number;
  freshness: number;
} {
  if (!dateString) {
    // 日付情報がない場合は低スコア
    return { ageInHours: 999, freshness: 20 };
  }
  
  // 日付をパース
  let publishDate: Date;
  
  // "pd"（過去1日）などの相対表記の場合
  if (dateString === 'pd' || dateString.includes('時間前') || dateString.includes('分前')) {
    publishDate = new Date(); // 現在時刻として扱う
  } else {
    publishDate = new Date(dateString);
  }
  
  // 経過時間を計算（時間単位）
  const ageInMillis = Date.now() - publishDate.getTime();
  const ageInHours = ageInMillis / (1000 * 60 * 60);
  
  // 鮮度スコア計算
  let freshness: number;
  if (ageInHours < 0) {
    // 未来の日付（エラー）
    freshness = 0;
  } else if (ageInHours <= 6) {
    freshness = 100;
  } else if (ageInHours <= 12) {
    freshness = 90;
  } else if (ageInHours <= 18) {
    freshness = 75;
  } else if (ageInHours <= 24) {
    freshness = 50;
  } else {
    freshness = 0; // 24時間以上は使用不可
  }
  
  return { ageInHours, freshness };
}

/**
 * コンテンツ品質スコア計算
 */
function calculateContentQuality(source: TrendSource): {
  contentQuality: number;
  qualityBreakdown: TrendQualityScore['qualityBreakdown'];
} {
  let score = 0;
  
  // タイトルの長さチェック（20文字以上）
  const hasSufficientTitle = (source.name?.length || 0) >= 20;
  if (hasSufficientTitle) score += 20;
  
  // 説明の長さチェック（100文字以上）
  const hasSufficientDescription = (source.description?.length || 0) >= 100;
  if (hasSufficientDescription) score += 20;
  
  // AIキーワード含有チェック
  const text = `${source.name} ${source.description}`.toLowerCase();
  const hasKeywords = AI_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
  if (hasKeywords) score += 30;
  
  // 有効なURL
  const hasValidURL = source.url && source.url.startsWith('http');
  if (hasValidURL) score += 15;
  
  // 公開日付あり
  const hasPublishDate = !!source.published || !!source.age;
  if (hasPublishDate) score += 15;
  
  return {
    contentQuality: score,
    qualityBreakdown: {
      hasSufficientTitle,
      hasSufficientDescription,
      hasKeywords,
      hasValidURL,
      hasPublishDate
    }
  };
}

/**
 * バッチ処理：複数のトレンドデータをスコアリング
 */
export function batchScoreTrendData(sources: TrendSource[]): {
  qualified: Array<TrendSource & { score: TrendQualityScore }>;
  rejected: Array<TrendSource & { score: TrendQualityScore }>;
  stats: {
    total: number;
    qualified: number;
    rejected: number;
    averageScore: number;
  };
} {
  const qualified: Array<TrendSource & { score: TrendQualityScore }> = [];
  const rejected: Array<TrendSource & { score: TrendQualityScore }> = [];
  let totalScore = 0;
  
  for (const source of sources) {
    const score = calculateTrendQualityScore(source);
    totalScore += score.totalScore;
    
    if (score.isQualified) {
      qualified.push({ ...source, score });
    } else {
      rejected.push({ ...source, score });
    }
  }
  
  return {
    qualified,
    rejected,
    stats: {
      total: sources.length,
      qualified: qualified.length,
      rejected: rejected.length,
      averageScore: sources.length > 0 ? Math.round(totalScore / sources.length) : 0
    }
  };
}

/**
 * トレンドデータが使用可能かチェック
 */
export function isTrendDataUsable(source: TrendSource): boolean {
  const score = calculateTrendQualityScore(source);
  return score.isQualified && score.ageInHours < 24;
}

/**
 * スコアリング結果のログ出力
 */
export function logQualityScore(source: TrendSource, score: TrendQualityScore): void {
  const status = score.isQualified ? '✅ 合格' : '❌ 不合格';
  
  console.log(`\n${status} トレンドデータ品質スコア`);
  console.log(`タイトル: ${source.name}`);
  console.log(`総合スコア: ${score.totalScore}点`);
  console.log(`  - ソース信頼性: ${score.sourceReliability}点 (${score.sourceTier})`);
  console.log(`  - 鮮度: ${score.freshness}点 (${score.ageInHours.toFixed(1)}時間前)`);
  console.log(`  - コンテンツ品質: ${score.contentQuality}点`);
  
  if (!score.isQualified && score.reason) {
    console.log(`不合格理由: ${score.reason}`);
  }
}

