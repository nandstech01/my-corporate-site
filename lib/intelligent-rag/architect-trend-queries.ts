/**
 * 🏗️ AIアーキテクト記事生成用トレンドクエリ
 * 
 * 目的: AIエンジニア/アーキテクトのキャリア・年収・案件獲得に関する記事を生成
 * 特徴:
 * - 年収・単価・市場規模などの具体的な数字を取得
 * - キャリアパス・学習ロードマップの情報を取得
 * - 技術的なpain point・実装課題の情報を取得
 * 
 * 使用場所: /api/generate-rag-blog/route.ts でBrave Search APIを呼び出す際のクエリ
 *          generationMode === 'architect' の場合に使用
 */

export const ARCHITECT_TREND_QUERIES = {
  /**
   * 1️⃣ キャリア・年収系
   * - AIエンジニア/アーキテクトの年収情報
   * - フリーランス単価情報
   * - 市場動向
   */
  career_income: [
    // 年収・単価
    'AIエンジニア 年収 2025 相場',
    'AIアーキテクト 年収 求人 日本',
    'フリーランス AIエンジニア 単価 相場',
    '機械学習エンジニア 年収 東京',
    '生成AI エンジニア 月額単価 フリーランス',
    'RAG エンジニア 求人 単価',
    'MLOps エンジニア 年収 2025',
    'LLM 開発 案件 単価',
    
    // 市場・成長
    'AI 人材 不足 2025 日本',
    '生成AI 市場規模 成長率 日本',
    'AI エンジニア 需要 将来性',
    'AIスキル 賃金プレミアム 給与上昇',
  ],

  /**
   * 2️⃣ キャリアパス・学習系
   * - 未経験からのロードマップ
   * - 必要スキル・資格
   * - 学習方法
   */
  career_path: [
    // ロードマップ
    'AIエンジニア 未経験 転職 ロードマップ',
    'AIエンジニア なるには 学習方法',
    '機械学習 独学 ロードマップ 2025',
    'データサイエンティスト キャリアパス',
    'AIアーキテクト なるには スキル',
    
    // 資格
    'AI 資格 おすすめ 2025',
    'G検定 E資格 違い 難易度',
    'AWS 機械学習 認定 難易度',
    'AI 資格 転職 有利',
    
    // スキル
    'AIエンジニア 必要スキル 2025',
    'RAG 実装 必要スキル',
    'プロンプトエンジニアリング スキル',
    'ベクトルDB スキル 需要',
  ],

  /**
   * 3️⃣ 案件獲得・フリーランス系
   * - フリーランス案件の取り方
   * - ポートフォリオ
   * - 営業方法
   */
  freelance_acquisition: [
    // 案件獲得
    'フリーランス エンジニア 案件獲得 方法',
    'AI案件 獲得 営業 方法',
    'フリーランス AI 高単価 案件',
    'エージェント フリーランス AI おすすめ',
    
    // ポートフォリオ
    'AIエンジニア ポートフォリオ 作り方',
    '機械学習 ポートフォリオ GitHub',
    'RAG ポートフォリオ プロジェクト',
    
    // 副業
    'AI 副業 案件 土日',
    'エンジニア 副業 AI 稼ぐ',
    'ChatGPT 副業 案件',
  ],

  /**
   * 4️⃣ 技術的Pain Point・実装課題系
   * - RAG/LLM実装の課題
   * - 失敗事例・解決策
   * - 差別化要素としての技術課題
   */
  technical_challenges: [
    // RAG課題
    'RAG 実装 課題 解決策',
    'RAG 精度 向上 方法',
    'ベクトル検索 精度 改善',
    'ハイブリッド検索 RAG 実装',
    
    // LLM課題
    'LLM ハルシネーション 対策',
    'プロンプト インジェクション 対策',
    'LLM コスト 削減 方法',
    'LLM レイテンシ 改善',
    
    // 実装課題
    'AI プロジェクト 失敗 原因',
    'AI 導入 ROI 測定',
    'AI PoC 本番 移行 課題',
    'MLOps 運用 課題',
  ],

  /**
   * 5️⃣ AI検索・次世代SEO系（専門領域）
   * - AIO/LLMO/GEO
   * - 構造化データ
   * - AI引用最適化
   */
  ai_search_optimization: [
    // AIO/LLMO
    'AI検索 最適化 AIO 方法',
    'ChatGPT 引用 される 方法',
    'Perplexity 引用 SEO',
    'Google AI Overviews 対策',
    
    // 構造化データ
    'Schema.org 構造化データ AI',
    'JSON-LD SEO AI最適化',
    'Fragment ID SEO 効果',
    
    // ベクトル検索
    'セマンティック検索 SEO',
    'ベクトル埋め込み コンテンツ最適化',
  ],
};

/**
 * 全クエリをフラット配列で取得
 */
export function getAllArchitectTrendQueries(): string[] {
  return [
    ...ARCHITECT_TREND_QUERIES.career_income,
    ...ARCHITECT_TREND_QUERIES.career_path,
    ...ARCHITECT_TREND_QUERIES.freelance_acquisition,
    ...ARCHITECT_TREND_QUERIES.technical_challenges,
    ...ARCHITECT_TREND_QUERIES.ai_search_optimization,
  ];
}

/**
 * ランダムにN個のクエリを選択
 */
export function getRandomArchitectTrendQueries(count: number = 5): string[] {
  const allQueries = getAllArchitectTrendQueries();
  const shuffled = allQueries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * カテゴリ別にランダム選択
 */
export function getArchitectTrendQueriesByCategory(
  category: keyof typeof ARCHITECT_TREND_QUERIES, 
  count: number = 3
): string[] {
  const queries = ARCHITECT_TREND_QUERIES[category];
  const shuffled = queries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * バランスよく各カテゴリから選択
 */
export function getBalancedArchitectTrendQueries(totalCount: number = 10): string[] {
  const categories = Object.keys(ARCHITECT_TREND_QUERIES) as (keyof typeof ARCHITECT_TREND_QUERIES)[];
  const perCategory = Math.ceil(totalCount / categories.length);
  
  const selected: string[] = [];
  for (const category of categories) {
    const categoryQueries = getArchitectTrendQueriesByCategory(category, perCategory);
    selected.push(...categoryQueries);
  }
  
  return selected.slice(0, totalCount);
}

/**
 * 記事タイプ別のクエリ選択
 */
export function getArchitectQueriesByArticleType(
  articleType: 'career' | 'technical' | 'freelance' | 'general',
  count: number = 5
): string[] {
  switch (articleType) {
    case 'career':
      return [
        ...getArchitectTrendQueriesByCategory('career_income', 3),
        ...getArchitectTrendQueriesByCategory('career_path', 2),
      ].slice(0, count);
    
    case 'technical':
      return [
        ...getArchitectTrendQueriesByCategory('technical_challenges', 3),
        ...getArchitectTrendQueriesByCategory('ai_search_optimization', 2),
      ].slice(0, count);
    
    case 'freelance':
      return [
        ...getArchitectTrendQueriesByCategory('freelance_acquisition', 3),
        ...getArchitectTrendQueriesByCategory('career_income', 2),
      ].slice(0, count);
    
    case 'general':
    default:
      return getBalancedArchitectTrendQueries(count);
  }
}

