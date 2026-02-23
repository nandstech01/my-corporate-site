export interface MlFeatureImportance {
  readonly name: string
  readonly importance: number
}

export interface MlPrediction {
  readonly predictedEngagement: number
  readonly confidence: number
  readonly topFeatures: readonly MlFeatureImportance[]
  readonly modelVersion: string
  readonly features: Record<string, number>
}

export interface MlFeatures {
  readonly [key: string]: number
}

export interface MlInsights {
  readonly topFeatures: readonly MlFeatureImportance[]
  readonly modelVersion: string
  readonly trainingSize: number
}

export interface MlTrainResult {
  readonly success: boolean
  readonly modelVersion: string
  readonly trainingSize: number
  readonly mae: number
  readonly rmse: number
  readonly skipped: boolean
  readonly reason?: string
  // Phase 2: Forward validation metrics
  readonly validationMae?: number
  readonly validationRmse?: number
  readonly validationSize?: number
  readonly holdoutDays?: number
}
