// src/features/baby-mode/__tests__/BabyResponsePrompt.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BabyResponsePrompt } from '../components/BabyResponsePrompt';

describe('BabyResponsePrompt', () => {
  it('displays the baby name in the prompt', () => {
    const onResponse = jest.fn();
    const { getByText } = render(
      <BabyResponsePrompt babyName="Luna" onResponse={onResponse} />,
    );

    expect(getByText('How did Luna respond?')).toBeTruthy();
  });

  it('calls onResponse with "calm" when Calm is pressed', () => {
    const onResponse = jest.fn();
    const { getByTestId } = render(
      <BabyResponsePrompt babyName="Luna" onResponse={onResponse} />,
    );

    fireEvent.press(getByTestId('response-calm'));

    expect(onResponse).toHaveBeenCalledWith('calm');
  });

  it('calls onResponse with "excited" when Excited is pressed', () => {
    const onResponse = jest.fn();
    const { getByTestId } = render(
      <BabyResponsePrompt babyName="Luna" onResponse={onResponse} />,
    );

    fireEvent.press(getByTestId('response-excited'));

    expect(onResponse).toHaveBeenCalledWith('excited');
  });

  it('calls onResponse with "disengaged" when Disengaged is pressed', () => {
    const onResponse = jest.fn();
    const { getByTestId } = render(
      <BabyResponsePrompt babyName="Luna" onResponse={onResponse} />,
    );

    fireEvent.press(getByTestId('response-disengaged'));

    expect(onResponse).toHaveBeenCalledWith('disengaged');
  });

  it('calls onResponse with null when Skip is pressed', () => {
    const onResponse = jest.fn();
    const { getByTestId } = render(
      <BabyResponsePrompt babyName="Luna" onResponse={onResponse} />,
    );

    fireEvent.press(getByTestId('response-skip'));

    expect(onResponse).toHaveBeenCalledWith(null);
  });

  it('renders the prompt container', () => {
    const onResponse = jest.fn();
    const { getByTestId } = render(
      <BabyResponsePrompt babyName="Luna" onResponse={onResponse} />,
    );

    expect(getByTestId('baby-response-prompt')).toBeTruthy();
  });
});
