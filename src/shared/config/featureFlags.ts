export const FEATURE_FLAGS = {
  sharedElementAvatar: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
