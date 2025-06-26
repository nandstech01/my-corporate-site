import React from 'react';

// 技術スタックデータ  
const TECH_CATEGORIES = [
  {
    category: 'レリバンスエンジニアリング・AIO対策',
    description: 'AI検索エンジンに最適化されたコンテンツ生成システム',
    technologies: [
      {
        name: 'レリバンスエンジニアリング',
        description: 'Mike King理論に基づくAI検索最適化',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'AIO対策（AI最適化）',
        description: 'ChatGPT・Perplexity・Google SGE対応',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'セマンティック検索',
        description: 'コンテキスト理解による関連性最適化',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'コンテキスト最適化',
        description: 'ユーザー意図の高精度理解システム',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      }
    ]
  },
  {
    category: '求人サイト・マッチング技術',
    description: '高精度求人マッチングとスクリーニング自動化システム',
    technologies: [
      {
        name: '求人マッチングAI',
        description: 'スキル・経験のベクトル化による高精度マッチング',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: '自動スクリーニング',
        description: '候補者評価の自動化・工数90%削減',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'レコメンドエンジン',
        description: 'パーソナライズされた求人推薦システム',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3.277 12.532a1 1 0 01.375-1.297l2.423-1.454a1 1 0 011.154.102l4.084 3.362a1 1 0 01.154 1.319l-1.499 2.27a1 1 0 01-1.66.02l-4.831-4.322a1 1 0 01-.2-1.3z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: 'リアルタイム分析',
        description: '採用効果測定・改善提案システム',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        ),
        expertise: 'Expert'
      }
    ]
  },
  {
    category: 'Webアプリ構築技術',
    description: 'フルスタック開発・モダンフレームワーク・高性能アプリケーション',
    technologies: [
      {
        name: 'React / Next.js',
        description: 'モダンフロントエンド開発・SSR・SPA構築',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Node.js / Express',
        description: 'サーバーサイド開発・API構築・高速処理',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h3a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'TypeScript',
        description: '型安全性・保守性・大規模開発対応',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: 'Tailwind CSS',
        description: 'ユーティリティファースト・レスポンシブデザイン',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      }
    ]
  },
  {
    category: 'Python・データサイエンス',
    description: '機械学習・データ分析・科学計算・Web開発',
    technologies: [
      {
        name: 'Python / Django',
        description: 'Webフレームワーク・RESTful API・ORM',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'scikit-learn',
        description: '機械学習・分類・回帰・クラスタリング',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: 'Pandas / NumPy',
        description: 'データ操作・数値計算・統計分析',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Matplotlib / Plotly',
        description: 'データ可視化・グラフ作成・ダッシュボード',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      }
    ]
  },
  {
    category: 'チャットボット技術',
    description: '対話AI・自然言語処理・自動応答システム',
    technologies: [
      {
        name: 'GPT-4 API',
        description: '最新AI・自然言語理解・高精度回答生成',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'WebSocket',
        description: 'リアルタイム通信・双方向通信・即座応答',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-1.929 3.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-.995-.102-1.951-.343-2.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: '多言語対応',
        description: '日英中韓対応・翻訳API・国際化対応',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: 'MongoDB',
        description: '対話履歴・ユーザー管理・スケーラブルDB',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        ),
        expertise: 'Advanced'
      }
    ]
  },
  {
    category: 'AI・機械学習',
    description: '最先端のAI技術を活用したシステム開発',
    technologies: [
      {
        name: 'OpenAI GPT-4',
        description: '高精度な自然言語処理',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'RAG (Retrieval-Augmented Generation)',
        description: 'Triple RAGアーキテクチャ実装',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Vector Database',
        description: 'ベクトル検索・類似度計算',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'DALLE-3',
        description: 'AI画像生成システム',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      }
    ]
  },
  {
    category: 'バックエンド開発',
    description: '高性能・高可用性システムの構築',
    technologies: [
      {
        name: 'FastAPI',
        description: '高速API開発フレームワーク',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'PostgreSQL',
        description: 'エンタープライズ級データベース',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Redis',
        description: 'インメモリデータストア',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: 'Docker',
        description: 'コンテナ化・デプロイ自動化',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3.277 12.532a1 1 0 01.375-1.297l2.423-1.454a1 1 0 011.154.102l4.084 3.362a1 1 0 01.154 1.319l-1.499 2.27a1 1 0 01-1.66.02l-4.831-4.322a1 1 0 01-.2-1.3z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      }
    ]
  },
  {
    category: 'フロントエンド',
    description: 'モダンなユーザーインターフェース',
    technologies: [
      {
        name: 'Next.js 14',
        description: 'React フルスタックフレームワーク',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'TypeScript',
        description: '型安全な開発環境',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Tailwind CSS',
        description: 'ユーティリティファーストCSS',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Three.js',
        description: '3Dグラフィックス・アニメーション',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v6a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      }
    ]
  },
  {
    category: 'インフラ・DevOps',
    description: '安定運用・スケーラブルなインフラ',
    technologies: [
      {
        name: 'AWS / Google Cloud',
        description: 'クラウドインフラ構築',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Supabase',
        description: 'BaaS・リアルタイムDB',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Vercel',
        description: 'フロントエンドデプロイ',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'GitHub Actions',
        description: 'CI/CD パイプライン',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Advanced'
      }
    ]
  },
  {
    category: '外部API連携',
    description: '豊富な外部サービス連携実績',
    technologies: [
      {
        name: 'e-Gov API',
        description: '法令データベース連携',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Google Sheets API',
        description: 'スプレッドシート自動化',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        ),
        expertise: 'Expert'
      },
      {
        name: 'Stripe API',
        description: '決済システム統合',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h10z" />
          </svg>
        ),
        expertise: 'Advanced'
      },
      {
        name: 'SendGrid API',
        description: 'メール配信システム',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        ),
        expertise: 'Advanced'
      }
    ]
  }
];

const getExpertiseColor = (expertise: string) => {
  switch (expertise) {
    case 'Expert':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Advanced':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TechStackSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            技術スタック
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            最新技術と豊富な経験を組み合わせ、高品質なシステムを短期間で開発
          </p>
        </div>

        <div className="space-y-12">
          {TECH_CATEGORIES.map((category, categoryIndex) => (
            <div key={category.category} className="bg-gray-50 border border-gray-200 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.category}
                </h3>
                <p className="text-gray-600">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-gray-400 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-blue-600">{typeof tech.icon === 'string' ? <span className="text-3xl">{tech.icon}</span> : tech.icon}</div>
                      <span
                        className={`px-2 py-1 text-xs font-medium border ${getExpertiseColor(
                          tech.expertise
                        )}`}
                      >
                        {tech.expertise}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {tech.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 技術力の特徴 */}
        <div className="mt-16 bg-gray-900 border border-gray-700 p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">
              なぜエヌアンドエスの技術力が選ばれるのか
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">最新技術の迅速導入</h4>
              <p className="text-gray-300">
                レリバンスエンジニアリング、AIO対策、求人マッチングAIなど最新のAI技術を実プロジェクトで活用し、競合他社より早く価値を提供
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">業界最速の開発速度</h4>
              <p className="text-gray-300">
                30分自動生成システム、求人マッチングシステムなど、従来の開発期間を大幅に短縮する独自のアプローチ
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">コスト効率の最適化</h4>
              <p className="text-gray-300">
                自動化とAI活用により、従来の1/10のコストでシステム運用を実現。求人サイトでは工数90%削減を達成
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            技術相談・システム開発のご依頼
          </h3>
          <p className="text-gray-600 mb-8">
            最新技術を活用したシステム開発について、無料でご相談いただけます
          </p>
          <a
            href="#consultation-section"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-bold border border-blue-700 hover:bg-blue-700 transition-all duration-300 shadow-lg"
          >
            技術相談を申し込む
          </a>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection; 