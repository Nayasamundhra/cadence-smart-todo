import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

export interface CardProps extends ViewProps {
  /** Soft shadow for cards that sit on `bg` in light theme. Ignored in dark theme. */
  elevated?: boolean;
}

export function Card({ elevated = false, style, ...rest }: CardProps) {
  const { colors, radius, space, elevation } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: space[4],
        },
        elevated ? elevation.card : null,
        style,
      ]}
      {...rest}
    />
  );
}
