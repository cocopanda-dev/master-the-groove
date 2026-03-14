// src/features/feel-lessons/__tests__/MnemonicStep.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { MnemonicStep } from '../components/MnemonicStep';
import type { LessonStep } from '@types';

const mockStep: LessonStep = {
  stepNumber: 3,
  type: 'mnemonic',
  title: 'Learn The Mnemonic',
  instruction: 'Say this phrase in rhythm:',
  secondaryText: 'The capitalized syllables land on Layer A.',
  interactionConfig: {
    mnemonic: 'NOT DIF-FI-CULT',
    syllables: [
      { text: 'NOT', beat: 1, layer: 'both' },
      { text: 'DIF', beat: 2, layer: 'A' },
      { text: 'FI', beat: 3, layer: 'B' },
      { text: 'CULT', beat: 4, layer: 'A' },
    ],
  },
  audioConfig: null,
};

describe('MnemonicStep', () => {
  it('renders the mnemonic text', () => {
    const { getByText } = render(<MnemonicStep step={mockStep} />);

    expect(getByText('NOT DIF-FI-CULT')).toBeTruthy();
  });

  it('renders the instruction text', () => {
    const { getByText } = render(<MnemonicStep step={mockStep} />);

    expect(getByText('Say this phrase in rhythm:')).toBeTruthy();
  });

  it('renders secondary text', () => {
    const { getByText } = render(<MnemonicStep step={mockStep} />);

    expect(getByText('The capitalized syllables land on Layer A.')).toBeTruthy();
  });

  it('renders syllable items', () => {
    const { getByText } = render(<MnemonicStep step={mockStep} />);

    expect(getByText('NOT')).toBeTruthy();
    expect(getByText('DIF')).toBeTruthy();
    expect(getByText('FI')).toBeTruthy();
    expect(getByText('CULT')).toBeTruthy();
  });

  it('renders the extension slot placeholder', () => {
    const { getByTestId } = render(<MnemonicStep step={mockStep} />);

    expect(getByTestId('extension-slot-ai-mnemonic-generator')).toBeTruthy();
  });

  it('has the correct testID', () => {
    const { getByTestId } = render(<MnemonicStep step={mockStep} />);

    expect(getByTestId('mnemonic-step')).toBeTruthy();
  });
});
