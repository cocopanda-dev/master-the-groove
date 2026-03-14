import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, colors, spacing } from '@design-system';

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.warn('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="h3" align="center">Something went wrong</Text>
          <Text variant="body" color={colors.textSecondary} align="center">
            The app encountered an unexpected error.
          </Text>
          <Button
            accessibilityLabel="Try again after error"
            accessibilityHint="Resets this section of the app"
            onPress={this.handleReset}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
});
