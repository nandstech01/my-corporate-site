import type { ServiceQuestion } from '../types'

const webFeatures = [
  'お問い合わせフォーム',
  'ブログ・CMS機能',
  'ユーザー認証・ログイン',
  '決済機能',
  'チャット機能',
  '予約システム',
  'メール配信',
  'SEO対策',
  'SNS連携',
  '多言語対応',
  'ダッシュボード',
  'ファイルアップロード',
]

const mobileFeatures = [
  'プッシュ通知',
  'カメラ連携',
  'GPS・位置情報',
  'オフライン対応',
  'QRコード読み取り',
  'チャット機能',
  '決済機能',
  'ユーザー認証',
  'SNS連携',
  'ダッシュボード',
  'ファイルアップロード',
  '生体認証',
]

const softwareFeatures = [
  'データベース管理',
  'レポート・帳票出力',
  'バッチ処理',
  'API連携',
  'メール通知',
  'ユーザー権限管理',
  'ログ管理',
  'バックアップ機能',
  'データインポート/エクスポート',
  '外部サービス連携',
  'ワークフロー管理',
  'ダッシュボード',
]

const defaultFeatures = [
  'お問い合わせフォーム',
  'ユーザー認証・ログイン',
  '決済機能',
  'チャット機能',
  'メール通知',
  'ダッシュボード',
  'データベース管理',
  'API連携',
  'ファイルアップロード',
  'レポート出力',
]

function getFeaturesBySystemType(answers: Record<string, unknown>): string[] {
  switch (answers.systemType) {
    case 'WEB':
      return webFeatures
    case 'スマホ':
      return mobileFeatures
    case 'ソフトウェア':
      return softwareFeatures
    default:
      return defaultFeatures
  }
}

export const customDevQuestions: ServiceQuestion[] = [
  {
    id: 1,
    title: '開発したいシステムの概要を教えてください',
    subtitle: '大まかなイメージで構いません',
    type: 'textarea',
    field: 'projectOverview',
    placeholder: '例: 社内の勤怠管理をデジタル化したい、ECサイトを作りたい、など',
    maxLength: 500,
    required: true,
  },
  {
    id: 2,
    title: 'お客様の業種を教えてください',
    subtitle: '最も近いものをお選びください',
    type: 'button-grid',
    field: 'industry',
    options: [
      '製造業',
      'IT・通信',
      '金融・保険',
      '不動産',
      '小売',
      '卸売',
      '建設',
      'サービス',
      'その他',
    ],
    required: true,
  },
  {
    id: 3,
    title: '開発するシステムの種別を教えてください',
    subtitle: '主な開発対象',
    type: 'button-grid',
    field: 'systemType',
    options: ['WEB', 'スマホ', 'ソフトウェア', '未定'],
    required: true,
  },
  {
    id: 4,
    title: '欲しい機能を選んでください',
    subtitle: '複数選択可能です',
    type: 'checkbox',
    field: 'features',
    dynamicOptions: getFeaturesBySystemType,
    required: true,
  },
  {
    id: 5,
    title: '特殊な要件はありますか？',
    subtitle: 'セキュリティ要件や外部連携など',
    type: 'textarea',
    field: 'specialRequirements',
    placeholder: '例: ISO27001対応が必要、既存システムとのAPI連携がある、など',
    maxLength: 500,
    required: false,
    skippable: true,
  },
  {
    id: 6,
    title: '導入の希望時期を教えてください',
    subtitle: 'おおよその目安で構いません',
    type: 'button-grid',
    field: 'timeline',
    options: ['1ヶ月以内', '2〜3ヶ月', '4〜6ヶ月', '6ヶ月以上', '未定'],
    required: true,
  },
  {
    id: 7,
    title: 'ご予算の目安を教えてください',
    subtitle: 'お気軽にお選びください',
    type: 'button-grid',
    field: 'budget',
    options: [
      '50万円以下',
      '50〜100万円',
      '100〜300万円',
      '300〜500万円',
      '500〜1000万円',
      '1000万円以上',
      '未定',
    ],
    required: true,
  },
]
