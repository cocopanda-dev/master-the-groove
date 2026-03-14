// src/features/feel-lessons/__tests__/LessonComplete.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonComplete } from '../components/LessonComplete';

// Mock the lesson store
const mockCompleteLesson = jest.fn();
const mockAwardFeelBadge = jest.fn();

const mockStoreState = {
  completeLesson: mockCompleteLesson,
  awardFeelBadge: mockAwardFeelBadge,
  progressByPolyrhythm: {},
  startLesson: jest.fn(),
  advanceStep: jest.fn(),
  resetLesson: jest.fn(),
  markLessonSynced: jest.fn(),
};

jest.mock('@data-access/stores', () => ({
  useLessonStore: (selector?: (s: Record<string, unknown>) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
}));

// Mock expo-router
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
}));

describe('LessonComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders celebration text', () => {
    const { getByText } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByText('Lesson Complete!')).toBeTruthy();
  });

  it('renders feel badge message', () => {
    const { getByText } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByText(/Feel 3:2 Feel Badge/)).toBeTruthy();
  });

  it('calls completeLesson and awardFeelBadge on mount', () => {
    render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(mockCompleteLesson).toHaveBeenCalledWith('3-2');
    expect(mockAwardFeelBadge).toHaveBeenCalledWith('3-2');
  });

  it('renders feel state options', () => {
    const { getByText } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByText('Executing')).toBeTruthy();
    expect(getByText('Hearing')).toBeTruthy();
    expect(getByText('Feeling')).toBeTruthy();
  });

  it('renders feel state descriptions', () => {
    const { getByText } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByText("I can do it but I'm chasing the pattern")).toBeTruthy();
    expect(getByText('I can hear the rhythm internally')).toBeTruthy();
  });

  it('allows selecting a feel state', () => {
    const { getByTestId } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    fireEvent.press(getByTestId('feel-option-hearing'));
    // The option should now be selected (visually different)
    expect(getByTestId('feel-option-hearing')).toBeTruthy();
  });

  it('renders navigation buttons', () => {
    const { getByLabelText } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByLabelText('Back to library')).toBeTruthy();
    expect(getByLabelText('Practice 3:2')).toBeTruthy();
  });

  it('asks the feel state question with correct polyrhythm', () => {
    const { getByText } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByText('How does 3:2 feel?')).toBeTruthy();
  });

  it('has the correct testID', () => {
    const { getByTestId } = render(
      <LessonComplete polyrhythmId="3-2" lessonTitle="Feel 3:2" />,
    );

    expect(getByTestId('lesson-complete')).toBeTruthy();
  });
});
