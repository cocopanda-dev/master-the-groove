import type { TextProps as RNTextProps } from 'react-native';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'mono';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  readonly variant?: TextVariant;
  readonly color?: string;
  readonly align?: 'left' | 'center' | 'right';
  readonly children: React.ReactNode;
}
