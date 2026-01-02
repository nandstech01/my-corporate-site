'use client';

import { useState } from 'react';
import {
  SparklesIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// ============================================
// 自動生成用のキーワードバリエーション
// ============================================

const KEYWORD_PATTERNS = {
  // スクレイピングクエリ1のサフィックス（おすすめ系）
  scrape1Suffix: [
    'おすすめ', '比較', 'ランキング', '人気', '選び方',
    'メリット デメリット', '導入事例', '活用方法', '始め方', '入門'
  ],
  // スクレイピングクエリ2の関連キーワード
  scrape2Keywords: [
    'ホームページ制作', 'LP制作', 'Webマーケティング', 'SNS運用',
    'SEO対策', 'コンテンツマーケティング', 'DX推進', 'システム開発',
    '業務効率化', 'AI活用', '自動化ツール', 'クラウドサービス',
    'データ分析', 'CRM導入', 'MA導入', 'チャットボット'
  ],
  // ディープリサーチクエリ1のサフィックス
  research1Suffix: [
    '最新動向 2025', 'トレンド 2025', '市場動向', '業界分析',
    '成功事例', '失敗事例', '導入効果', 'ROI', '費用対効果'
  ],
  // ディープリサーチクエリ2のパターン
  research2Patterns: [
    '海外 活用事例', 'アメリカ 最新', 'グローバル トレンド',
    '大企業 導入事例', '中小企業 活用', 'スタートアップ 事例',
    '業界別 比較', '専門家 見解', 'Google 公式情報', 'OpenAI 最新'
  ],
  // 地域キーワード（重み付け：滋賀は必ず含む）
  regions: {
    required: ['滋賀県 大津'],
    optional: [
      '東京 関東圏', '大阪 関西圏', '名古屋 中部圏',
      '福岡 九州', '札幌 北海道', '仙台 東北',
      '横浜 神奈川', '京都', '神戸 兵庫'
    ]
  }
};

// ランダム選択ヘルパー
const randomPick = <T,>(arr: T[], count: number = 1): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const randomOne = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface GenerationResult {
  success: boolean;
  postId?: number;
  title?: string;
  slug?: string;
  wordCount?: number;
  error?: string;
}

// ============================================
// DBカテゴリ（実際のcategoriesテーブルから）
// ============================================
const CATEGORY_OPTIONS = [
  // スキル系
  { value: 'seo-writing', label: 'SEOライティング' },
  { value: 'image-video-generation', label: '画像・動画生成' },
  { value: 'data-analysis', label: 'データ分析' },
  { value: 'business-admin', label: 'ビジネス事務' },
  { value: 'programming', label: 'プログラミング' },
  { value: 'ai-consultant', label: '生成AIコンサルタント' },
  { value: 'ai-translation', label: 'AI翻訳・字幕作成' },
  { value: 'ai-short-video', label: 'AIショート動画/UGCマーケ支援' },
  { value: 'nocode-ai', label: 'No-code × AIアプリ構築' },
  { value: 'ai-voice', label: 'AI音声合成/ナレーション' },
  // 業種別リスキリング
  { value: 'finance', label: '金融業界向けリスキリング' },
  { value: 'manufacturing', label: '製造業界向けリスキリング' },
  { value: 'logistics', label: '物流・運輸業界向けリスキリング' },
  { value: 'retail', label: '小売・EC業界向けリスキリング' },
  { value: 'medical-care', label: '医療・介護業界向けリスキリング' },
  { value: 'construction', label: '建設・不動産業界向けリスキリング' },
  { value: 'it-software', label: 'IT・ソフトウェア業界向けリスキリング' },
  { value: 'hr-service', label: '人材サービス業界向けリスキリング' },
  { value: 'marketing', label: '広告・マーケティング業界向けリスキリング' },
  { value: 'government', label: '自治体・公共機関向けリスキリング' },
  // 学習系
  { value: 'ai-basics', label: 'AI基礎知識' },
  { value: 'python-intro', label: 'Python入門' },
  { value: 'chatgpt-usage', label: 'ChatGPT活用' },
  { value: 'ai-tools', label: 'AIツール紹介' },
  { value: 'ai-sidejob-skills', label: '副業向けAIスキル' },
  { value: 'career-change', label: '転職・キャリア' },
  { value: 'practical-projects', label: '実践プロジェクト' },
  { value: 'certifications', label: '資格・認定' },
  { value: 'ai-news', label: 'AIニュース・トレンド' }
];

const REGION_OPTIONS = [
  { value: '滋賀県 大津', label: '滋賀県 大津（地元）' },
  { value: '東京 関東圏', label: '東京・関東圏' },
  { value: '大阪 関西圏', label: '大阪・関西圏' },
  { value: '名古屋 中部圏', label: '名古屋・中部圏' },
  { value: '福岡 九州', label: '福岡・九州' },
  { value: '札幌 北海道', label: '札幌・北海道' }
];

// ============================================
// トピック候補（ジャンル別 + DBカテゴリ紐づけ）
// ============================================
interface TopicItem {
  name: string;
  category: string; // DBカテゴリに対応
}

const TOPIC_SUGGESTIONS: { [key: string]: TopicItem[] } = {
  'AI・テクノロジー': [
    { name: 'AIリスキリング', category: 'ai-basics' },
    { name: 'ChatGPT', category: 'chatgpt-usage' },
    { name: 'Claude', category: 'ai-tools' },
    { name: 'Gemini', category: 'ai-tools' },
    { name: '生成AI', category: 'ai-consultant' },
    { name: 'RAG', category: 'programming' },
    { name: 'ベクトルDB', category: 'programming' },
    { name: 'LLM', category: 'ai-basics' },
    { name: 'AIエージェント', category: 'ai-consultant' },
    { name: 'MCP', category: 'programming' },
    { name: 'プロンプトエンジニアリング', category: 'chatgpt-usage' },
    { name: 'AI画像生成', category: 'image-video-generation' },
    { name: 'AI動画生成', category: 'image-video-generation' },
    { name: 'Sora', category: 'image-video-generation' },
    { name: 'Veo', category: 'image-video-generation' },
    { name: 'Midjourney', category: 'image-video-generation' },
    { name: 'AI自動化', category: 'nocode-ai' },
    { name: 'RPA', category: 'nocode-ai' },
    { name: 'AIチャットボット', category: 'ai-consultant' },
    { name: 'AI音声合成', category: 'ai-voice' },
    { name: 'ナノバナナプロ', category: 'image-video-generation' },
    { name: 'GPT-5', category: 'ai-tools' },
    { name: 'DeepSeek', category: 'ai-tools' },
    { name: 'Perplexity', category: 'ai-tools' }
  ],
  'マーケティング・SEO': [
    { name: 'SEO対策', category: 'seo-writing' },
    { name: 'AIO対策', category: 'seo-writing' },
    { name: 'コンテンツマーケティング', category: 'seo-writing' },
    { name: 'MEO対策', category: 'marketing' },
    { name: 'Googleアルゴリズム', category: 'seo-writing' },
    { name: 'E-E-A-T', category: 'seo-writing' },
    { name: 'キーワード戦略', category: 'seo-writing' },
    { name: 'リスティング広告', category: 'marketing' },
    { name: 'SNS広告', category: 'marketing' },
    { name: 'Meta広告', category: 'marketing' },
    { name: 'Google広告', category: 'marketing' },
    { name: 'マーケティングオートメーション', category: 'marketing' },
    { name: 'CRM', category: 'business-admin' },
    { name: 'GA4', category: 'data-analysis' },
    { name: 'Googleサーチコンソール', category: 'seo-writing' },
    { name: 'LP最適化', category: 'seo-writing' },
    { name: 'ABテスト', category: 'data-analysis' },
    { name: 'オウンドメディア', category: 'seo-writing' }
  ],
  'Web制作・開発': [
    { name: 'ホームページ制作', category: 'programming' },
    { name: 'LP制作', category: 'programming' },
    { name: 'ECサイト構築', category: 'programming' },
    { name: 'WordPress', category: 'programming' },
    { name: 'Webデザイン', category: 'programming' },
    { name: 'UI/UX', category: 'programming' },
    { name: 'Next.js', category: 'programming' },
    { name: 'React', category: 'programming' },
    { name: 'TypeScript', category: 'programming' },
    { name: 'Webアプリ開発', category: 'programming' },
    { name: 'SaaS開発', category: 'programming' },
    { name: 'API開発', category: 'programming' },
    { name: 'AWS', category: 'it-software' },
    { name: 'GCP', category: 'it-software' },
    { name: 'Vercel', category: 'programming' },
    { name: 'Supabase', category: 'programming' },
    { name: 'データベース設計', category: 'programming' },
    { name: 'No-code開発', category: 'nocode-ai' }
  ],
  'SNS・動画': [
    { name: 'SNS運用', category: 'ai-short-video' },
    { name: 'Instagram運用', category: 'ai-short-video' },
    { name: 'X運用', category: 'ai-short-video' },
    { name: 'TikTok運用', category: 'ai-short-video' },
    { name: 'YouTube運用', category: 'ai-short-video' },
    { name: 'LINE公式アカウント', category: 'marketing' },
    { name: 'LinkedIn活用', category: 'marketing' },
    { name: 'SNS自動化', category: 'ai-short-video' },
    { name: 'SNS分析', category: 'data-analysis' },
    { name: '動画マーケティング', category: 'image-video-generation' },
    { name: 'ショート動画', category: 'ai-short-video' },
    { name: '動画編集', category: 'image-video-generation' },
    { name: '動画制作', category: 'image-video-generation' },
    { name: 'UGCマーケティング', category: 'ai-short-video' }
  ],
  'ビジネス・経営': [
    { name: 'DX推進', category: 'business-admin' },
    { name: 'デジタル化', category: 'business-admin' },
    { name: '業務効率化', category: 'business-admin' },
    { name: '経営戦略', category: 'business-admin' },
    { name: '事業計画', category: 'business-admin' },
    { name: '資金調達', category: 'finance' },
    { name: '補助金申請', category: 'business-admin' },
    { name: 'IT導入補助金', category: 'business-admin' },
    { name: '人材育成', category: 'hr-service' },
    { name: '組織開発', category: 'hr-service' },
    { name: 'リモートワーク', category: 'business-admin' },
    { name: 'Notion', category: 'ai-tools' },
    { name: 'Slack活用', category: 'ai-tools' },
    { name: '中小企業DX', category: 'business-admin' },
    { name: 'スタートアップ', category: 'business-admin' },
    { name: '起業', category: 'ai-sidejob-skills' },
    { name: 'フリーランス', category: 'ai-sidejob-skills' }
  ],
  '転職・キャリア': [
    { name: '転職', category: 'career-change' },
    { name: '転職エージェント', category: 'career-change' },
    { name: 'リクルートエージェント', category: 'career-change' },
    { name: 'doda', category: 'career-change' },
    { name: 'マイナビエージェント', category: 'career-change' },
    { name: 'ビズリーチ', category: 'career-change' },
    { name: 'JACリクルートメント', category: 'career-change' },
    { name: 'エンジニア転職', category: 'career-change' },
    { name: 'IT転職', category: 'career-change' },
    { name: '未経験転職', category: 'career-change' },
    { name: '30代転職', category: 'career-change' },
    { name: '40代転職', category: 'career-change' },
    { name: '第二新卒', category: 'career-change' },
    { name: 'ハイクラス転職', category: 'career-change' },
    { name: '外資系転職', category: 'career-change' },
    { name: 'Web業界転職', category: 'career-change' },
    { name: 'マーケター転職', category: 'career-change' },
    { name: 'デザイナー転職', category: 'career-change' },
    { name: '営業転職', category: 'career-change' },
    { name: '事務転職', category: 'career-change' },
    { name: '年収アップ転職', category: 'career-change' },
    { name: '転職面接', category: 'career-change' },
    { name: '職務経歴書', category: 'career-change' },
    { name: '転職サイト比較', category: 'career-change' }
  ],
  'リスキリング・学習': [
    { name: 'AIリスキリング', category: 'ai-basics' },
    { name: 'キャリアアップ', category: 'career-change' },
    { name: 'リスキリング', category: 'ai-basics' },
    { name: 'スキルアップ', category: 'ai-basics' },
    { name: '副業', category: 'ai-sidejob-skills' },
    { name: 'プログラミング学習', category: 'python-intro' },
    { name: 'AI学習', category: 'ai-basics' },
    { name: '資格取得', category: 'certifications' },
    { name: 'オンライン学習', category: 'ai-basics' },
    { name: 'eラーニング', category: 'ai-basics' },
    { name: 'プログラミングスクール', category: 'python-intro' },
    { name: 'Webデザインスクール', category: 'programming' },
    { name: 'AI研修', category: 'ai-basics' },
    { name: 'DX研修', category: 'ai-basics' },
    { name: 'Python入門', category: 'python-intro' },
    { name: 'データサイエンス', category: 'data-analysis' }
  ],
  '採用・HR': [
    { name: '採用戦略', category: 'hr-service' },
    { name: '人材採用', category: 'hr-service' },
    { name: '採用マーケティング', category: 'hr-service' },
    { name: 'Wantedly', category: 'hr-service' },
    { name: '採用ブランディング', category: 'hr-service' },
    { name: 'ダイレクトリクルーティング', category: 'hr-service' },
    { name: 'リファラル採用', category: 'hr-service' },
    { name: '新卒採用', category: 'hr-service' },
    { name: '中途採用', category: 'hr-service' },
    { name: 'エンジニア採用', category: 'hr-service' },
    { name: '採用管理システム', category: 'hr-service' },
    { name: 'ATS', category: 'hr-service' },
    { name: '人事評価', category: 'hr-service' },
    { name: 'タレントマネジメント', category: 'hr-service' },
    { name: '離職防止', category: 'hr-service' },
    { name: 'オンボーディング', category: 'hr-service' }
  ],
  '業種別リスキリング': [
    { name: '金融業界DX', category: 'finance' },
    { name: '製造業DX', category: 'manufacturing' },
    { name: '物流業界DX', category: 'logistics' },
    { name: '小売・EC業界DX', category: 'retail' },
    { name: '医療業界DX', category: 'medical-care' },
    { name: '介護業界DX', category: 'medical-care' },
    { name: '建設業界DX', category: 'construction' },
    { name: '不動産テック', category: 'construction' },
    { name: 'IT業界トレンド', category: 'it-software' },
    { name: '人材業界DX', category: 'hr-service' },
    { name: '広告業界DX', category: 'marketing' },
    { name: '自治体DX', category: 'government' }
  ],
  '地域・ローカル': [
    { name: '滋賀県ホームページ制作', category: 'programming' },
    { name: '大津市Web制作', category: 'programming' },
    { name: '京都Web制作', category: 'programming' },
    { name: '関西圏システム開発', category: 'programming' },
    { name: '東京Web制作', category: 'programming' },
    { name: '名古屋ホームページ', category: 'programming' },
    { name: '福岡Web制作', category: 'programming' },
    { name: '札幌ホームページ制作', category: 'programming' },
    { name: '地方創生DX', category: 'government' },
    { name: 'ローカルSEO', category: 'seo-writing' },
    { name: '地域密着マーケティング', category: 'marketing' }
  ]
};

export default function HybridArticleGenerator() {
  // フォーム状態
  const [topic, setTopic] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [categorySlug, setCategorySlug] = useState('programming');
  const [businessCategory, setBusinessCategory] = useState('programming');
  
  // スクレイピングクエリ
  const [scrapeQuery1, setScrapeQuery1] = useState('');
  const [scrapeQuery2, setScrapeQuery2] = useState('');
  
  // ディープリサーチクエリ
  const [researchQuery1, setResearchQuery1] = useState('');
  const [researchQuery2, setResearchQuery2] = useState('');
  
  // 地域キーワード
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['滋賀県 大津']);
  
  // オプション
  const [targetLength, setTargetLength] = useState(40000); // 40,000文字目標
  const [enableH2Diagrams, setEnableH2Diagrams] = useState(false); // デフォルトOFF（料金節約）
  const [includePersonalRag, setIncludePersonalRag] = useState(true);
  const [runScraping, setRunScraping] = useState(true);
  const [runDeepResearch, setRunDeepResearch] = useState(true);
  
  // 🔄 モデル選択（コスト節約用）
  // deepseek = DeepSeek V3.2（ディープリサーチ専用）
  // gpt-5.2 = GPT-5.2（記事生成専用・高品質）
  const [researchModel, setResearchModel] = useState<'deepseek' | 'gpt-5.2'>('deepseek');
  const [generationModel, setGenerationModel] = useState<'deepseek' | 'gpt-5.2'>('gpt-5.2');
  
  // 🔬 ディープリサーチタイプ
  // trend = トレンド調査、comparison = 比較調査、technical = 技術調査、market = 市場調査
  const [researchType1, setResearchType1] = useState<'trend' | 'comparison' | 'technical' | 'market'>('trend');
  const [researchType2, setResearchType2] = useState<'trend' | 'comparison' | 'technical' | 'market'>('comparison');
  
  // 状態管理
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  // トピック候補の開閉状態
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // トピック変更時（手動入力用）
  const handleTopicChange = (value: string) => {
    setTopic(value);
  };

  // 🎲 自動入力ボタン - ランダムでマンネリ防止
  const handleAutoFill = () => {
    if (!topic.trim()) {
      alert('まずメイントピックを入力してください');
      return;
    }

    const t = topic.trim();

    // ターゲットキーワード（ランダムサフィックス）
    const suffix1 = randomOne(KEYWORD_PATTERNS.scrape1Suffix);
    setTargetKeyword(`${t} ${suffix1}`);

    // スクレイピングクエリ1（おすすめ系、ランダム）
    const scrapeSuffix1 = randomOne(KEYWORD_PATTERNS.scrape1Suffix);
    setScrapeQuery1(`${t} ${scrapeSuffix1}`);

    // スクレイピングクエリ2（関連キーワード、完全ランダム）
    const scrapeKeyword2 = randomOne(KEYWORD_PATTERNS.scrape2Keywords);
    setScrapeQuery2(scrapeKeyword2);

    // ディープリサーチクエリ1（トピック + サフィックス）
    const researchSuffix1 = randomOne(KEYWORD_PATTERNS.research1Suffix);
    setResearchQuery1(`${t} ${researchSuffix1}`);

    // ディープリサーチクエリ2（完全ランダム）
    const researchPattern2 = randomOne(KEYWORD_PATTERNS.research2Patterns);
    setResearchQuery2(`${t} ${researchPattern2}`);

    // 地域キーワード（滋賀必須 + ランダム1-2個）
    const optionalRegions = randomPick(KEYWORD_PATTERNS.regions.optional, Math.floor(Math.random() * 2) + 1);
    setSelectedRegions([...KEYWORD_PATTERNS.regions.required, ...optionalRegions]);

    // カテゴリ自動推定
    const lowerTopic = t.toLowerCase();
    if (lowerTopic.includes('ai') || lowerTopic.includes('人工知能')) {
      setCategorySlug('ai-agents');
      setBusinessCategory('ai-agents');
    } else if (lowerTopic.includes('seo') || lowerTopic.includes('aio')) {
      setCategorySlug('aio-seo');
      setBusinessCategory('aio-seo');
    } else if (lowerTopic.includes('リスキリング') || lowerTopic.includes('キャリア')) {
      setCategorySlug('reskilling');
      setBusinessCategory('reskilling');
    } else if (lowerTopic.includes('システム') || lowerTopic.includes('開発')) {
      setCategorySlug('system-development');
      setBusinessCategory('system-development');
    } else if (lowerTopic.includes('sns') || lowerTopic.includes('ソーシャル')) {
      setCategorySlug('sns-automation');
      setBusinessCategory('sns-automation');
    }

    console.log('🎲 自動入力完了（ランダム生成）');
  };

  // 地域選択
  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // 記事生成
  const handleGenerate = async () => {
    if (!topic || !targetKeyword) {
      alert('トピックとターゲットキーワードを入力してください');
      return;
    }

    setIsGenerating(true);
    setGenerationResult(null);
    setProgress(0);

    try {
      // プログレス表示
      setCurrentStep('🔍 スクレイピング実行中...');
      setProgress(10);

      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('🔬 ディープリサーチ実行中...');
      setProgress(30);

      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('📚 RAGデータ取得中...');
      setProgress(50);

      await new Promise(resolve => setTimeout(resolve, 500));
      const modelLabel = generationModel === 'deepseek' ? 'DeepSeek V3.2' : 'GPT-5.2';
      setCurrentStep(`🤖 ${modelLabel}で記事生成中...`);
      setProgress(70);

      // API呼び出し
      const response = await fetch('/api/generate-hybrid-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          targetKeyword,
          categorySlug,
          businessCategory,
          scrapeQuery1,
          scrapeQuery2,
          researchQuery1,
          researchQuery2,
          targetLength,
          enableH2Diagrams,
          maxH2Diagrams: 5,
          includePersonalRag,
          runScraping,
          runDeepResearch,
          regionKeywords: selectedRegions,
          // 🔄 モデル選択
          researchModel,      // 'deepseek' or 'gemini'
          generationModel,    // 'deepseek' or 'gemini'
          // 🔬 リサーチタイプ
          researchType1,      // 'trend' | 'comparison' | 'technical' | 'market'
          researchType2       // 'trend' | 'comparison' | 'technical' | 'market'
        })
      });

      setCurrentStep('🔧 後処理実行中...');
      setProgress(90);

      const result = await response.json();

      if (result.success) {
        setGenerationResult({
          success: true,
          postId: result.postId,
          title: result.title,
          slug: result.slug,
          wordCount: result.wordCount
        });
        setProgress(100);
        setCurrentStep('✅ 完了！');
      } else {
        setGenerationResult({
          success: false,
          error: result.error || result.details
        });
        setCurrentStep('❌ エラー発生');
      }
    } catch (error) {
      console.error('生成エラー:', error);
      setGenerationResult({
        success: false,
        error: (error as Error).message
      });
      setCurrentStep('❌ エラー発生');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">ハイブリッド記事生成</h2>
          <p className="text-gray-400 text-sm">スクレイピング + ディープリサーチ + RAG統合</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左カラム: 基本設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-purple-400" />
            基本設定
          </h3>

          {/* トピック + 自動入力ボタン */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              メイントピック <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                placeholder="例: AIリスキリング"
                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAutoFill}
                disabled={!topic.trim()}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  topic.trim()
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                title="トピックから自動入力（ランダム）"
              >
                <BoltIcon className="w-5 h-5" />
                自動入力
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 トピックを入力して「自動入力」を押すと、他のフィールドがランダムで自動生成されます
            </p>

            {/* 🎯 トピック候補セクション */}
            <div className="mt-3">
              <button
                onClick={() => setShowTopicSuggestions(!showTopicSuggestions)}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                {showTopicSuggestions ? '▼' : '▶'} トピック候補から選ぶ
              </button>

              {showTopicSuggestions && (
                <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700 max-h-80 overflow-y-auto">
                  {Object.entries(TOPIC_SUGGESTIONS).map(([category, topics]) => (
                    <div key={category} className="mb-2">
                      <button
                        onClick={() => setExpandedCategories(prev =>
                          prev.includes(category)
                            ? prev.filter(c => c !== category)
                            : [...prev, category]
                        )}
                        className="w-full text-left text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 py-1"
                      >
                        {expandedCategories.includes(category) ? '▼' : '▶'}
                        <span className="px-2 py-0.5 bg-gray-700 rounded">{category}</span>
                        <span className="text-gray-500">({(topics as TopicItem[]).length})</span>
                      </button>
                      
                      {expandedCategories.includes(category) && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-4">
                          {topics.map(t => (
                            <button
                              key={t.name}
                              onClick={() => {
                                setTopic(t.name);
                                setCategorySlug(t.category);      // DBカテゴリ自動設定
                                setBusinessCategory(t.category);  // ビジネスカテゴリも同期
                                setShowTopicSuggestions(false);
                              }}
                              className={`px-2 py-1 text-xs rounded transition-all ${
                                topic === t.name
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                              }`}
                              title={`カテゴリ: ${CATEGORY_OPTIONS.find(c => c.value === t.category)?.label || t.category}`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ターゲットキーワード */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              ターゲットキーワード <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="例: AIリスキリング おすすめ"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              カテゴリ
            </label>
            <select
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setBusinessCategory(e.target.value);
              }}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 目標文字数 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              目標文字数: {targetLength.toLocaleString()}文字
            </label>
            <input
              type="range"
              min={10000}
              max={50000}
              step={5000}
              value={targetLength}
              onChange={(e) => setTargetLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10,000</span>
              <span>30,000</span>
              <span>50,000</span>
            </div>
          </div>
        </div>

        {/* 右カラム: クエリ設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-blue-400" />
            スクレイピングクエリ
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">クエリ1（おすすめ系）</label>
              <input
                type="text"
                value={scrapeQuery1}
                onChange={(e) => setScrapeQuery1(e.target.value)}
                placeholder="AIリスキリング おすすめ"
                className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">クエリ2（関連キーワード）</label>
              <input
                type="text"
                value={scrapeQuery2}
                onChange={(e) => setScrapeQuery2(e.target.value)}
                placeholder="ホームページ制作"
                className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-4">
            <BeakerIcon className="w-5 h-5 text-green-400" />
            ディープリサーチクエリ
            <span className="text-xs font-normal text-gray-500">（内部で詳細プロンプトに自動展開）</span>
          </h3>

          <div className="space-y-3">
            {/* リサーチ1 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">リサーチ1 トピック</label>
                <input
                  type="text"
                  value={researchQuery1}
                  onChange={(e) => setResearchQuery1(e.target.value)}
                  placeholder="AIO"
                  className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">タイプ</label>
                <select
                  value={researchType1}
                  onChange={(e) => setResearchType1(e.target.value as any)}
                  className="w-full px-2 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option value="trend">📈 トレンド</option>
                  <option value="comparison">⚖️ 比較</option>
                  <option value="technical">🔧 技術</option>
                  <option value="market">📊 市場</option>
                </select>
              </div>
            </div>

            {/* リサーチ2 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">リサーチ2 トピック</label>
                <input
                  type="text"
                  value={researchQuery2}
                  onChange={(e) => setResearchQuery2(e.target.value)}
                  placeholder="海外 AI活用"
                  className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">タイプ</label>
                <select
                  value={researchType2}
                  onChange={(e) => setResearchType2(e.target.value as any)}
                  className="w-full px-2 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option value="trend">📈 トレンド</option>
                  <option value="comparison">⚖️ 比較</option>
                  <option value="technical">🔧 技術</option>
                  <option value="market">📊 市場</option>
                </select>
              </div>
            </div>

            {/* プロンプト展開プレビュー */}
            <div className="text-xs text-gray-500 bg-gray-800/30 p-2 rounded">
              💡 入力トピックは以下の詳細プロンプトに自動展開されます：
              <ul className="mt-1 ml-4 list-disc">
                <li>📈 トレンド: 最新動向、業界トレンド、国内外比較</li>
                <li>⚖️ 比較: サービス比較、料金、機能、選び方</li>
                <li>🔧 技術: 技術詳細、実装方法、ベストプラクティス</li>
                <li>📊 市場: 市場規模、シェア、導入事例、将来予測</li>
              </ul>
            </div>
          </div>

          {/* 地域キーワード */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-4">
            <GlobeAltIcon className="w-5 h-5 text-orange-400" />
            地域キーワード（ロングテール）
          </h3>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map(region => (
              <button
                key={region.value}
                onClick={() => toggleRegion(region.value)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedRegions.includes(region.value)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* オプション */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-3">生成オプション</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={runScraping}
              onChange={(e) => setRunScraping(e.target.checked)}
              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            スクレイピング実行
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={runDeepResearch}
              onChange={(e) => setRunDeepResearch(e.target.checked)}
              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            ディープリサーチ実行
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={includePersonalRag}
              onChange={(e) => setIncludePersonalRag(e.target.checked)}
              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            パーソナルRAG（一次情報）
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={enableH2Diagrams}
              onChange={(e) => setEnableH2Diagrams(e.target.checked)}
              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            H2図解自動生成
          </label>
        </div>
      </div>

      {/* 🔄 モデル選択（コスト節約用） */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg border border-blue-500/20">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          🔄 AIモデル選択
          <span className="text-xs font-normal text-gray-400">（練習時はDeepSeekで節約）</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* リサーチモデル */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">ディープリサーチ用</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              <button
                onClick={() => setResearchModel('deepseek')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
                  researchModel === 'deepseek'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                💰 DeepSeek V3.2
                <span className="block text-xs opacity-70">低コスト</span>
              </button>
              <button
                onClick={() => setResearchModel('gpt-5.2')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
                  researchModel === 'gpt-5.2'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🚀 GPT-5.2
                <span className="block text-xs opacity-70">高品質</span>
              </button>
            </div>
          </div>

          {/* 生成モデル */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">記事生成用</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              <button
                onClick={() => setGenerationModel('deepseek')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
                  generationModel === 'deepseek'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                💰 DeepSeek V3.2
                <span className="block text-xs opacity-70">低コスト</span>
              </button>
              <button
                onClick={() => setGenerationModel('gpt-5.2')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
                  generationModel === 'gpt-5.2'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🚀 GPT-5.2
                <span className="block text-xs opacity-70">高品質</span>
              </button>
            </div>
          </div>
        </div>

        {/* モデル情報 */}
        <div className="mt-3 text-xs text-gray-500">
          {researchModel === 'deepseek' && generationModel === 'deepseek' && (
            <p>💡 全てDeepSeek: 最大コスト節約モード（練習・テスト用）</p>
          )}
          {researchModel === 'deepseek' && generationModel === 'gpt-5.2' && (
            <p>🚀 推奨設定: ディープリサーチ=DeepSeek（節約）/ 記事生成=GPT-5.2（高品質・10,000-20,000文字対応）</p>
          )}
          {researchModel !== generationModel && generationModel !== 'gpt-5.2' && (
            <p>🔀 ハイブリッド: リサーチ={researchModel === 'deepseek' ? 'DeepSeek' : 'GPT-5.2'}, 生成={generationModel === 'deepseek' ? 'DeepSeek' : 'GPT-5.2'}</p>
          )}
        </div>
      </div>

      {/* プログレスバー */}
      {isGenerating && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{currentStep}</span>
            <span className="text-sm text-purple-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {generationResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          generationResult.success
            ? 'bg-green-900/30 border border-green-500/30'
            : 'bg-red-900/30 border border-red-500/30'
        }`}>
          {generationResult.success ? (
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-400">記事生成完了！</h4>
                <p className="text-gray-300 mt-1">{generationResult.title}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <span>ID: {generationResult.postId}</span>
                  <span>文字数: {generationResult.wordCount?.toLocaleString()}</span>
                </div>
                <a
                  href={`/admin/posts/${generationResult.slug}/edit`}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  記事を編集
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-400">生成エラー</h4>
                <p className="text-gray-300 mt-1">{generationResult.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !topic || !targetKeyword}
        className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
          isGenerating || !topic || !targetKeyword
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-purple-500/30'
        }`}
      >
        {isGenerating ? (
          <>
            <ArrowPathIcon className="w-6 h-6 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <SparklesIcon className="w-6 h-6" />
            ハイブリッド記事を生成
          </>
        )}
      </button>

      {/* 説明 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 スクレイピング + ディープリサーチ + 自社RAG + パーソナルRAG を統合した高品質な記事を生成します
      </div>
    </div>
  );
}

