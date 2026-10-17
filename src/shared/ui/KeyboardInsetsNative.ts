import {
  Platform,
  requireNativeComponent,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';

export type OverlapEvent = NativeSyntheticEvent<{ overlap: number }>;
// Keep native registration outside the React component's Fast Refresh boundary.
export const InsetsProbe = Platform.OS === 'android'
  ? requireNativeComponent<ViewProps & { onKeyboardOverlap: (event: OverlapEvent) => void }>(
    'LichkaKeyboardInsets',
  )
  : null;
