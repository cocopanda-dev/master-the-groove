import { renderHook } from '@testing-library/react-native';
import { useBabyPalette } from '../use-baby-palette';
import { colors } from '@design-system/tokens';

// Override the global reanimated mock with values that simulate
// withTiming returning the target value directly (synchronous in tests)
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (initial: unknown) => ({ value: initial }),
  useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
  withTiming: (toValue: unknown) => toValue,
  interpolateColor: jest.fn(
    (value: number, _inputRange: number[], outputRange: string[]) =>
      value === 0 ? outputRange[0] : outputRange[1],
  ),
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
}));

describe('useBabyPalette', () => {
  it('returns default palette colors when isBabyActive is false', () => {
    const { result } = renderHook(() => useBabyPalette(false));
    expect(result.current.backgroundColor).toBe(colors.surface);
    expect(result.current.activeTint).toBe(colors.primary);
    expect(result.current.inactiveTint).toBe(colors.textSecondary);
  });

  it('returns baby palette colors when isBabyActive is true', () => {
    const { result } = renderHook(() => useBabyPalette(true));
    expect(result.current.backgroundColor).toBe(colors.babySurface);
    expect(result.current.activeTint).toBe(colors.babyPrimary);
    expect(result.current.inactiveTint).toBe(colors.babyTextSecondary);
  });

  it('returns an object with backgroundColor, activeTint, and inactiveTint', () => {
    const { result } = renderHook(() => useBabyPalette(false));
    expect(result.current).toHaveProperty('backgroundColor');
    expect(result.current).toHaveProperty('activeTint');
    expect(result.current).toHaveProperty('inactiveTint');
  });
});
