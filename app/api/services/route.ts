/**
 * Stage 2A: 超軽量サービス情報API
 * - 完全静的データ（DBアクセスなし）
 * - 認証不要
 * - ランニングコスト: 0円
 */

export async function GET() {
  try {
    const services = [
      {
        id: 'hr-solutions',
        name: 'HR Solutions',
        category: 'ai-automation',
        description: '人事業務AI自動化ソリューション',
        features: ['13法令準拠RAG', '労働組合連携', '給与計算自動化'],
        url: '/hr-solutions'
      },
      {
        id: 'ai-agents',
        name: 'AI Agents',
        category: 'ai-development',
        description: 'カスタムAIエージェント開発',
        features: ['Mastra Framework', 'Function Calling', 'Tool Use'],
        url: '/ai-agents'
      },
      {
        id: 'aio-seo',
        name: 'AIO SEO',
        category: 'seo-optimization',
        description: 'AI検索最適化・レリバンスエンジニアリング',
        features: ['Mike King理論', 'GEO最適化', 'Fragment ID'],
        url: '/aio-seo'
      },
      {
        id: 'vector-rag',
        name: 'Vector RAG',
        category: 'ai-development',
        description: 'ベクトル検索・知識ベース構築',
        features: ['高精度検索', 'マルチモーダル対応', 'スケーラブル設計'],
        url: '/vector-rag'
      },
      {
        id: 'chatbot-development',
        name: 'Chatbot Development',
        category: 'ai-automation',
        description: 'GPT-4チャットボット開発',
        features: ['業界特化', '多言語対応', 'エスカレーション機能'],
        url: '/chatbot-development'
      },
      {
        id: 'system-development',
        name: 'System Development',
        category: 'system-integration',
        description: 'フルスタックシステム開発',
        features: ['RAGシステム', '自動生成', 'フルスタック開発'],
        url: '/system-development'
      },
      {
        id: 'video-generation',
        name: 'Video Generation',
        category: 'ai-creative',
        description: '動画生成AI・自動動画作成',
        features: ['AIクリエイティブ', '動画マーケティング', 'ROI最適化'],
        url: '/video-generation'
      },
      {
        id: 'mcp-servers',
        name: 'MCP Servers',
        category: 'ai-development',
        description: 'Model Context Protocol専門開発',
        features: ['カスタム開発', 'API統合', 'エンタープライズ級'],
        url: '/mcp-servers'
      },
      {
        id: 'sns-automation',
        name: 'SNS Automation',
        category: 'marketing-automation',
        description: 'SNS運用完全自動化',
        features: ['マルチプラットフォーム', 'エンゲージメント分析', 'コンテンツ自動生成'],
        url: '/sns-automation'
      },
      {
        id: 'fukugyo',
        name: 'AI副業支援',
        category: 'education',
        description: 'AI副業スキル習得支援',
        features: ['10カテゴリー', 'AI翻訳', '音声合成'],
        url: '/fukugyo'
      },
      {
        id: 'corporate',
        name: '法人向けAIリスキリング',
        category: 'education',
        description: '企業向けAI研修・業務効率化',
        features: ['研修プログラム', '業務効率化', 'AI導入支援'],
        url: '/corporate'
      }
    ];

    return Response.json({
      success: true,
      data: {
        services,
        total: services.length,
        categories: [
          'ai-automation',
          'ai-development', 
          'seo-optimization',
          'system-integration',
          'ai-creative',
          'marketing-automation',
          'education'
        ]
      },
      meta: {
        version: '1.0.0',
        last_updated: '2025-01-29',
        cache_duration: '1h'
      }
    });

  } catch (error) {
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch services' 
      },
      { status: 500 }
    );
  }
} 