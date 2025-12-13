/**
 * バイラルフックパターンテンプレート
 * 
 * MrBeast、TikTok、YouTubeショートなどで
 * 実証済みの高効果フックパターンを定義
 * 
 * @created 2025-12-12
 * @version 1.0.0
 */

export interface HookPattern {
  id: string;
  name: string;
  type: 'shock' | 'transformation' | 'pov' | 'curiosity' | 'contradiction' | 'question' | 'numbers' | 'secret';
  template: string;
  variables: string[];
  effectiveness_score: number; // 0.0-1.0
  target_audience: 'general' | 'developer' | 'architect' | 'all';
  description: string;
  example: string;
  source: string;
  use_cases: string[];
}

/**
 * バイラルフックパターンのマスターリスト
 */
export const VIRAL_HOOK_PATTERNS: HookPattern[] = [
  // ========================================
  // Shock型（衝撃・驚き）
  // ========================================
  {
    id: 'shock-mrbeast-challenge',
    name: 'MrBeast Challenge型',
    type: 'shock',
    template: '{subject}に{amount}{unit}使ったら{unexpected_result}になった',
    variables: ['subject', 'amount', 'unit', 'unexpected_result'],
    effectiveness_score: 0.95,
    target_audience: 'general',
    description: '巨額投資や極端な挑戦で視聴者を釘付けにする',
    example: 'AIに300万円使ったら人生が変わった',
    source: 'MrBeast',
    use_cases: ['ビジネス投資', 'ツール導入', 'サービス利用']
  },
  {
    id: 'shock-disaster-averted',
    name: '破滅回避型',
    type: 'shock',
    template: '{action}しなかったら{disaster}するところだった',
    variables: ['action', 'disaster'],
    effectiveness_score: 0.90,
    target_audience: 'general',
    description: '危機回避ストーリーで共感を得る',
    example: 'この設定をしなかったら全データが消えるところだった',
    source: 'Tech TikTok',
    use_cases: ['セキュリティ', 'バックアップ', '設定ミス']
  },

  // ========================================
  // Transformation型（変化・成長）
  // ========================================
  {
    id: 'transformation-before-after',
    name: 'Before/After型',
    type: 'transformation',
    template: '{timeframe}前の{subject}と今の{subject}が別人すぎる',
    variables: ['timeframe', 'subject'],
    effectiveness_score: 0.92,
    target_audience: 'all',
    description: '劇的な変化を見せて希望を与える',
    example: '3ヶ月前のホームページと今のホームページが別物すぎる',
    source: 'Transformation TikTok',
    use_cases: ['デザイン改善', 'パフォーマンス改善', 'ビジネス成長']
  },
  {
    id: 'transformation-nobody-everybody',
    name: '無名→有名型',
    type: 'transformation',
    template: '{timeframe}で{nobody}が{somebody}になった方法',
    variables: ['timeframe', 'nobody', 'somebody'],
    effectiveness_score: 0.88,
    target_audience: 'general',
    description: '成功ストーリーで希望を与える',
    example: '6ヶ月で無名の町工場が予約3ヶ月待ちになった方法',
    source: 'Success Stories',
    use_cases: ['ビジネス成長', 'ブランディング', 'マーケティング']
  },

  // ========================================
  // POV型（視点転換）
  // ========================================
  {
    id: 'pov-insider',
    name: 'インサイダー視点型',
    type: 'pov',
    template: '{profession}の僕が{situation}見た時の反応',
    variables: ['profession', 'situation'],
    effectiveness_score: 0.85,
    target_audience: 'all',
    description: '専門家の視点で信頼性を高める',
    example: 'AIエンジニアの僕がこのホームページ見た時の反応',
    source: 'POV TikTok',
    use_cases: ['専門家レビュー', '業界あるある', 'リアクション']
  },
  {
    id: 'pov-role-reversal',
    name: '立場逆転型',
    type: 'pov',
    template: 'もし{role_a}が{role_b}だったら{situation}',
    variables: ['role_a', 'role_b', 'situation'],
    effectiveness_score: 0.82,
    target_audience: 'general',
    description: '立場を逆転させて面白さを出す',
    example: 'もしAIがホームページ制作会社を選ぶとしたら絶対こうする',
    source: 'Comedy TikTok',
    use_cases: ['比較', 'ユーモア', '視点転換']
  },

  // ========================================
  // Curiosity型（好奇心）
  // ========================================
  {
    id: 'curiosity-secret',
    name: '秘密暴露型',
    type: 'curiosity',
    template: '{industry}が絶対に教えたくない{secret}',
    variables: ['industry', 'secret'],
    effectiveness_score: 0.93,
    target_audience: 'all',
    description: '業界の裏側を見せて興味を引く',
    example: 'ホームページ制作会社が絶対に教えたくない真実',
    source: 'Exposé Content',
    use_cases: ['業界知識', '裏側公開', '暴露系']
  },
  {
    id: 'curiosity-why-nobody',
    name: 'なぜ誰も〇〇しない型',
    type: 'curiosity',
    template: 'なぜ誰も{action}しないのか？{reason}だから。',
    variables: ['action', 'reason'],
    effectiveness_score: 0.87,
    target_audience: 'all',
    description: '常識を疑問視して注目を集める',
    example: 'なぜ誰もAIでホームページ作らないのか？知らないだけだから。',
    source: 'Provocative Content',
    use_cases: ['啓蒙', '常識破壊', '問題提起']
  },

  // ========================================
  // Contradiction型（矛盾・逆説）
  // ========================================
  {
    id: 'contradiction-opposite',
    name: '真逆の真実型',
    type: 'contradiction',
    template: '{common_belief}は嘘。本当は{truth}。',
    variables: ['common_belief', 'truth'],
    effectiveness_score: 0.91,
    target_audience: 'all',
    description: '常識を覆して注目を集める',
    example: '高いホームページが良いは嘘。本当はAI活用が9割。',
    source: 'Myth Busting',
    use_cases: ['常識破壊', '誤解解消', '教育']
  },
  {
    id: 'contradiction-counterintuitive',
    name: '逆説的成功型',
    type: 'contradiction',
    template: '{action}するほど{opposite_result}になる理由',
    variables: ['action', 'opposite_result'],
    effectiveness_score: 0.86,
    target_audience: 'developer',
    description: '直感に反する真実で興味を引く',
    example: 'コード書くほど遅くなる理由',
    source: 'Paradox Content',
    use_cases: ['技術解説', 'ベストプラクティス', 'アンチパターン']
  },

  // ========================================
  // Question型（質問・疑問）
  // ========================================
  {
    id: 'question-what-if',
    name: 'もし〇〇だったら型',
    type: 'question',
    template: 'もし{condition}だったら{result}できる？',
    variables: ['condition', 'result'],
    effectiveness_score: 0.84,
    target_audience: 'all',
    description: '仮定質問で想像力を刺激',
    example: 'もしAIが全部やってくれたら何に時間使う？',
    source: 'Hypothetical Content',
    use_cases: ['未来予測', '可能性提示', '思考実験']
  },
  {
    id: 'question-why-still',
    name: 'なぜまだ〇〇してるの型',
    type: 'question',
    template: 'なぜまだ{old_way}してるの？{new_way}があるのに。',
    variables: ['old_way', 'new_way'],
    effectiveness_score: 0.89,
    target_audience: 'all',
    description: '時代遅れを指摘して新しい方法を提案',
    example: 'なぜまだ手動で作ってるの？AIがあるのに。',
    source: 'Disruptive Content',
    use_cases: ['技術移行', '効率化', 'イノベーション']
  },

  // ========================================
  // Numbers型（数字・データ）
  // ========================================
  {
    id: 'numbers-shocking-stat',
    name: '衝撃的な数字型',
    type: 'numbers',
    template: '{number}{unit}の人が{action}して{result}してる',
    variables: ['number', 'unit', 'action', 'result'],
    effectiveness_score: 0.88,
    target_audience: 'all',
    description: '具体的な数字で信憑性を高める',
    example: '83%の企業がAI導入して売上2倍にしてる',
    source: 'Data-Driven Content',
    use_cases: ['統計紹介', 'トレンド説明', '実績アピール']
  },
  {
    id: 'numbers-time-money',
    name: '時間・お金節約型',
    type: 'numbers',
    template: '{action}で{timeframe}と{amount}円を節約できた',
    variables: ['action', 'timeframe', 'amount'],
    effectiveness_score: 0.90,
    target_audience: 'general',
    description: '具体的な節約効果で価値を示す',
    example: 'AI活用で3週間と50万円を節約できた',
    source: 'ROI Content',
    use_cases: ['効率化', 'コスト削減', 'ROI訴求']
  },

  // ========================================
  // Secret型（秘密・裏技）
  // ========================================
  {
    id: 'secret-hidden-feature',
    name: '隠れ機能型',
    type: 'secret',
    template: '{subject}の99%が知らない{feature}',
    variables: ['subject', 'feature'],
    effectiveness_score: 0.87,
    target_audience: 'all',
    description: '知られていない情報で優越感を与える',
    example: 'AIツールの99%が知らない無料機能',
    source: 'Tips & Tricks',
    use_cases: ['ハウツー', 'チュートリアル', '便利技']
  },
  {
    id: 'secret-backdoor',
    name: '裏ルート型',
    type: 'secret',
    template: '{goal}する最短ルートは{method}だった',
    variables: ['goal', 'method'],
    effectiveness_score: 0.85,
    target_audience: 'all',
    description: '効率的な方法で価値を提供',
    example: 'ホームページ集客する最短ルートはAI×SEOだった',
    source: 'Shortcut Content',
    use_cases: ['ハック', '効率化', '最適化']
  },

  // ========================================
  // AI/Tech特化型
  // ========================================
  {
    id: 'tech-ai-revolution',
    name: 'AI革命型',
    type: 'transformation',
    template: 'AIが{industry}を{change}した瞬間',
    variables: ['industry', 'change'],
    effectiveness_score: 0.91,
    target_audience: 'all',
    description: 'AI導入による劇的な変化を示す',
    example: 'AIがホームページ制作を10分にした瞬間',
    source: 'AI Content',
    use_cases: ['AI導入', 'デジタル変革', '自動化']
  },
  {
    id: 'tech-future-now',
    name: '未来は今型',
    type: 'curiosity',
    template: '{year}に来ると思ってた{technology}が今使える',
    variables: ['year', 'technology'],
    effectiveness_score: 0.86,
    target_audience: 'developer',
    description: 'SF的な技術が現実になったことを示す',
    example: '2030年に来ると思ってたAI秘書が今使える',
    source: 'Futurism Content',
    use_cases: ['技術紹介', '未来予測', 'イノベーション']
  },

  // ========================================
  // Regional/Local特化型
  // ========================================
  {
    id: 'local-hidden-gem',
    name: '地域の隠れた宝型',
    type: 'curiosity',
    template: '{place}の人だけが知ってる{secret}',
    variables: ['place', 'secret'],
    effectiveness_score: 0.83,
    target_audience: 'general',
    description: '地域限定情報で興味を引く',
    example: '滋賀県の人だけが知ってるAI活用法',
    source: 'Local Content',
    use_cases: ['地域SEO', 'ローカルビジネス', '地域特化']
  },
  {
    id: 'local-vs-tokyo',
    name: '地方vs東京型',
    type: 'contradiction',
    template: '{place}が東京より{aspect}で優れてる理由',
    variables: ['place', 'aspect'],
    effectiveness_score: 0.82,
    target_audience: 'general',
    description: '地方の優位性を示して共感を得る',
    example: '滋賀県が東京よりAI活用で優れてる理由',
    source: 'Regional Pride',
    use_cases: ['地域プライド', '比較', '地方創生']
  }
];

/**
 * パターンタイプ別の取得
 */
export function getPatternsByType(type: HookPattern['type']): HookPattern[] {
  return VIRAL_HOOK_PATTERNS.filter(pattern => pattern.type === type);
}

/**
 * ターゲットオーディエンス別の取得
 */
export function getPatternsByAudience(audience: HookPattern['target_audience']): HookPattern[] {
  return VIRAL_HOOK_PATTERNS.filter(
    pattern => pattern.target_audience === audience || pattern.target_audience === 'all'
  );
}

/**
 * 効果スコア順にソート
 */
export function getTopPatterns(limit: number = 10): HookPattern[] {
  return [...VIRAL_HOOK_PATTERNS]
    .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
    .slice(0, limit);
}

/**
 * IDでパターンを取得
 */
export function getPatternById(id: string): HookPattern | undefined {
  return VIRAL_HOOK_PATTERNS.find(pattern => pattern.id === id);
}

/**
 * ユースケースで検索
 */
export function getPatternsByUseCase(useCase: string): HookPattern[] {
  return VIRAL_HOOK_PATTERNS.filter(pattern =>
    pattern.use_cases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
  );
}

