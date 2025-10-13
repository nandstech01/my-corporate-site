/**
 * 🧠 ブログ記事生成用トレンドクエリ
 * 
 * 目的: AI/テック専門性を維持しつつ、入口を広げる
 * 特徴:
 * - AI専門用語のエコーチェンバーを避ける
 * - 業界別AI活用、課題・失敗事例、周辺領域を含む
 * - ただし、一般ニュース（熊、大谷など）は含まない
 * 
 * 使用場所: /api/generate-rag-blog/route.ts でBrave Search APIを呼び出す際のクエリ
 */

export const BLOG_TREND_QUERIES = {
  /**
   * 1️⃣ AI活用・事例系（入口を広げる）
   * - 業界別AI活用事例
   * - AI課題・失敗事例（差別化）
   */
  ai_use_cases: [
    // 業界別AI活用
    'AI 活用 製造業 事例 2025',
    'AI 導入 医療 成功事例',
    'AI 小売 EC 活用 最新',
    'AI 金融 フィンテック 事例',
    'AI 物流 最適化 事例',
    'AI 教育 e-learning 活用',
    'AI マーケティング 自動化 最新',
    'AI 人事 HR tech 導入事例',
    'AI 農業 スマート農業 IoT',
    'AI 建設 DX 事例',
    
    // AI課題・失敗系
    'AI 導入 失敗 原因',
    'AI プロジェクト 失敗 理由',
    'AI 倫理 問題 最新',
    'AI バイアス 対策 方法',
    'AI セキュリティ リスク 対策',
    'AI コスト 削減 方法',
    'AI 人材 不足 解決策',
    'AI ROI 測定 指標',
  ],

  /**
   * 2️⃣ DX・デジタル変革系（AI周辺領域）
   * - AI以外のDX事例
   * - システム統合、業務効率化
   */
  dx_digital: [
    'DX 推進 成功事例 日本',
    'デジタル化 中小企業 補助金',
    'クラウド 移行 失敗 原因',
    'リモートワーク DX ツール 比較',
    'ペーパーレス化 成功事例',
    '業務効率化 RPA ツール',
    'SaaS 導入 失敗 リスク',
    'データ活用 BI ツール 比較',
    'API 連携 システム統合 方法',
    'ノーコード ローコード 開発 事例',
    'レガシーシステム 刷新 事例',
    'セキュリティ対策 サイバー攻撃',
  ],

  /**
   * 3️⃣ AI技術トレンド系（専門性維持）
   * - LLM、RAG、検索最適化など
   * - あなたの専門領域（Vector Link、LLMO、GEO）
   */
  ai_tech: [
    // LLM関連
    'LLM 活用 企業 事例 日本',
    'プロンプトエンジニアリング 最新手法',
    'RAG システム 実装 事例',
    'ファインチューニング コスト 削減',
    'AI エージェント 活用 事例',
    '生成AI セキュリティ 対策',
    'ChatGPT Enterprise 導入事例',
    
    // 検索最適化（あなたの専門領域）
    'AI検索 最適化 SEO',
    'ベクトル検索 実装 PostgreSQL',
    'セマンティック検索 活用',
    'ハイブリッド検索 BM25 ベクトル',
    'AI SEO GEO 対策',
    'Relevance Engineering 最新',
    
    // AI技術トレンド
    'マルチモーダルAI 活用事例',
    'エンベディング モデル 比較',
    'AI モデル 軽量化 方法',
    'プライベートLLM 構築 事例',
  ],

  /**
   * 4️⃣ ビジネス×AI系（広い入口）
   * - AI市場、規制、ビジネスモデル
   */
  business_ai: [
    'AI スタートアップ 資金調達 2025',
    'AI 規制 法律 日本',
    'AI 著作権 問題 最新判例',
    'AI ビジネスモデル SaaS',
    'AI コンサルティング 市場規模',
    'AI 人材 育成 研修プログラム',
    'AI 投資 トレンド VC',
    'AI M&A 買収 最新',
    'AIプロダクト PMF 達成方法',
    'AI 受託開発 単価 相場',
  ],
};

/**
 * 全クエリをフラット配列で取得
 */
export function getAllBlogTrendQueries(): string[] {
  return [
    ...BLOG_TREND_QUERIES.ai_use_cases,
    ...BLOG_TREND_QUERIES.dx_digital,
    ...BLOG_TREND_QUERIES.ai_tech,
    ...BLOG_TREND_QUERIES.business_ai,
  ];
}

/**
 * ランダムにN個のクエリを選択
 */
export function getRandomBlogTrendQueries(count: number = 5): string[] {
  const allQueries = getAllBlogTrendQueries();
  const shuffled = allQueries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * カテゴリ別にランダム選択
 */
export function getBlogTrendQueriesByCategory(category: keyof typeof BLOG_TREND_QUERIES, count: number = 3): string[] {
  const queries = BLOG_TREND_QUERIES[category];
  const shuffled = queries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * バランスよく各カテゴリから選択
 */
export function getBalancedBlogTrendQueries(totalCount: number = 10): string[] {
  const categories = Object.keys(BLOG_TREND_QUERIES) as (keyof typeof BLOG_TREND_QUERIES)[];
  const perCategory = Math.ceil(totalCount / categories.length);
  
  const selected: string[] = [];
  for (const category of categories) {
    const categoryQueries = getBlogTrendQueriesByCategory(category, perCategory);
    selected.push(...categoryQueries);
  }
  
  return selected.slice(0, totalCount);
}

