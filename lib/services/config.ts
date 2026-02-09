import { Globe, Zap, Code, Brain } from 'lucide-react'
import type { ServiceConfig, ServiceType } from './types'
import { homepageQuestions } from './homepage/questions'
import { homepagePrompts } from './homepage/prompts'
import { efficiencyQuestions } from './efficiency/questions'
import { efficiencyPrompts } from './efficiency/prompts'
import { customDevQuestions } from './custom-dev/questions'
import { customDevPrompts } from './custom-dev/prompts'
import { aiIntegrationQuestions } from './ai-integration/questions'
import { aiIntegrationPrompts } from './ai-integration/prompts'

export const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  homepage: {
    id: 'homepage',
    nameJa: 'ホームページ制作',
    icon: Globe,
    description: '集客力のあるホームページを低コスト・短納期で制作',
    questions: homepageQuestions,
    prompts: homepagePrompts,
    features: {
      standard: [
        'レスポンシブデザイン',
        'SEO基本対策',
        'お問い合わせフォーム',
        'SSL対応',
        'アクセス解析設置',
      ],
      premium: [
        'CMS（自分で更新可能）',
        '予約システム',
        'EC機能',
        '多言語対応',
        'SNS連携自動化',
      ],
    },
    pricingHints: {
      minPrice: 200000,
      maxPrice: 3000000,
    },
    scoringWeights: {
      budget: 0.4,
      timeline: 0.35,
      complexity: 0.25,
    },
    suggestedQuestions: [
      'SEO対策はどこまで含まれる？',
      'スマホ対応は標準？',
      '公開後の更新は自分でできる？',
      'アクセス解析はつく？',
      '写真撮影は含まれる？',
    ],
  },

  efficiency: {
    id: 'efficiency',
    nameJa: '業務効率システム',
    icon: Zap,
    description: '業務のムダを削減し、DXで生産性を最大化',
    questions: efficiencyQuestions,
    prompts: efficiencyPrompts,
    features: {
      standard: [
        'ワークフロー自動化',
        'データ一元管理',
        'レポート自動生成',
        '既存ツール連携',
        'ユーザー権限管理',
      ],
      premium: [
        'RPA連携',
        'AI-OCR（帳票読み取り）',
        'BIダッシュボード',
        'モバイル対応',
        'API連携基盤',
      ],
    },
    pricingHints: {
      minPrice: 500000,
      maxPrice: 10000000,
    },
    scoringWeights: {
      budget: 0.35,
      timeline: 0.3,
      complexity: 0.35,
    },
    suggestedQuestions: [
      '既存のExcelデータは移行できる？',
      '導入後のサポート体制は？',
      'どのくらい工数削減できる？',
      '段階的な導入は可能？',
      '他のツールとの連携は？',
    ],
  },

  'custom-dev': {
    id: 'custom-dev',
    nameJa: 'システム開発',
    icon: Code,
    description: 'Web・モバイル・業務システムをフルスクラッチ開発',
    questions: customDevQuestions,
    prompts: customDevPrompts,
    features: {
      standard: [
        '要件定義・設計',
        'フロントエンド開発',
        'バックエンド開発',
        'テスト・QA',
        'デプロイ・運用支援',
      ],
      premium: [
        'AI機能搭載',
        'マイクロサービス構成',
        'CI/CD構築',
        'パフォーマンスチューニング',
        'セキュリティ監査',
      ],
    },
    pricingHints: {
      minPrice: 500000,
      maxPrice: 20000000,
    },
    scoringWeights: {
      budget: 0.3,
      timeline: 0.3,
      complexity: 0.4,
    },
    suggestedQuestions: [
      'MVPのスコープはどうすべき？',
      '開発期間の短縮は可能？',
      'チーム構成について詳しく教えて',
      '保守運用はどうなる？',
      'セキュリティ対策は十分？',
    ],
  },

  'ai-integration': {
    id: 'ai-integration',
    nameJa: 'AI導入支援',
    icon: Brain,
    description: '最新AI技術で業務を革新し、競争優位を確立',
    questions: aiIntegrationQuestions,
    prompts: aiIntegrationPrompts,
    features: {
      standard: [
        'AI活用コンサルティング',
        'チャットボット構築',
        'RAG（社内文書検索AI）',
        '既存システム連携',
        '運用・チューニング支援',
      ],
      premium: [
        'カスタムモデル開発',
        'ファインチューニング',
        'MLOpsパイプライン',
        '画像認識・生成',
        'データ分析基盤',
      ],
    },
    pricingHints: {
      minPrice: 500000,
      maxPrice: 15000000,
    },
    scoringWeights: {
      budget: 0.3,
      timeline: 0.25,
      complexity: 0.45,
    },
    suggestedQuestions: [
      'AIの精度はどのくらい？',
      '自社データは安全に扱われる？',
      'ランニングコストはどのくらい？',
      'PoCから始められる？',
      'ChatGPTとの違いは？',
    ],
  },
}

export const SERVICE_TYPES: ServiceType[] = ['homepage', 'efficiency', 'custom-dev', 'ai-integration']

export function getServiceConfig(serviceType: ServiceType): ServiceConfig {
  return SERVICE_CONFIGS[serviceType]
}

export function isValidServiceType(value: string): value is ServiceType {
  return SERVICE_TYPES.includes(value as ServiceType)
}
