// src/features/learn/__tests__/PolyrhythmDetailScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PolyrhythmDetailScreen from '../../../../app/(tabs)/learn/[polyrhythmId]/index';
import { useLessonStore, useSessionStore } from '@data-access/stores';

// ─── expo-router mocks ────────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({ push: mockPush }),
  useNavigation: () => ({ setOptions: mockSetOptions }),
}));

// ─── store mocks ──────────────────────────────────────────────────────────────
jest.mock('@data-access/stores', () => ({
  useLessonStore: jest.fn(),
  useSessionStore: jest.fn(),
}));

const mockUseLessonStore = useLessonStore as unknown as jest.Mock;
const mockUseSessionStore = useSessionStore as unknown as jest.Mock;

// ─── helpers ──────────────────────────────────────────────────────────────────
const { useLocalSearchParams } = jest.requireMock('expo-router') as {
  useLocalSearchParams: jest.Mock;
};

/** Set up stores with sensible defaults; callers can override. */
const setupStores = ({
  progressByPolyrhythm = {} as Record<string, unknown>,
  getCurrentFeelState = (_id: string): string | null => null,
  getSessionsForPolyrhythm = (_id: string) => [] as { duration: number }[],
} = {}) => {
  mockUseLessonStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ progressByPolyrhythm }),
  );
  mockUseSessionStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ getCurrentFeelState, getSessionsForPolyrhythm }),
  );
};

// ─────────────────────────────────────────────────────────────────────────────

describe('PolyrhythmDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Renders polyrhythm detail for "3-2" with correct display name
  it('renders polyrhythm detail for "3-2" with correct display name', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores();

    const { getByTestId, getByText } = render(<PolyrhythmDetailScreen />);

    expect(getByTestId('polyrhythm-detail')).toBeTruthy();
    expect(getByText('Three against Two')).toBeTruthy();
  });

  // 2. Shows "not found" when polyrhythmId doesn't match any ratio
  it('shows "Polyrhythm Not Found" when polyrhythmId does not match any ratio', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: 'unknown-id' });
    setupStores();

    const { getByText, queryByTestId } = render(<PolyrhythmDetailScreen />);

    expect(getByText('Polyrhythm Not Found')).toBeTruthy();
    expect(queryByTestId('polyrhythm-detail')).toBeNull();
  });

  // 3. Sets navigation header title to ratio name
  it('sets navigation header title to the ratio name', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores();

    render(<PolyrhythmDetailScreen />);

    expect(mockSetOptions).toHaveBeenCalledWith({ title: '3:2' });
  });

  // 4. Shows "Start Lesson" button text when no progress
  it('shows "Start Lesson" when there is no lesson progress', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores({ progressByPolyrhythm: {} });

    const { getByText } = render(<PolyrhythmDetailScreen />);

    expect(getByText('Start Lesson')).toBeTruthy();
  });

  // 5. Shows "Continue Lesson (Step 3/7)" when lesson is in progress
  it('shows "Continue Lesson (Step 3/7)" when lesson is in progress at step 3', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores({
      progressByPolyrhythm: {
        '3-2': { currentStep: 3, completed: false },
      },
    });

    const { getByText } = render(<PolyrhythmDetailScreen />);

    expect(getByText('Continue Lesson (Step 3/7)')).toBeTruthy();
  });

  // 6. Shows "Review Lesson" when lesson is completed
  it('shows "Review Lesson" when lesson is completed', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores({
      progressByPolyrhythm: {
        '3-2': { currentStep: 7, completed: true },
      },
    });

    const { getByText } = render(<PolyrhythmDetailScreen />);

    expect(getByText('Review Lesson')).toBeTruthy();
  });

  // 7. Pressing the lesson button navigates to the lesson route
  it('navigates to the lesson route when the lesson button is pressed', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores();

    const { getByText } = render(<PolyrhythmDetailScreen />);

    // Press the Button component by its text content
    fireEvent.press(getByText('Start Lesson'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/learn/[polyrhythmId]/lesson',
      params: { polyrhythmId: '3-2' },
    });
  });

  // 8. Shows feel state badge when feel state exists
  it('shows the feel state badge when a feel state exists', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores({
      getCurrentFeelState: (_id: string) => 'hearing',
    });

    const { getByTestId } = render(<PolyrhythmDetailScreen />);

    expect(getByTestId('feel-state-badge')).toBeTruthy();
  });

  // 9. Shows correct session count
  it('shows the correct session count', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    setupStores({
      getSessionsForPolyrhythm: (_id: string) => [
        { duration: 120 },
        { duration: 180 },
        { duration: 60 },
      ],
    });

    const { getByTestId } = render(<PolyrhythmDetailScreen />);

    expect(getByTestId('session-count').props.children).toBe(3);
  });

  // 10. Shows correct practice time in minutes
  it('shows the correct practice time rounded to nearest minute', () => {
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '3-2' });
    // 150 seconds total → Math.round(150 / 60) = 3 minutes
    setupStores({
      getSessionsForPolyrhythm: (_id: string) => [
        { duration: 90 },
        { duration: 60 },
      ],
    });

    const { getByTestId } = render(<PolyrhythmDetailScreen />);

    expect(getByTestId('practice-time').props.children).toBe(3);
  });

  // 11. Does not show lesson button for coming-soon ratios
  it('does not show the lesson button for coming-soon ratios', () => {
    // "2-3" is not in ACTIVE_RATIO_IDS (which contains only '3-2' and '4-3')
    useLocalSearchParams.mockReturnValue({ polyrhythmId: '2-3' });
    setupStores();

    const { queryByTestId } = render(<PolyrhythmDetailScreen />);

    expect(queryByTestId('start-lesson-btn')).toBeNull();
  });
});
