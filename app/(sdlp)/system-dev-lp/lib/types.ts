export type BusinessType = 'corporate' | 'individual'

export type Industry =
  | '製造業'
  | 'IT・通信'
  | '金融・保険'
  | '不動産'
  | '小売'
  | '卸売'
  | '建設'
  | 'サービス'
  | 'その他'

export type EmployeeCount =
  | '1-10'
  | '11-50'
  | '51-100'
  | '101-500'
  | '500以上'

export type SystemDestination = '自社導入' | 'クライアント先'

export type SystemType = 'WEB' | 'スマホ' | 'ソフトウェア' | '未定'

export type Timeline =
  | '1ヶ月以内'
  | '2〜3ヶ月'
  | '4〜6ヶ月'
  | '6ヶ月以上'
  | '未定'

export type Device =
  | 'PC(Windows)'
  | 'PC(Mac)'
  | 'iOS'
  | 'Android'
  | 'タブレット'

export type Budget =
  | '50万円以下'
  | '50〜100万円'
  | '100〜300万円'
  | '300〜500万円'
  | '500〜1000万円'
  | '1000〜2000万円'
  | '2000万円以上'
  | '未定'

export interface QuestionnaireAnswers {
  systemOverview: string
  industry: Industry | ''
  employeeCount: EmployeeCount | ''
  systemDestination: SystemDestination | ''
  systemType: SystemType | ''
  features: string[]
  specialRequirements: string
  timeline: Timeline | ''
  devices: Device[]
  budget: Budget | ''
  email: string
}

export interface EstimateResult {
  minPrice: number
  maxPrice: number
  estimatedDuration: string
  breakdown: {
    label: string
    amount: number
  }[]
}

export interface QuestionStep {
  id: number
  title: string
  subtitle: string
  type: 'textarea' | 'button-grid' | 'checkbox' | 'text'
  field: keyof QuestionnaireAnswers
  options?: string[]
  placeholder?: string
  maxLength?: number
  required: boolean
  skippable?: boolean
  dynamicOptions?: (answers: QuestionnaireAnswers) => string[]
}

export interface LeadData extends QuestionnaireAnswers {
  estimatedPrice: number
  estimatedDuration: string
}
