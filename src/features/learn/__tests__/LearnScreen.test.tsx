// src/features/learn/__tests__/LearnScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useLessonStore, useSessionStore } from '@data-access/stores';
import LearnScreen from '../../../../app/(tabs)/learn/index';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@data-access/stores', () => ({
  useLessonStore: jest.fn(),
  useSessionStore: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as unknown as jest.Mock;
const mockUseLessonStore = useLessonStore as unknown as jest.Mock;
const mockUseSessionStore = useSessionStore as unknown as jest.Mock;

describe('LearnScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({ push: mockPush });

    mockUseLessonStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector({ progressByPolyrhythm: {} }),
    );

    mockUseSessionStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector({ getCurrentFeelState: () => null }),
    );
  });

  it('renders all three polyrhythm cards', () => {
    const { getByTestId } = render(<LearnScreen />);

    expect(getByTestId('polyrhythm-card-3-2')).toBeTruthy();
    expect(getByTestId('polyrhythm-card-4-3')).toBeTruthy();
    expect(getByTestId('polyrhythm-card-2-3')).toBeTruthy();
  });

  it('active cards show the ratio name', () => {
    const { getByText } = render(<LearnScreen />);

    expect(getByText('3:2')).toBeTruthy();
    expect(getByText('4:3')).toBeTruthy();
  });

  it('coming-soon card (2-3) shows "Coming Soon" text', () => {
    const { getByText } = render(<LearnScreen />);

    expect(getByText('Coming Soon')).toBeTruthy();
  });

  it('pressing an active card calls router.push with correct pathname', () => {
    const { getByTestId } = render(<LearnScreen />);

    fireEvent.press(getByTestId('polyrhythm-card-3-2'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/learn/[polyrhythmId]',
      params: { polyrhythmId: '3-2' },
    });
  });

  it('pressing another active card calls router.push with its id', () => {
    const { getByTestId } = render(<LearnScreen />);

    fireEvent.press(getByTestId('polyrhythm-card-4-3'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/learn/[polyrhythmId]',
      params: { polyrhythmId: '4-3' },
    });
  });

  it('coming-soon card is disabled and pressing does not navigate', () => {
    const { getByTestId } = render(<LearnScreen />);

    fireEvent.press(getByTestId('polyrhythm-card-2-3'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows feel state badge when an active lesson has a feel state', () => {
    mockUseSessionStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        getCurrentFeelState: (ratioId: string) =>
          ratioId === '3-2' ? 'feeling' : null,
      }),
    );

    const { getByTestId } = render(<LearnScreen />);

    expect(getByTestId('feel-badge-3-2')).toBeTruthy();
  });

  it('does not show feel badge when there is no feel state', () => {
    const { queryByTestId } = render(<LearnScreen />);

    expect(queryByTestId('feel-badge-3-2')).toBeNull();
    expect(queryByTestId('feel-badge-4-3')).toBeNull();
  });

  it('shows lesson progress "Step 3/7" when lesson is in progress', () => {
    mockUseLessonStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        progressByPolyrhythm: {
          '3-2': { currentStep: 3, completed: false },
        },
      }),
    );

    const { getByTestId, getByText } = render(<LearnScreen />);

    expect(getByTestId('lesson-progress-3-2')).toBeTruthy();
    expect(getByText('Step 3/7')).toBeTruthy();
  });

  it('shows "Completed" badge when lesson is completed', () => {
    mockUseLessonStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        progressByPolyrhythm: {
          '4-3': { currentStep: 7, completed: true },
        },
      }),
    );

    const { getByTestId, getByText } = render(<LearnScreen />);

    expect(getByTestId('lesson-progress-4-3')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
  });
});
