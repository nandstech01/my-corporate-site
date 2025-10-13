/**
 * 🎬 ショート動画台本生成用トレンドクエリ
 * 
 * 目的: 「AIが読む今日」- 一般ニュースをAI視点で再解釈
 * 特徴:
 * - 一般ニュース（日常、スポーツ、エンタメ、社会問題など）
 * - 話題性とリアルタイム性重視
 * - AI的再解釈がしやすいトピック
 * 
 * 使用場所: /api/admin/generate-youtube-script/route.ts のショート動画生成時
 */

export const SCRIPT_TREND_QUERIES = {
  /**
   * 1️⃣ 日常・生活系（10個）
   */
  daily_life: [
    '熊 出没 今日 日本',
    '桜 開花 ニュース',
    'SNS 炎上 今日',
    'ペット ブーム ニュース',
    'キャンプ アウトドア 人気',
    '食品 値上げ ニュース 今日',
    '電気代 高騰 ニュース',
    'マスク 着用 ニュース',
    '在宅勤務 働き方 ニュース',
    '時短 家事 ライフハック',
  ],

  /**
   * 2️⃣ 自然・環境系（8個）
   */
  nature_environment: [
    '台風 進路 予測',
    '地震 速報 今日',
    '猛暑 記録 ニュース',
    '気候変動 異常気象',
    '水不足 ニュース 日本',
    '森林火災 ニュース',
    '生物多様性 絶滅危惧',
    '海洋プラスチック 問題',
  ],

  /**
   * 3️⃣ スポーツ系（8個）
   */
  sports: [
    '大谷翔平 ニュース 今日',
    'サッカー 日本代表 試合結果',
    '野球 WBC ニュース',
    'オリンピック ニュース',
    'マラソン 記録 更新',
    'テニス 錦織圭 ニュース',
    'バスケ NBA 八村塁',
    'フィギュアスケート 羽生結弦',
  ],

  /**
   * 4️⃣ エンタメ・文化系（6個）
   */
  entertainment: [
    '映画 興行収入 ランキング',
    'アニメ ヒット 鬼滅',
    '芸能 ニュース 今日 速報',
    '音楽 チャート Billboard',
    'ドラマ 視聴率 ランキング',
    '漫画 ランキング 売上',
  ],

  /**
   * 5️⃣ 社会問題系（8個）
   */
  social_issues: [
    '少子化 対策 政策',
    '高齢化 社会 介護',
    '待機児童 問題 解決策',
    '年金 制度 改革',
    '教育 格差 問題',
    'ジェンダー 平等 最新',
    '外国人 労働者 受け入れ',
    '物価高 生活 影響',
  ],

  /**
   * 6️⃣ 経済・ビジネス系（6個）
   */
  economy_business: [
    '株価 急騰 ニュース',
    '円安 円高 影響',
    'M&A ニュース 今日',
    'スタートアップ 資金調達',
    '働き方改革 企業事例',
    '副業 解禁 ニュース',
  ],

  /**
   * 7️⃣ 科学・技術（一般レベル・4個）
   */
  science_general: [
    '宇宙開発 JAXA ニュース',
    '医療 新技術 iPS細胞',
    'ロボット 開発 ニュース',
    '再生可能エネルギー 太陽光',
  ],
};

/**
 * 全クエリをフラット配列で取得
 */
export function getAllScriptTrendQueries(): string[] {
  return [
    ...SCRIPT_TREND_QUERIES.daily_life,
    ...SCRIPT_TREND_QUERIES.nature_environment,
    ...SCRIPT_TREND_QUERIES.sports,
    ...SCRIPT_TREND_QUERIES.entertainment,
    ...SCRIPT_TREND_QUERIES.social_issues,
    ...SCRIPT_TREND_QUERIES.economy_business,
    ...SCRIPT_TREND_QUERIES.science_general,
  ];
}

/**
 * ランダムに1個のクエリを選択（ショート動画生成用）
 */
export function getRandomScriptTrendQuery(): string {
  const allQueries = getAllScriptTrendQueries();
  const randomIndex = Math.floor(Math.random() * allQueries.length);
  return allQueries[randomIndex];
}

/**
 * カテゴリ別にランダム選択
 */
export function getScriptTrendQueriesByCategory(category: keyof typeof SCRIPT_TREND_QUERIES, count: number = 1): string[] {
  const queries = SCRIPT_TREND_QUERIES[category];
  const shuffled = queries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * AI的再解釈のマッピング例（参考）
 */
export const AI_INTERPRETATION_EXAMPLES = {
  '熊 出没': '文脈の逸脱（LLMO）',
  '桜 開花': '季節パターンの認識（時系列予測）',
  'SNS 炎上': '感情ベクトルの連鎖（レコメンドシステム）',
  '大谷翔平': '二刀流=マルチタスク最適化（Multi-Task Learning）',
  '株価 急騰': '市場センチメント分析（感情分析）',
  '台風 進路': '予測モデルの精度（機械学習）',
  '映画 興行収入': '需要予測（予測モデル）',
  '働き方改革': '業務最適化（タスク管理AI）',
  '少子化 対策': '人口予測モデル（時系列予測）',
  '猛暑 記録': '気候パターンの変化（時系列予測）',
};

