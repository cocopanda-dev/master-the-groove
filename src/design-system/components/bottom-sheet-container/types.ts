import type { ReactNode } from 'react';

interface BottomSheetContainerProps {
  /** Content rendered inside the bottom sheet */
  children: ReactNode;

  /** Snap points as percentages or pixel values. Default: ['30%', '60%', '90%'] */
  snapPoints?: (string | number)[];

  /** Called when the sheet is dismissed */
  onDismiss?: () => void;

  /** Whether the backdrop is tappable to dismiss. Default: true */
  enableBackdropDismiss?: boolean;
}

interface BottomSheetContainerRef {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export type { BottomSheetContainerProps, BottomSheetContainerRef };
