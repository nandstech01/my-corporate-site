import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly';
  days: string[];
  timeRange: { start: string; end: string };
  categoryRotation: string[];
  randomSelection: boolean;
  requireApproval: boolean;
  qualityThreshold: number;
}

// カテゴリ別推奨RAG設定（副業系除外）
const categoryRAGConfigs: Record<string, string[]> = {
  // 個人向けリスキリング (business_id: 2)
  'ai-basics': ['company', 'trend'],
  'python-intro': ['company', 'youtube'],
  'chatgpt-usage': ['company', 'trend'],
  'ai-tools': ['company', 'trend'],
  'ai-sidejob-skills': ['company', 'trend'],
  'career-change': ['company', 'trend'],
  'practical-projects': ['company', 'youtube'],
  'certifications': ['company', 'trend'],
  'ai-news': ['trend', 'youtube'],
  
  // 法人向けリスキリング (business_id: 3)
  'finance': ['company', 'trend'],
  'manufacturing': ['company', 'trend'],
  'logistics': ['company', 'trend'],
  'retail': ['company', 'trend'],
  'medical-care': ['company', 'trend'],
  'construction': ['company', 'trend'],
  'it-software': ['company', 'trend', 'youtube'],
  'hr-service': ['company', 'trend'],
  'marketing': ['company', 'trend'],
  'government': ['company', 'trend']
};

// カテゴリ別クエリテンプレート（副業系除外）
const categoryQueries: Record<string, string[]> = {
  // 個人向けリスキリングカテゴリ
  'ai-basics': [
    'AI基礎知識 学習',
    '人工知能 入門',
    'AI リテラシー',
    '機械学習 基礎'
  ],
  'python-intro': [
    'Python 入門 AI',
    'データ分析 Python',
    'Python プログラミング',
    'AI開発 Python'
  ],
  'chatgpt-usage': [
    'ChatGPT 活用法',
    'プロンプト エンジニアリング',
    'ChatGPT 業務効率化',
    'AI チャット 活用'
  ],
  'ai-tools': [
    'AIツール 紹介',
    'ノーコードAI',
    'AIアプリケーション',
    '生産性 AIツール'
  ],
  'ai-sidejob-skills': [
    '副業向け AIスキル',
    'AI 収益化 方法',
    'AIスキル 副業',
    'デジタル副業 AI'
  ],
  'career-change': [
    'AI転職 戦略',
    'キャリアチェンジ AI',
    'IT転職 スキル',
    'エンジニア 転職'
  ],
  'practical-projects': [
    'AI プロジェクト 実践',
    '実践的 AI開発',
    'AIアプリ 制作',
    'ポートフォリオ AI'
  ],
  'certifications': [
    'AI資格 認定',
    '機械学習 資格',
    'データサイエンス 資格',
    'AI検定 対策'
  ],
  'ai-news': [
    'AI 最新ニュース',
    '人工知能 トレンド',
    'AI業界 動向',
    'テクノロジー ニュース'
  ],
  
  // 法人向けリスキリングカテゴリ
  'finance': [
    '金融業界 AI活用',
    'フィンテック 技術',
    '金融 DX推進',
    '銀行業務 効率化'
  ],
  'manufacturing': [
    '製造業 AI導入',
    'スマートファクトリー',
    '製造DX 戦略',
    '工場自動化 AI'
  ],
  'logistics': [
    '物流 AI最適化',
    '配送効率化 技術',
    'サプライチェーン DX',
    '物流業界 イノベーション'
  ],
  'retail': [
    '小売業 AI活用',
    'EC サイト最適化',
    '顧客体験 向上',
    'リテールDX 戦略'
  ],
  'medical-care': [
    '医療業界 AI導入',
    'ヘルスケア 技術',
    '介護DX 推進',
    '医療現場 効率化'
  ],
  'construction': [
    '建設業界 DX',
    '不動産 AI活用',
    '建設現場 効率化',
    'プロップテック 技術'
  ],
  'it-software': [
    'IT業界 最新技術',
    'ソフトウェア開発',
    'エンジニア スキル',
    'システム開発 戦略'
  ],
  'hr-service': [
    '人材業界 AI活用',
    'HRテック 導入',
    '採用DX 戦略',
    '人事業務 効率化'
  ],
  'marketing': [
    'マーケティング AI',
    '広告業界 DX',
    'デジタルマーケティング',
    'マーテック 活用'
  ],
  'government': [
    '自治体 DX推進',
    '公共機関 AI導入',
    '行政サービス 効率化',
    'スマートシティ 技術'
  ]
};

// ランダム時間生成（自然な分散）
function generateRandomTime(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomTime.toTimeString().slice(0, 5);
}

// 次の指定曜日の日付を取得
function getNextWeekday(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.indexOf(dayName.toLowerCase());
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (dayIndex - currentDay + 7) % 7 || 7; // 今日が対象曜日なら次週
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  return targetDate;
}

// インテリジェントクエリ選択
function selectIntelligentQuery(category: string, usedQueries: Set<string>): string {
  const queries = categoryQueries[category] || ['AI 最新技術 動向'];
  const availableQueries = queries.filter(q => !usedQueries.has(q));
  
  if (availableQueries.length === 0) {
    // 全て使用済みの場合、ランダムに選択
    return queries[Math.floor(Math.random() * queries.length)];
  }
  
  return availableQueries[Math.floor(Math.random() * availableQueries.length)];
}

// ランダム均等カテゴリ選択
function selectRandomCategory(allCategories: string[], usedCategories: Map<string, number>): string {
  // 使用回数でカテゴリをグループ化
  const minUsage = Math.min(...Array.from(usedCategories.values()));
  const leastUsedCategories = allCategories.filter(cat => 
    (usedCategories.get(cat) || 0) === minUsage
  );
  
  // 最少使用カテゴリからランダム選択
  return leastUsedCategories[Math.floor(Math.random() * leastUsedCategories.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { config }: { config: ScheduleConfig } = await request.json();

    if (!config.enabled) {
      return NextResponse.json({
        success: false,
        error: 'スケジューラーが無効です'
      }, { status: 400 });
    }

    // 既存のスケジュール取得（重複回避）
    const { data: existingSchedules } = await supabaseServiceRole
      .from('scheduled_posts')
      .select('*')
      .gte('scheduled_for', new Date().toISOString())
      .eq('status', 'pending');

    const usedQueries = new Set<string>();
    existingSchedules?.forEach(schedule => usedQueries.add(schedule.query));

    // 次の4週間分のスケジュール生成
    const scheduledPosts = [];
    const weeksToGenerate = config.frequency === 'weekly' ? 4 : 8;
    
    // カテゴリ選択の準備
    const allCategories = Object.keys(categoryRAGConfigs);
    const categoriesToUse = config.randomSelection ? allCategories : config.categoryRotation;
    const categoryUsageMap = new Map<string, number>();
    
    // カテゴリ使用回数初期化
    categoriesToUse.forEach(cat => categoryUsageMap.set(cat, 0));
    
    let categoryIndex = 0;

    for (let week = 0; week < weeksToGenerate; week++) {
      for (const day of config.days) {
        const targetDate = getNextWeekday(day);
        targetDate.setDate(targetDate.getDate() + (week * 7));
        
        // ランダム時間設定
        const randomTime = generateRandomTime(config.timeRange.start, config.timeRange.end);
        const [hours, minutes] = randomTime.split(':');
        targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // カテゴリ選択（ランダム均等 vs 手動ローテーション）
        let category: string;
        if (config.randomSelection) {
          category = selectRandomCategory(categoriesToUse, categoryUsageMap);
          categoryUsageMap.set(category, (categoryUsageMap.get(category) || 0) + 1);
        } else {
          category = config.categoryRotation[categoryIndex % config.categoryRotation.length];
          categoryIndex++;
        }
        
        const ragConfig = categoryRAGConfigs[category] || ['company', 'trend'];
        const query = selectIntelligentQuery(category, usedQueries);
        
        usedQueries.add(query);

        const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        scheduledPosts.push({
          id: scheduleId,
          scheduled_for: targetDate.toISOString(),
          category: category,
          query: query,
          rag_config: ragConfig,
          status: config.requireApproval ? 'pending' : 'approved',
          quality_threshold: config.qualityThreshold,
          created_at: new Date().toISOString(),
          config_snapshot: config
        });
      }
    }

    // データベースに保存
    const { data: savedSchedules, error } = await supabaseServiceRole
      .from('scheduled_posts')
      .insert(scheduledPosts)
      .select();

    if (error) {
      console.error('Schedule save error:', error);
      return NextResponse.json({
        success: false,
        error: 'スケジュールの保存に失敗しました'
      }, { status: 500 });
    }

    // レスポンス用データ変換
    const responseData = savedSchedules?.map(schedule => ({
      id: schedule.id,
      scheduledFor: schedule.scheduled_for,
      category: schedule.category,
      query: schedule.query,
      ragConfig: schedule.rag_config,
      status: schedule.status,
      quality: null,
      createdAt: schedule.created_at
    }));

    return NextResponse.json({
      success: true,
      scheduledPosts: responseData,
      summary: {
        total: scheduledPosts.length,
        weeksGenerated: weeksToGenerate,
        categoriesUsed: config.categoryRotation.length,
        approvalRequired: config.requireApproval
      }
    });

  } catch (error) {
    console.error('Generate schedule API error:', error);
    return NextResponse.json({
      success: false,
      error: 'スケジュール生成APIでエラーが発生しました'
    }, { status: 500 });
  }
} 