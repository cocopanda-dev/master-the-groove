import React from 'react';
import { View } from 'react-native';

const BottomSheet = React.forwardRef(
  ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      expand: jest.fn(),
      collapse: jest.fn(),
      close: jest.fn(),
      snapToIndex: jest.fn(),
      snapToPosition: jest.fn(),
      forceClose: jest.fn(),
    }));
    return React.createElement(View, { testID: 'bottom-sheet' }, children);
  },
);

BottomSheet.displayName = 'BottomSheet';

const BottomSheetModal = React.forwardRef(
  ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
      expand: jest.fn(),
      collapse: jest.fn(),
      close: jest.fn(),
      snapToIndex: jest.fn(),
      snapToPosition: jest.fn(),
      forceClose: jest.fn(),
    }));
    return React.createElement(View, { testID: 'bottom-sheet-modal' }, children);
  },
);

BottomSheetModal.displayName = 'BottomSheetModal';

const BottomSheetModalProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'bottom-sheet-modal-provider' }, children);

const BottomSheetBackdrop = (props: Record<string, unknown>) =>
  React.createElement(View, { testID: 'bottom-sheet-backdrop', ...props });

const BottomSheetView = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'bottom-sheet-view' }, children);

const BottomSheetScrollView = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'bottom-sheet-scroll-view' }, children);

const useBottomSheet = jest.fn().mockReturnValue({
  expand: jest.fn(),
  collapse: jest.fn(),
  close: jest.fn(),
  snapToIndex: jest.fn(),
  snapToPosition: jest.fn(),
  forceClose: jest.fn(),
  animatedIndex: { value: 0 },
  animatedPosition: { value: 0 },
});

const useBottomSheetModal = jest.fn().mockReturnValue({
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
});

// eslint-disable-next-line import/no-default-export
export default BottomSheet;

export {
  BottomSheet,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  useBottomSheet,
  useBottomSheetModal,
};
