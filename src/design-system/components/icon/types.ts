type IconBaseProps = {
  readonly name: string;
  readonly size?: number;
  readonly color?: string;
  readonly testID?: string;
};

export type IconProps =
  | (IconBaseProps & { readonly accessibilityLabel: string; readonly decorative?: never })
  | (IconBaseProps & { readonly decorative: true; readonly accessibilityLabel?: never });
