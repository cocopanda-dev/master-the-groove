import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders with accessibility label', () => {
    render(<Icon name="play" accessibilityLabel="Play button" />);
    expect(screen.getByLabelText('Play button')).toBeTruthy();
  });

  it('hides decorative icons from screen readers', () => {
    render(<Icon name="decorative-dot" decorative testID="icon" />);
    const icon = screen.getByTestId('icon', { includeHiddenElements: true });
    expect(icon.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
