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
  type:
    | 'shock'
    | 'transformation'
    | 'pov'
    | 'curiosity'
    | 'contradiction'
    | 'question'
    | 'numbers'
    | 'secret'
    | 'first-line-punch'
    | 'save-worthy'
    | 'dm-shareable';
  template: string;
  variables: string[];
  effectiveness_score: number; // 0.0-1.0
  target_audience: 'general' | 'developer' | 'architect' | 'all';
  description: string;
  example: string;
  source: string;
  use_cases: string[];
  // X For You Algorithm Update 2026-05-15 alignment (grox AI scoring).
  // Optional — newer patterns set these to guide selection on top of effectiveness_score.
  save_worthiness_score?: number; // 0.0-1.0: likely to be bookmarked
  read_to_end_score?: number; // 0.0-1.0: likely to be read through (counts as "+" reaction)
  first_line_punch_score?: number; // 0.0-1.0: 1st line stops the scroll
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
  },

  // ========================================
  // X For You Algorithm Update 2026-05-15 aligned patterns
  // grox AI scoring favors: read-to-end, saves, DM shares, replies
  // Penalizes: AI mass-production, baiting, low information density
  // ========================================
  {
    id: 'first-line-conclusion',
    name: '1行目で結論型',
    type: 'first-line-punch',
    template: '{conclusion}。\n\n{evidence}',
    variables: ['conclusion', 'evidence'],
    effectiveness_score: 0.90,
    target_audience: 'all',
    description: '結論を先頭に置いて即座に注意を引き、続きで根拠を示す',
    example: 'X APIは月$200で死んだ。\n\n代替はPlaywright session一択。実装3日で動いた。',
    source: 'X Algorithm 2026-05-15 (read-to-end weighting)',
    use_cases: ['実装報告', '結論駆動', 'スクロール停止'],
    first_line_punch_score: 0.95,
    read_to_end_score: 0.80,
    save_worthiness_score: 0.60
  },
  {
    id: 'save-worthy-checklist',
    name: '保存推奨チェックリスト型',
    type: 'save-worthy',
    template: '{topic}でやってよかった{n}つ\n\n{list_with_one_line_reasons}',
    variables: ['topic', 'n', 'list_with_one_line_reasons'],
    effectiveness_score: 0.88,
    target_audience: 'developer',
    description: '番号付き要点リスト。後で見返したくなる構造で保存・DM共有を誘発',
    example: 'CORTEXを止めずにLLM移行した3つの判断\n1. claude -p経由でAPIを捨てた\n2. Mac runnerで認証を継承した\n3. ハングは process.exit(0) で潰した',
    source: 'X Algorithm 2026-05-15 (saves + DM weighting)',
    use_cases: ['ノウハウ整理', '保存誘発', 'リファレンス'],
    save_worthiness_score: 0.92,
    read_to_end_score: 0.75,
    first_line_punch_score: 0.70
  },
  {
    id: 'dm-shareable-insight',
    name: 'DM共有想起型',
    type: 'dm-shareable',
    template: '{specific_role}に共有したくなる話。{insight_one_liner}。{context_2_sentences}',
    variables: ['specific_role', 'insight_one_liner', 'context_2_sentences'],
    effectiveness_score: 0.86,
    target_audience: 'all',
    description: '「あの人に送りたい」と想起させる対象を明示。1人へのDM共有を狙う',
    example: 'CTOに送りたい話。X APIが従量課金になった件、Playwright session で完全回避できる。実装の難所はNode hangと cleanup、両方ハマり処方箋あり。',
    source: 'X Algorithm 2026-05-15 (DM share weighting)',
    use_cases: ['DM共有誘発', '特定読者への呼びかけ', '一次共有'],
    save_worthiness_score: 0.78,
    read_to_end_score: 0.70,
    first_line_punch_score: 0.85
  },

  // ========================================
  // 日本語バズ型（@masahirochaen 等トップ日本AIアカウント参照）
  // ハイブリッド方針: 構造的バズレバー（【】ヘッダ / 保存版〇選 / 速報 / daily recap /
  // 数字ショック）は採用しつつ、実務家の信頼を損なう過度な煽りは避ける。
  // アルゴリズム重み: bookmark=5 / RT=6 / reply=75-150 / like=0.5 → 保存・RT・リプ最適化。
  // ========================================
  {
    id: 'jp-save-list-n',
    name: '保存版〇選型',
    type: 'save-worthy',
    template: '【保存版】{theme}{category}{n}選\n\n①{item1}：{benefit1}\n②{item2}：{benefit2}\n③{item3}：{benefit3}\n\n{closing_value}\n保存して後で使ってください👇',
    variables: ['theme', 'category', 'n', 'item1', 'benefit1', 'item2', 'benefit2', 'item3', 'benefit3', 'closing_value'],
    effectiveness_score: 0.93,
    target_audience: 'all',
    description: 'ツール/プロンプト/Tipsの番号付きリスト。後で見返したくなる構造でブックマークを誘発（最高のbookmark率）',
    example: '【保存版】会議が劇的にラクになるAIツール5選\n\n①tl;dv：会議を自動録画＆文字起こし\n②Claude：議事録を一瞬で要約\n③Gamma：議事録をスライド化\n\n全部無料プランあり。\n保存して後で使ってください👇',
    source: 'masahirochaen / 保存版フォーマット',
    use_cases: ['ツールリスト', 'プロンプト集', 'ノウハウ整理', '保存誘発'],
    save_worthiness_score: 0.95,
    read_to_end_score: 0.80,
    first_line_punch_score: 0.78
  },
  {
    id: 'jp-breaking-finally',
    name: '速報・遂に型',
    type: 'first-line-punch',
    template: '【速報】{service}が遂に{what_happened}。\n\n{what_you_can_do}。\n{spec_or_number}。\n\n{impact_on_work}。',
    variables: ['service', 'what_happened', 'what_you_can_do', 'spec_or_number', 'impact_on_work'],
    effectiveness_score: 0.90,
    target_audience: 'all',
    description: '新モデル/機能/ニュースを速報。発表から2時間以内が最も伸びる。RT最適化',
    example: '【速報】Claudeが遂にコード実行環境を内蔵。\n\nチャット内でPythonを直接実行・検証できるように。\nGPTの2倍速でデータ分析が完了。\n\nエンジニアの検証フローが根本から変わる。',
    source: 'masahirochaen / 速報フォーマット',
    use_cases: ['新機能速報', 'リリース反応', 'ニュース一次反応'],
    save_worthiness_score: 0.55,
    read_to_end_score: 0.78,
    first_line_punch_score: 0.92
  },
  {
    id: 'jp-end-of-announcement',
    name: '〇〇終了のお知らせ型',
    type: 'contradiction',
    template: '【{existing_thing}終了のお知らせ】\n\n遂に、{new_tool}が{what_it_does}。\n\n・{capability1}\n・{capability2}\n・{capability3}\n\n{old_way}はもういらない。',
    variables: ['existing_thing', 'new_tool', 'what_it_does', 'capability1', 'capability2', 'capability3', 'old_way'],
    effectiveness_score: 0.89,
    target_audience: 'all',
    description: '新AIが従来ツール/プロセスを陳腐化させる。RT(衝撃共有)+リプ(議論)の両取り。煽りすぎ注意',
    example: '【手作業スライド終了のお知らせ】\n\n遂に、Gammaが日本語1文からスライドを自動生成。\n\n・テーマ入力だけでプロ品質のデッキ\n・画像/グラフも自動挿入\n・ブランドカラーも記憶\n\n「スライド3時間」はもういらない。',
    source: 'masahirochaen / 終了のお知らせフォーマット',
    use_cases: ['ツール代替', '業務効率化', '破壊的変化'],
    save_worthiness_score: 0.62,
    read_to_end_score: 0.82,
    first_line_punch_score: 0.90
  },
  {
    id: 'jp-daily-recap',
    name: '今日のAI業界まとめ型',
    type: 'save-worthy',
    template: '今日のAI業界が激動すぎたので復習を。\n\n🔴 {news1}\n🟡 {news2}\n🟢 {news3}\n\n{outlook_or_takeaway}',
    variables: ['news1', 'news2', 'news3', 'outlook_or_takeaway'],
    effectiveness_score: 0.91,
    target_audience: 'all',
    description: '日次キュレーション。「見ておけば追える」便利さでRT+保存を両取り。daily-buzz統合の本命フォーマット',
    example: '今日のAI業界が激動すぎたので復習を。\n\n🔴 OpenAIがo4をAPI公開。推論速度4倍\n🟡 Geminiがマルチモーダル最高スコア更新\n🟢 AnthropicがClaude企業価格を30%引き下げ\n\nAIコストの急落が今年の格差を決める。',
    source: 'masahirochaen / daily recap（最高パフォーマンス帯）',
    use_cases: ['日次まとめ', 'ニュースキュレーション', '夜の本命投稿'],
    save_worthiness_score: 0.85,
    read_to_end_score: 0.83,
    first_line_punch_score: 0.72
  },
  {
    id: 'jp-wait-too-good',
    name: '待って。〜すぎる型',
    type: 'curiosity',
    template: '待って。\n\n{tool_or_feature}の{capability}が{strong_adjective}て\n本当に{task_or_role}がオワコンになりそう。\n\n{what_it_does_2_3_sentences}。\n\n{reaction_or_question}。',
    variables: ['tool_or_feature', 'capability', 'strong_adjective', 'task_or_role', 'what_it_does_2_3_sentences', 'reaction_or_question'],
    effectiveness_score: 0.87,
    target_audience: 'all',
    description: 'カジュアルなスクロール停止。会話的トーンでリプ障壁を下げる（reply最適化＝最高アルゴ重み）',
    example: '待って。\n\nGeminiの動画解析が高精度すぎて\n本当にプロの編集者がオワコンになりそう。\n\n2時間の録画を入れるだけでハイライト・字幕・要約が10分で完成。日本語も精度ほぼ完璧。\n\nこれ月1万円で使える時代。',
    source: 'masahirochaen / 待って。フォーマット',
    use_cases: ['驚き共有', 'カジュアル反応', '議論喚起'],
    save_worthiness_score: 0.58,
    read_to_end_score: 0.80,
    first_line_punch_score: 0.88
  },
  {
    id: 'jp-number-shock',
    name: '数字ショック型',
    type: 'numbers',
    template: '{subject}が{number_or_stat}という事実。\n\n{context_1}。\n{scale_comparison}。\n\n{implication}。',
    variables: ['subject', 'number_or_stat', 'context_1', 'scale_comparison', 'implication'],
    effectiveness_score: 0.88,
    target_audience: 'all',
    description: '具体数字で認識を塗り替える。ビジネス層のRT(知性シグナル)+リプ(議論)を誘発',
    example: 'ChatGPTの月間利用者が5億人を突破したという事実。\n\nローンチからわずか2年半。Googleが検索で同規模に達するまで10年かかった。\n\n「まだ様子見」の判断が5年後にどう見えるか。',
    source: 'masahirochaen / 数字ショックフォーマット',
    use_cases: ['データ提示', '市場規模', '採用統計', '資金調達'],
    save_worthiness_score: 0.70,
    read_to_end_score: 0.76,
    first_line_punch_score: 0.82
  },
  {
    id: 'jp-good-news',
    name: '朗報型',
    type: 'shock',
    template: '【朗報】{service}が遂に{improvement}。\n\n{before_after_contrast}。\n{who_or_how}。\n\n{soft_cta_or_reaction}。',
    variables: ['service', 'improvement', 'before_after_contrast', 'who_or_how', 'soft_cta_or_reaction'],
    effectiveness_score: 0.85,
    target_audience: 'all',
    description: '値下げ/無料枠拡大/アクセス開放。「良いニュースを共有」心理でRTされやすい',
    example: '【朗報】Claude Proが遂に月2,000円に値下げ。\n\n旧3,000円から全ユーザー自動適用。プロジェクト機能も長文処理もそのまま。\n\nSonnetを使い込んでる人は確認を。',
    source: 'masahirochaen / 朗報フォーマット',
    use_cases: ['値下げ', '無料枠', 'アクセス開放', 'API開放'],
    save_worthiness_score: 0.60,
    read_to_end_score: 0.72,
    first_line_punch_score: 0.80
  },
  {
    id: 'jp-discovery-nanto',
    name: 'なんと〜型',
    type: 'curiosity',
    template: 'なんと、{ai}が遂に{surprising_capability}。\n\n{what_specifically}。\n{comparison_or_scale}。\n\n{impact_or_feeling}。',
    variables: ['ai', 'surprising_capability', 'what_specifically', 'comparison_or_scale', 'impact_or_feeling'],
    effectiveness_score: 0.84,
    target_audience: 'all',
    description: '「信じられる？」型の発見フック。会話的でRT障壁が低い',
    example: 'なんと、ChatGPTが音声だけでアプリを作れるように。\n\nコード1行も書かず、話しかけるだけで動くWebアプリが完成。テスト込み平均8分。\n\nエンジニア不要の時代が本当に来た。',
    source: 'masahirochaen / なんとフォーマット',
    use_cases: ['新機能の驚き', '発見共有'],
    save_worthiness_score: 0.55,
    read_to_end_score: 0.74,
    first_line_punch_score: 0.83
  },
  {
    id: 'jp-complete-prompt-pack',
    name: '完全版プロンプト大全型',
    type: 'save-worthy',
    template: '【完全版】{theme}プロンプト{n}選\n\nプロが実務で使う厳選リスト。\n\n▼{cat1}\n「{prompt1}」\n\n▼{cat2}\n「{prompt2}」\n\n保存して後で使ってください🙏',
    variables: ['theme', 'n', 'cat1', 'prompt1', 'cat2', 'prompt2'],
    effectiveness_score: 0.90,
    target_audience: 'developer',
    description: '大規模プロンプト集/ワークフロー集。全テンプレ中で最高のブックマーク率・エバーグリーン',
    example: '【完全版】仕事で使えるClaudeプロンプト6選\n\nプロが実務で使う厳選リスト。\n\n▼メール返信\n「以下に丁寧かつ簡潔に返信文を：[引用]」\n\n▼会議準備\n「このアジェンダのFAQと回答例を5つ：[アジェンダ]」\n\n保存して後で使ってください🙏',
    source: 'masahirochaen / 完全版フォーマット',
    use_cases: ['プロンプト集', 'ワークフロー集', 'リファレンス', '保存誘発'],
    save_worthiness_score: 0.94,
    read_to_end_score: 0.78,
    first_line_punch_score: 0.74
  },
  {
    id: 'jp-workflow-howto',
    name: '保存版ワークフロー手順型',
    type: 'save-worthy',
    template: '【保存版】{task}をAIで{time_saving}する方法\n\n{frequency_note}\n\n①{tool1}：{step1}\n②{tool2}：{step2}\n③{tool3}：{step3}\n\n{result_quantified}',
    variables: ['task', 'time_saving', 'frequency_note', 'tool1', 'step1', 'tool2', 'step2', 'tool3', 'step3', 'result_quantified'],
    effectiveness_score: 0.87,
    target_audience: 'all',
    description: '手作業を置き換える具体ワークフロー。コピペで使える実用性で保存される',
    example: '【保存版】週次レポートをAIで30分→5分にする方法\n\n毎週やってる人は今すぐ試して。\n\n①Notion AI：情報を自動集約\n②Claude：構造化・要約\n③Gamma：スライド化\n\n年間21時間が戻ってくる。',
    source: 'masahirochaen / ワークフローフォーマット',
    use_cases: ['業務自動化', '時短手順', 'How-to'],
    save_worthiness_score: 0.90,
    read_to_end_score: 0.80,
    first_line_punch_score: 0.73
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

