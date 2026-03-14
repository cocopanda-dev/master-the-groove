import type { RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import type { View } from 'react-native';

export const focusOn = (ref: RefObject<View | null>) => {
  const node = ref.current ? findNodeHandle(ref.current) : null;
  if (node) {
    AccessibilityInfo.setAccessibilityFocus(node);
  }
};
