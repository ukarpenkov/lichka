const MIN_SCALE = 1;
const RESTING_SCALE_EPSILON = 0.01;

export function getPinchStartDismissState(): {
  containerTranslateY: number;
  overlayOpacity: number;
} {
  'worklet';
  return {
    containerTranslateY: 0,
    overlayOpacity: 1,
  };
}

export function isImageZoomed(scale: number): boolean {
  'worklet';
  return scale > MIN_SCALE + RESTING_SCALE_EPSILON;
}

export function getSingleTapAction(scale: number): 'close' | 'ignore' {
  'worklet';
  return isImageZoomed(scale) ? 'ignore' : 'close';
}

export function getRelativePanTranslation(
  imageStartTranslation: number,
  gestureTranslation: number,
  gestureStartTranslation: number,
): number {
  'worklet';
  return imageStartTranslation + gestureTranslation - gestureStartTranslation;
}
