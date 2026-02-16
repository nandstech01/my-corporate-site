export interface MlFeatureImportance {
  readonly name: string
  readonly importance: number
}

export interface MlPrediction {
  readonly predictedEngagement: number
  readonly confidence: number
  readonly topFeatures: readonly MlFeatureImportance[]
  readonly modelVersion: string
}

export interface MlFeatures {
  readonly [key: string]: number
}

export interface MlInsights {
  readonly topFeatures: readonly MlFeatureImportance[]
  readonly modelVersion: string
  readonly trainingSize: number
}
