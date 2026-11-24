import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { fontFamily, typography, type TextColorKey, type TextVariant } from '@/design/tokens';
import { useTheme } from '@/design/ThemeProvider';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColorKey;
}

/** The only way to render text (doc 02 section 2.6). Applies family, size, line height and scaling limits. */
export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const theme = useTheme();
  const spec: (typeof typography)[TextVariant] = typography[variant];
  const base: TextStyle = {
    fontFamily: fontFamily[spec.family],
    fontSize: spec.size,
    lineHeight: spec.lineHeight,
    color: theme.colors[color],
    ...('letterSpacing' in spec ? { letterSpacing: spec.letterSpacing } : null),
    ...('uppercase' in spec ? { textTransform: 'uppercase' as const } : null),
    ...('tabular' in spec ? { fontVariant: ['tabular-nums' as const] } : null),
  };
  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={spec.maxFontSizeMultiplier}
      style={[base, style]}
      {...rest}
    />
  );
}
