import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { BottomSheetContainerProps, BottomSheetContainerRef } from './types';

const DEFAULT_SNAP_POINTS = ['30%', '60%', '90%'];

/**
 * Reusable bottom sheet wrapper built on @gorhom/bottom-sheet.
 *
 * Features own the sheet content. The navigation shell provides this container.
 * Configurable snap points (default: 30%, 60%, 90%).
 * Semi-transparent backdrop, tappable to dismiss.
 * Visible drag handle at top.
 */
const BottomSheetContainer = forwardRef<BottomSheetContainerRef, BottomSheetContainerProps>(
  ({ children, snapPoints, onDismiss, enableBackdropDismiss = true }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const resolvedSnapPoints = useMemo(
      () => snapPoints ?? DEFAULT_SNAP_POINTS,
      [snapPoints],
    );

    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
      snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={enableBackdropDismiss ? 'close' : 'none'}
        />
      ),
      [enableBackdropDismiss],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#94A3B8' }}
        onClose={onDismiss}
        index={-1}
      >
        <BottomSheetView>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

BottomSheetContainer.displayName = 'BottomSheetContainer';

export { BottomSheetContainer };
