import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from '../Text';

describe('Text', () => {
  it('renders children text content', () => {
    render(<Text>Hello GrooveCore</Text>);
    expect(screen.getByText('Hello GrooveCore')).toBeTruthy();
  });

  it('defaults to body variant', () => {
    const { getByText } = render(<Text>Body text</Text>);
    const element = getByText('Body text');
    expect(element.props.style).toBeDefined();
  });

  it('applies accessibilityRole when provided', () => {
    render(<Text accessibilityRole="header">Title</Text>);
    expect(screen.getByRole('header')).toBeTruthy();
  });
});
