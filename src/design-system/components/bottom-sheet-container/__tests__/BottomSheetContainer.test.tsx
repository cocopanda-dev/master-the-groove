import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BottomSheetContainer } from '../BottomSheetContainer';

describe('BottomSheetContainer', () => {
  it('renders children', () => {
    render(
      <BottomSheetContainer snapPoints={['30%', '60%']}>
        <Text>Sheet Content</Text>
      </BottomSheetContainer>,
    );
    expect(screen.getByText('Sheet Content')).toBeTruthy();
  });

  it('accepts snapPoints prop', () => {
    const { toJSON } = render(
      <BottomSheetContainer snapPoints={['30%', '60%', '90%']}>
        <Text>Content</Text>
      </BottomSheetContainer>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with default snap points when none provided', () => {
    const { toJSON } = render(
      <BottomSheetContainer>
        <Text>Content</Text>
      </BottomSheetContainer>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('exposes ref with expand and close methods', () => {
    const ref = React.createRef<{ expand: () => void; close: () => void; snapToIndex: (index: number) => void }>();
    render(
      <BottomSheetContainer ref={ref} snapPoints={['50%']}>
        <Text>Content</Text>
      </BottomSheetContainer>,
    );
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.expand).toBe('function');
    expect(typeof ref.current?.close).toBe('function');
  });
});
