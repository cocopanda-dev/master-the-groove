import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  const onPress = jest.fn();
  beforeEach(() => { onPress.mockClear(); });

  it('renders children text', () => {
    render(<Button accessibilityLabel="Start" onPress={onPress}>Start</Button>);
    expect(screen.getByText('Start')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<Button accessibilityLabel="Start" onPress={onPress}>Start</Button>);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<Button accessibilityLabel="Start" onPress={onPress} disabled>Start</Button>);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has correct accessibility properties', () => {
    render(
      <Button accessibilityLabel="Play rhythm" accessibilityHint="Starts playback" onPress={onPress}>
        Play
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Play rhythm');
    expect(button.props.accessibilityHint).toBe('Starts playback');
  });

  it('shows disabled state in accessibility', () => {
    render(<Button accessibilityLabel="Play" onPress={onPress} disabled>Play</Button>);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });
});
