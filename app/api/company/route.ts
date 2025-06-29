/**
 * Stage 2A: 基本企業情報API
 * - 完全静的データ（実際の企業情報ベース）
 * - 認証不要
 * - ランニングコスト: 0円
 */

export async function GET() {
  try {
    const companyInfo = {
      name: '株式会社エヌアンドエス',
      name_en: 'N&S Co., Ltd.',
      founded: 2020,
      ceo: '原田賢治',
      description: 'レリバンスエンジニアリング・AI技術分野の専門企業',
      mission: 'AI技術とレリバンスエンジニアリングで企業のDXを支援',
      vision: 'AI検索時代の新しい最適化手法を確立し、企業の成長を加速',
      specialties: [
        'レリバンスエンジニアリング',
        'AI技術開発',
        'システムアーキテクチャ',
        'AIO対策・GEO最適化',
        'エンタープライズAI導入',
        'フルスタック開発'
      ],
      services_categories: [
        {
          category: 'AI自動化',
          description: '人事・業務プロセスの完全自動化',
          services: ['HR Solutions', 'Chatbot Development']
        },
        {
          category: 'AI開発',
          description: 'カスタムAIシステム・エージェント開発',
          services: ['AI Agents', 'Vector RAG', 'MCP Servers']
        },
        {
          category: 'SEO・マーケティング',
          description: 'AI検索時代の最適化戦略',
          services: ['AIO SEO', 'SNS Automation']
        },
        {
          category: 'システム統合',
          description: 'フルスタック・エンタープライズ開発',
          services: ['System Development']
        },
        {
          category: 'クリエイティブAI',
          description: 'AI技術を活用したコンテンツ制作',
          services: ['Video Generation']
        },
        {
          category: '教育・研修',
          description: 'AI技術教育・企業研修サービス',
          services: ['AI副業支援', '法人向けAIリスキリング']
        }
      ],
      contact: {
        email: 'info@nands.tech',
        website: 'https://nands.tech',
        social: {
          github: 'https://github.com/nands-tech',
          linkedin: 'https://linkedin.com/company/nands-tech'
        }
      },
      business_model: {
        primary: 'B2B技術コンサルティング・システム開発',
        target_clients: [
          '中小企業・スタートアップ',
          '製造業・サービス業',
          'IT企業・システム開発会社'
        ]
      },
      technology_focus: {
        ai_technologies: [
          '機械学習・深層学習',
          '自然言語処理',
          'ベクトル検索・RAG',
          'LLM活用システム'
        ],
        development_stack: [
          'TypeScript・Next.js',
          'Python・FastAPI',
          'Supabase・PostgreSQL',
          'Vercel・クラウドインフラ'
        ]
      }
    };

    return Response.json({
      success: true,
      data: companyInfo,
      meta: {
        version: '1.0.0',
        last_updated: '2025-01-29',
        cache_duration: '24h'
      }
    });

  } catch (error) {
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch company information' 
      },
      { status: 500 }
    );
  }
} 