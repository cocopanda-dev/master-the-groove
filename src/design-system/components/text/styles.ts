import { StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, lineHeight, fontWeight, fontFamily } from '../../tokens/typography';

export const variantStyles = StyleSheet.create({
  h1: { fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.primary },
  h2: { fontSize: fontSize['2xl'], lineHeight: lineHeight['2xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.primary },
  h3: { fontSize: fontSize.xl, lineHeight: lineHeight.xl, fontWeight: fontWeight.semibold, fontFamily: fontFamily.primary },
  h4: { fontSize: fontSize.lg, lineHeight: lineHeight.lg, fontWeight: fontWeight.semibold, fontFamily: fontFamily.primary },
  body: { fontSize: fontSize.md, lineHeight: lineHeight.md, fontWeight: fontWeight.regular, fontFamily: fontFamily.primary },
  bodySmall: { fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontWeight: fontWeight.regular, fontFamily: fontFamily.primary },
  caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontWeight: fontWeight.regular, fontFamily: fontFamily.primary },
  mono: { fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.monospace },
});

export const defaultColor = colors.textPrimary;
