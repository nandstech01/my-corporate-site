/**
 * X投稿生成テンプレート（実務家ペルソナ版）
 */

export interface PatternTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: string;
  dataSources: string[];
  features: string[];
  generateDiagram: boolean;
}

export const patternTemplates: PatternTemplate[] = [
  {
    id: 'practitioner_take',
    name: '実務家の視点',
    description: 'ニュースを自分の実装経験から語る',
    template: `{practitioner_context}

{insight_from_experience}

{question_to_readers}`,
    category: 'perspective',
    dataSources: ['trend', 'company', 'x_post', 'trending'],
    features: ['実装経験ベース', '独自視点', '問いかけ'],
    generateDiagram: false
  },
  {
    id: 'build_log',
    name: '実装メモ',
    description: '実際に作って/運用して気づいたこと',
    template: `{what_i_built}

{surprising_finding}

{lesson_learned}`,
    category: 'engineering',
    dataSources: ['company', 'trend'],
    features: ['実装体験', '発見共有', '学び'],
    generateDiagram: false
  },
  {
    id: 'design_decision',
    name: '設計判断',
    description: 'なぜXを選んだか、トレードオフ',
    template: `{decision_context}

{tradeoff_analysis}

{what_would_you_choose}`,
    category: 'architecture',
    dataSources: ['company', 'trend'],
    features: ['設計思考', 'トレードオフ', '選択の背景'],
    generateDiagram: false
  },
  {
    id: 'contrarian_view',
    name: '逆張り考察',
    description: '通説と異なる実務の観察',
    template: `{common_belief}

{contrarian_observation}

{open_question}`,
    category: 'analysis',
    dataSources: ['trend', 'company', 'trending'],
    features: ['通説への疑問', '実務からの反証', '議論喚起'],
    generateDiagram: false
  },
  {
    id: 'question_thread',
    name: '問いかけ',
    description: '読者に議論を投げかける',
    template: `{context_setting}

{core_question}

{my_current_thinking}`,
    category: 'discussion',
    dataSources: ['trend', 'company', 'x_post', 'trending'],
    features: ['議論喚起', '読者参加', '思考共有'],
    generateDiagram: false
  },
  {
    id: 'future_bet',
    name: '未来予測',
    description: '現状シグナルからの予測',
    template: `{current_signal}

{prediction_and_reasoning}

{what_are_you_betting_on}`,
    category: 'forecast',
    dataSources: ['trend', 'company'],
    features: ['シグナル分析', '予測', '賭け'],
    generateDiagram: false
  },
  {
    id: 'quote_opinion',
    name: '引用RT意見',
    description: '公式アカウントの投稿に対する実務家の独自意見',
    template: `{practitioner_reaction}

{unique_insight}

{open_discussion}`,
    category: 'quote',
    dataSources: ['x_post'],
    features: ['引用RT', '独自意見', '議論喚起'],
    generateDiagram: false
  },
  {
    id: 'thread_deep_dive',
    name: '長文スレッド',
    description: 'トピックを深掘りする3-5セグメントのスレッド',
    template: `{hook_first_segment}
===
{core_analysis}
===
{cta_question}`,
    category: 'thread',
    dataSources: ['trend', 'company'],
    features: ['スレッド', '深掘り', '長文分析'],
    generateDiagram: false
  },
  {
    id: 'conversation_reply',
    name: '会話返信',
    description: '自投稿への返信に対する会話深度構築',
    template: `{acknowledgement}

{additional_context}

{follow_up_question}`,
    category: 'conversation',
    dataSources: ['x_post'],
    features: ['会話', '返信', '深度構築'],
    generateDiagram: false
  },
  {
    id: 'risk_reduction',
    name: 'リスク低減',
    description: 'AI導入の落とし穴と対策を実務家視点で語る',
    template: `{risk_scenario}

{what_went_wrong}

{mitigation}`,
    category: 'risk',
    dataSources: ['trend', 'company', 'trending'],
    features: ['リスク提示', '実例ベース', '対策共有'],
    generateDiagram: false
  },
  {
    id: 'failure_story',
    name: '失敗談',
    description: '実際の失敗から得た学びを率直に共有',
    template: `{what_i_tried}

{what_happened}

{lesson}`,
    category: 'experience',
    dataSources: ['company', 'trend'],
    features: ['失敗共有', '率直さ', '学び'],
    generateDiagram: false
  },
  {
    id: 'diagnostic_cta',
    name: '診断型CTA',
    description: '読者の課題を診断する問いかけで専門性を示す',
    template: `{diagnostic_question}

{patterns}

{self_check}`,
    category: 'cta',
    dataSources: ['trend', 'company', 'x_post'],
    features: ['診断型', '専門性', 'ソフトCTA'],
    generateDiagram: false
  },
  {
    id: 'raw_rant',
    name: '本音吐露',
    description: 'フラストレーションから本音を語り冷静に分析',
    template: `{frustration}

{honest_take}

{calm_analysis}`,
    category: 'opinion',
    dataSources: ['reddit', 'news', 'release'],
    features: ['感情的', '本音', '率直'],
    generateDiagram: false
  },
  {
    id: 'live_reaction',
    name: 'リアルタイム反応',
    description: '起きたことへの即座の反応と感想',
    template: `{what_happened}

{immediate_reaction}

{takeaway}`,
    category: 'reaction',
    dataSources: ['reddit', 'news', 'release'],
    features: ['速報性', '臨場感', 'リアルタイム'],
    generateDiagram: false
  },
  {
    id: 'correction_apology',
    name: '訂正と学び',
    description: '過去の間違いを認めて新しい理解を共有',
    template: `{previous_claim}

{why_wrong}

{new_understanding}`,
    category: 'experience',
    dataSources: ['reddit', 'news', 'release'],
    features: ['訂正', '成長', '信頼性'],
    generateDiagram: false
  },
  {
    id: 'rapid_hot_takes',
    name: '連射ホットテイク',
    description: '3-5個の大胆な短い意見を一気に投下',
    template: `{take_1}
{take_2}
{take_3}
{take_4}
{take_5}`,
    category: 'opinion',
    dataSources: ['reddit', 'news', 'release'],
    features: ['大胆', '連射', '挑発的'],
    generateDiagram: false
  },
  {
    id: 'internal_debate',
    name: '内部討論',
    description: '賛否両論を自分の中で戦わせて結論を出す',
    template: `{pro_argument}

{counter_argument}

{my_conclusion}`,
    category: 'analysis',
    dataSources: ['reddit', 'news', 'release'],
    features: ['内部対話', '両面', '独自結論'],
    generateDiagram: false
  },
  // 1スロットテンプレート（構造なし、一言）
  {
    id: 'single_thought',
    name: '一言',
    description: '構造を持たない一言の気づき・観察・断定',
    template: `{thought}`,
    category: 'minimal',
    dataSources: ['trend', 'company', 'x_post', 'trending', 'reddit', 'news', 'release'],
    features: ['一言', '構造なし', '自然体'],
    generateDiagram: false
  },
  // 2スロットテンプレート
  {
    id: 'observation_reaction',
    name: '観察→反応',
    description: '事実の観察と、それに対する即座の反応・感想',
    template: `{observation}

{reaction}`,
    category: 'reaction',
    dataSources: ['trend', 'company', 'x_post', 'trending', 'reddit', 'news', 'release'],
    features: ['観察', '即座の反応', '簡潔'],
    generateDiagram: false
  },
  // 4スロットテンプレート
  {
    id: 'layered_analysis',
    name: '多層分析',
    description: '事実→文脈→分析→結論の4層で深く掘り下げる',
    template: `{fact}

{context}

{analysis}

{conclusion}`,
    category: 'analysis',
    dataSources: ['trend', 'company', 'trending', 'reddit', 'news', 'release'],
    features: ['多層', '深掘り', '構造的'],
    generateDiagram: false
  },
  // ========================================
  // バズ構造テンプレ（日本AIトップアカウント参照・ハイブリッド）
  // 保存(bookmark)とRTを最大化する構造。煽りすぎず実務家の信頼を保つ。
  // ========================================
  {
    id: 'buzz_save_list',
    name: '保存版〇選',
    description: 'ツール/プロンプト/Tipsの番号付きリスト。後で見返したくなる構造で保存を誘発',
    template: `【保存版】{theme}{n}選

①{item1}：{benefit1}
②{item2}：{benefit2}
③{item3}：{benefit3}

{closing_value}
保存して後で使ってください👇`,
    category: 'buzz',
    dataSources: ['trend', 'company', 'trending', 'news', 'release'],
    features: ['保存誘発', '番号リスト', '高bookmark率'],
    generateDiagram: false
  },
  {
    id: 'buzz_daily_recap',
    name: '今日のAI業界まとめ',
    description: '日次キュレーション。3件のニュースを色分けで要約しRT+保存を両取り',
    template: `今日のAI業界が激動すぎたので復習を。

🔴 {news1}
🟡 {news2}
🟢 {news3}

{outlook_or_takeaway}`,
    category: 'buzz',
    dataSources: ['trend', 'trending', 'news', 'release'],
    features: ['日次まとめ', 'キュレーション', '夜の本命'],
    generateDiagram: false
  },
  {
    id: 'buzz_breaking',
    name: '速報・遂に',
    description: '新モデル/機能/ニュースの速報。発表2時間以内が最も伸びる',
    template: `【速報】{service}が遂に{what_happened}。

{what_you_can_do}。
{spec_or_number}。

{impact_on_work}。`,
    category: 'buzz',
    dataSources: ['trend', 'company', 'news', 'release', 'trending'],
    features: ['速報', '一次反応', 'RT最適化'],
    generateDiagram: false
  },
  // ========================================
  // セールス（プレイブック monetization/sales 用・出現は約5%に抑制）
  // ペイン→ベネフィット→自然なLINE誘導。売り込み感を排除する。
  // {soft_cta_to_line} には generateLineAddUrl({platform:'x'}) のURLを入れる。
  // ========================================
  {
    id: 'sales_cta_line',
    name: 'LINE誘導CTA',
    description: '読者のペイン→ベネフィット→自然なLINE友だち登録誘導。価値提供の延長として送る',
    template: `{pain_observation}

{benefit_proof}

{soft_cta_to_line}`,
    category: 'cta',
    dataSources: ['trend', 'company'],
    features: ['ペイン共感', 'ベネフィット実証', 'LINEファネル', '低頻度'],
    generateDiagram: false
  },
  // ========================================
  // 高品質バズ構造（日本トップAIアカウントのニュアンスを参考・模倣しすぎない）
  // 共通原則: 結果/結論ファースト → ・箇条書きで具体 → 出典/示唆/軽いCTAで締める。
  // 安易な疑問形（〜な人いる？/どう思う？）で締めない。情報密度で勝負。
  // ========================================
  {
    id: 'save_manual',
    name: '保存版マニュアル型',
    description: '結果/ベネフィットを先頭に置き👇で要点を箇条書き。保存される実用ノウハウ。締めは要点か軽いCTA(疑問形で締めない)',
    template: `【保存版】{result_or_benefit}

{one_line_context}👇

・{point1}
・{point2}
・{point3}

{takeaway_or_soft_cta}`,
    category: 'buzz',
    dataSources: ['trend', 'company', 'release', 'trending'],
    features: ['保存誘発', '結果ファースト', '箇条書き'],
    generateDiagram: false
  },
  {
    id: 'result_first_bullets',
    name: '結論ファースト箇条書き型',
    description: '1行目に結論/事実を断定で置き、・で具体を3-4点。冷静で密度の高い情報提供。疑問形で締めない',
    template: `{punchy_conclusion}。

・{point1}
・{point2}
・{point3}

{insight_or_implication}`,
    category: 'analysis',
    dataSources: ['trend', 'company', 'news', 'release', 'trending', 'reddit'],
    features: ['結論ファースト', '情報密度', '断定'],
    generateDiagram: false
  },
  {
    id: 'curation_take',
    name: 'キュレーション+見解型',
    description: '価値ある情報をシェアし「要点👇」で整理、自分の視点を一言添え、最後に出典。疑問形で締めない',
    template: `{what_it_is}。{why_valuable}。

要点👇

■ {point1}
■ {point2}

{my_take}
出典: {source}`,
    category: 'quote',
    dataSources: ['trend', 'trending', 'news', 'release', 'reddit'],
    features: ['キュレーション', '見解付与', '出典明記'],
    generateDiagram: false
  }
];

// 口調統一ガイドライン
//
// 【ハイブリッド方針】実務家の信頼ベースを保ちつつ、日本AIトップアカウント
// （@masahirochaen 等）のバズ構造を採用する。
// - buzz_* テンプレ使用時: バズマーカー（【保存版】【速報】等）+ 保存CTAを許可
// - その他テンプレ: 従来の実務家トーンを維持
export const TONE_GUIDELINES = {
  // 推奨表現
  good_expressions: [
    'ぶっちゃけ',
    '控えめに言って',
    '正直すごいなと',
    '〜なと。',
    'まあまあ〜w',
    '結構使いやすい',
    'これは便利そう',
    '設計判断として',
    'ここが意外だった',
    '要点はこう',
    '結論から言うと',
    '実際に効いたのは',
  ],

  // バズマーカー（buzz_* テンプレ / 日本語バズ型フックで使ってよい）
  // 構造的フックとして許可。連発・乱用はしない（1投稿1ヘッダまで）。
  buzz_markers: [
    '【保存版】',
    '【完全版】',
    '【速報】',
    '【朗報】',
    '遂に',
    'なんと',
    '待って。',
    '保存して後で使ってください',
    '保存推奨',
    '〇〇終了のお知らせ',
    '今日のAI業界',
  ],

  // 避ける表現（真のAI臭・テンプレ感のあるものだけ。バズ語は禁止しない）
  avoid_expressions: [
    'この技術がもたらす',
    '〜に革命をもたらす',
    '〜という観点から',
    'いかがでしたでしょうか',
    '〜についてご紹介しました',
    '詳細は👉',
    // 安易な疑問形の締め(AI丸出し・使い回しに見える)は禁止
    '同じ経験した人いる？',
    'みんなどうしてる？',
    '〜な人いる？',
    'どう思う？',
    '共感する人いる？',
  ],

  // 基本方針
  principles: [
    '実務家の思考共有がベース。ただしバズ型テンプレ使用時は構造的フックを優先する',
    'バズマーカー（【保存版】【速報】等）は構造として使ってよいが、中身のない煽りは禁止。必ず具体（数値/ツール名/手順）で裏付ける',
    'アルゴリズム重み: bookmark=5 / RT=6 / reply=75-150 / like=0.5。保存・RT・リプを誘発する構造を優先',
    '保存版/リスト型は番号付き①②③で。保存CTA（保存して後で使ってください👇）で締めてよい',
    '締め方は断定重視 — 明確な主張・判断で終わらせろ。問いかけは3回に1回まで',
    '語尾NG: 「〜なんだよね」「〜だよね」「〜よね」は使うな。言い切れ',
    'ハッシュタグ0-2個（バズ型は #AI #生成AI を末尾に置いてよい）',
    '絵文字: 通常1-3個（🤖 💡 🔥 ⚡ 🎯）。バズ型は①②③🔴🟡🟢👇🙏も可'
  ]
};

// タグ生成用カテゴリ（最小化）
export const TAG_CATEGORIES = {
  primary: ['#AI', '#LLM', '#RAG'],
  secondary: [],
  trending: [],
  company: []
};
