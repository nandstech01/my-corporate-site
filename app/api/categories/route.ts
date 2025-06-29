/**
 * Stage 2A: 技術カテゴリAPI
 * - 完全静的データ（技術分野・専門カテゴリ）
 * - 認証不要
 * - ランニングコスト: 0円
 */

export async function GET() {
  try {
    const categories = {
      technology_domains: [
        {
          id: 'relevance-engineering',
          name: 'レリバンスエンジニアリング',
          description: 'Mike King理論に基づくAI検索時代の最適化手法',
          sub_categories: [
            'GEO（Generative Engine Optimization）',
            'AIO（AI Overviews最適化）',
            'Fragment ID最適化',
            'Topical Coverage拡充',
            'セマンティック内部リンク'
          ],
          applications: [
            'AI検索エンジン対応',
            'ChatGPT/Perplexity最適化', 
            'Google AI Overviews表示',
            'エンティティ関係性最適化'
          ]
        },
        {
          id: 'ai-automation',
          name: 'AI自動化技術',
          description: '業務プロセス・人事・マーケティングの完全自動化',
          sub_categories: [
            'RPA + AI統合',
            '自然言語処理自動化',
            'ワークフロー最適化',
            '意思決定支援AI'
          ],
          applications: [
            '人事業務自動化',
            'チャットボット開発',
            'SNS運用自動化',
            '顧客対応自動化'
          ]
        },
        {
          id: 'ai-development',
          name: 'AI開発・統合',
          description: 'カスタムAIシステム・エージェント・RAG開発',
          sub_categories: [
            'Large Language Models (LLM)',
            'Vector Database & RAG',
            'AI Agents & Function Calling',
            'Model Context Protocol (MCP)'
          ],
          applications: [
            'カスタムAIエージェント',
            'ベクトル検索システム',
            '知識ベース構築',
            'MCP Servers開発'
          ]
        },
        {
          id: 'system-integration',
          name: 'システム統合・開発',
          description: 'フルスタック・エンタープライズ級システム開発',
          sub_categories: [
            'フロントエンド開発',
            'バックエンドAPI設計',
            'データベース設計',
            'クラウドインフラ'
          ],
          applications: [
            'Next.js アプリケーション',
            'FastAPI マイクロサービス',
            'Supabase データベース',
            'Vercel デプロイメント'
          ]
        },
        {
          id: 'data-science',
          name: 'データサイエンス・機械学習',
          description: 'AI・ML・データ分析による価値創出',
          sub_categories: [
            '機械学習モデル開発',
            'データパイプライン構築',
            '予測分析・最適化',
            'A/Bテスト・効果測定'
          ],
          applications: [
            '顧客行動予測',
            'レコメンドシステム',
            '異常検知システム',
            'ビジネス指標分析'
          ]
        },
        {
          id: 'creative-ai',
          name: 'クリエイティブAI',
          description: 'AI技術を活用したコンテンツ・メディア制作',
          sub_categories: [
            'テキスト生成AI',
            '画像・動画生成',
            '音声合成・変換',
            'マルチモーダルAI'
          ],
          applications: [
            '動画マーケティング自動化',
            'ブログ記事生成',
            'SNSコンテンツ制作',
            'パーソナライズ配信'
          ]
        }
      ],
      service_categories: [
        'ai-automation',
        'ai-development', 
        'seo-optimization',
        'system-integration',
        'ai-creative',
        'marketing-automation',
        'education'
      ],
      industry_focus: [
        {
          industry: '製造業',
          use_cases: ['生産プロセス最適化', '品質管理AI', '予防保全システム']
        },
        {
          industry: 'サービス業',
          use_cases: ['顧客対応自動化', '業務効率化', 'データ分析システム']
        },
        {
          industry: 'IT・テック',
          use_cases: ['AI機能統合', 'システム開発', '技術コンサルティング']
        },
        {
          industry: '小売・EC',
          use_cases: ['レコメンドシステム', '在庫最適化', 'マーケティング自動化']
        }
      ],
      technology_stack: {
        frontend: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS'],
        backend: ['Python', 'FastAPI', 'Node.js', 'PostgreSQL'],
        ai_ml: ['OpenAI API', 'Anthropic Claude', 'Hugging Face', 'LangChain'],
        infrastructure: ['Vercel', 'Supabase', 'CloudFlare', 'GitHub Actions'],
        database: ['PostgreSQL', 'Vector Database', 'Redis', 'Supabase']
      }
    };

    return Response.json({
      success: true,
      data: categories,
      meta: {
        version: '1.0.0',
        last_updated: '2025-01-29',
        cache_duration: '12h'
      }
    });

  } catch (error) {
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch categories' 
      },
      { status: 500 }
    );
  }
} 