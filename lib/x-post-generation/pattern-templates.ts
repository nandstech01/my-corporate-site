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
  }
];

// 口調統一ガイドライン
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
    '同じ経験した人いる？',
    'ここが意外だった',
  ],

  // 避ける表現
  avoid_expressions: [
    'この技術がもたらす',
    '〜に革命をもたらす',
    '〜という観点から',
    'いかがでしたでしょうか',
    '〜についてご紹介しました',
    '〜を発表',
    '〜がリリース',
    '詳細は👉',
    '知らないと損',
    '致命的',
    '今すぐ確認',
  ],

  // 基本方針
  principles: [
    '実務家の思考共有',
    '教えるのではなく同じ立場から語る',
    'ときどき問いかけで終わる（必須ではない）',
    'ハッシュタグ1-3個（トレンド参加時は最大4個）',
    '絵文字1-3個（🤖 💡 🔥 ⚡ 🎯）'
  ]
};

// タグ生成用カテゴリ（最小化）
export const TAG_CATEGORIES = {
  primary: ['#AI', '#LLM', '#RAG'],
  secondary: [],
  trending: [],
  company: []
};
