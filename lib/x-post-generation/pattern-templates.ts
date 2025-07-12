/**
 * X投稿生成テンプレート（引用機能強化版）
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
    id: 'breaking_insight',
    name: '🔥 速報インサイト',
    description: 'X引用を含む最新ニュースの独自分析',
    template: `🔥速報インサイト：{industry}で重要な動きが発生！

📊 注目すべき事実：
{important_fact}

💡 これが業界に与える影響：
{analysis}

🎯 実務への応用ポイント：
・{practical_point_1}
・{practical_point_2}

引用元：{url}

#AI動向 #最新情報 {hashtags}`,
    category: 'news',
    dataSources: ['trend', 'company', 'x_post'],
    features: ['引用優先', '分析強化', '実用性重視'],
    generateDiagram: false
  },
  {
    id: 'data_analysis',
    name: '📈 データ分析投稿',
    description: 'URL引用付きデータ分析とトレンド解説',
    template: `📈 驚きの数字が判明！

🔸 {shocking_number}

🎯 注目ポイント：
• {insight_1}
• {insight_2}  
• {insight_3}

引用元：{url}

#データ分析 #トレンド {hashtags}`,
    category: 'analysis',
    dataSources: ['trend', 'company'],
    features: ['URL引用', '詳細分析'],
    generateDiagram: false
  },
  {
    id: 'tech_explanation',
    name: '⚡ 技術解説',
    description: '技術的内容の分かりやすい解説',
    template: `⚡ {tech_theme}を理解する

押さえておきたいポイント：
✓ {point_1}
✓ {point_2}
✓ {point_3}

詳しい解説 👉 {url}

{hashtags}`,
    category: 'technical',
    dataSources: ['youtube', 'company'],
    features: ['技術解説', 'わかりやすさ'],
    generateDiagram: true
  },
  {
    id: 'company_comparison',
    name: '🏢 企業比較',
    description: '競合他社との比較分析',
    template: `🏢 {industry}の動向比較

各社のアプローチの違い：
{company_a}: {feature_a}
{company_b}: {feature_b}
{company_c}: {feature_c}

比較詳細 👉 {url}

{hashtags}`,
    category: 'analysis',
    dataSources: ['trend', 'company'],
    features: ['比較分析', '業界動向'],
    generateDiagram: true
  },
  {
    id: 'use_case',
    name: '💡 活用事例',
    description: '実際の活用事例の紹介',
    template: `💡 {technology}の実際の活用シーン

実用例から見えてくるもの：
📌 {use_case_1}
📌 {use_case_2}
📌 {use_case_3}

事例詳細 👉 {url}

{hashtags}`,
    category: 'practical',
    dataSources: ['youtube', 'company'],
    features: ['実例紹介', '実用性'],
    generateDiagram: false
  },
  {
    id: 'trend_forecast',
    name: '🔮 トレンド予測',
    description: '将来展望の分析・予測',
    template: `🔮 {tech_field}の向かう先

現在の兆候から読み取れること：
→ {prediction_1}
→ {prediction_2}
→ {prediction_3}

根拠となるデータ 👉 {url}

{hashtags}`,
    category: 'forecast',
    dataSources: ['trend', 'youtube', 'company'],
    features: ['将来予測', 'データ根拠'],
    generateDiagram: false
  },
  {
    id: 'question_answer',
    name: '🔍 疑問解決',
    description: 'Q&A形式での疑問解決',
    template: `🔍 よくある疑問

Q: {question}
A: {answer}

理由：{reasoning}

より詳しく 👉 {url}

{hashtags}`,
    category: 'qa',
    dataSources: ['company', 'youtube'],
    features: ['Q&A形式', '疑問解決'],
    generateDiagram: false
  },
  {
    id: 'learning_guide',
    name: '🎓 学習ガイド',
    description: '学習プロセスのガイド',
    template: `🎓 {technology}を学ぶなら

ステップバイステップで：
1. {step_1}
2. {step_2}
3. {step_3}

学習リソース 👉 {url}

{hashtags}`,
    category: 'education',
    dataSources: ['youtube', 'company'],
    features: ['学習支援', 'ステップ解説'],
    generateDiagram: false
  }
];

// 口調統一ガイドライン
export const TONE_GUIDELINES = {
  // 推奨表現
  good_expressions: [
    '注目すべき動きが',
    'これが持つ意味',
    '実態を見ると',
    '押さえておきたいポイント',
    '見えてくるもの',
    'よくある疑問',
    '実用例から分かること',
    '現在の兆候から読み取れること'
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
    '驚愕の'
  ],
  
  // 基本方針
  principles: [
    '控えめながら印象的',
    '専門性を感じさせる',
    '親しみやすい距離感',
    '全パターンで統一感'
  ]
};

// タグ生成用カテゴリ
export const TAG_CATEGORIES = {
  primary: [
    '#AI動向',
    '#技術解説',
    '#データ分析',
    '#トレンド分析',
    '#企業比較',
    '#活用事例',
    '#学習ガイド',
    '#疑問解決'
  ],
  secondary: [
    '#実用性',
    '#理解促進',
    '#実態解明',
    '#未来予測',
    '#業界分析',
    '#スキルアップ'
  ],
  trending: [
    '#AI2025',
    '#テクノロジー',
    '#イノベーション',
    '#DX',
    '#最新技術'
  ],
  company: [
    '#エヌアンドエス',
    '#nands_tech'
  ]
}; 