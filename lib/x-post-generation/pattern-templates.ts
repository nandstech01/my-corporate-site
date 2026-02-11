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
    dataSources: ['trend', 'company', 'x_post'],
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
    dataSources: ['trend', 'company'],
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
    dataSources: ['trend', 'company', 'x_post'],
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
  }
];

// 口調統一ガイドライン
export const TONE_GUIDELINES = {
  // 推奨表現
  good_expressions: [
    '結構使いやすい',
    '面白い事例',
    'これは便利そう',
    '応用できそう',
    '設計判断として',
    '皆さんのチームでは？',
    '同じ経験した人いる？',
    'ここが意外だった',
    'トレードオフとして'
  ],

  // 避ける表現
  avoid_expressions: [
    'すごい！',
    'ヤバい',
    '絶対に',
    '100%確実',
    '革命的',
    '世界が変わる',
    '信じられない',
    '驚愕の',
    '〜を発表',
    '〜がリリース',
    '詳細は👉',
    '知らないと損',
    '致命的',
    '今すぐ確認'
  ],

  // 基本方針
  principles: [
    '実務家の思考共有',
    '教えるのではなく同じ立場から語る',
    '断定より問いかけ',
    'ハッシュタグ0-1個'
  ]
};

// タグ生成用カテゴリ（最小化）
export const TAG_CATEGORIES = {
  primary: ['#AI', '#LLM', '#RAG'],
  secondary: [],
  trending: [],
  company: []
};
