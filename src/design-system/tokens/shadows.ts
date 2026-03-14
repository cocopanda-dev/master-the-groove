import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

const createShadow = (offsetY: number, radius: number, opacity: number): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: offsetY * 2,
    },
    default: {},
  }) as ViewStyle;

export const shadows = {
  sm: createShadow(1, 2, 0.3),
  md: createShadow(4, 6, 0.3),
  lg: createShadow(10, 15, 0.4),
} as const;
