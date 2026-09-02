export const FEATURES = {
  JOURNAL_AUDIT: false,
} as const

export type FeatureCode = keyof typeof FEATURES
