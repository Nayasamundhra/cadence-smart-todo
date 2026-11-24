import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/design/ThemeProvider';

export type ProgressRingSize = 20 | 40 | 72 | 120;

export interface ProgressRingProps {
  /** 0 to 1. Values outside the range are clamped. */
  progress: number;
  size?: ProgressRingSize;
  /** A resolved colour for the fill (e.g. `theme.swatch('moss')`). Defaults to the accent. */
  color?: string;
  /** Centre label, e.g. a Text with "60%". */
  children?: ReactNode;
  accessibilityLabel: string;
  testID?: string;
}

/** SVG ring: `border` track, fill in the given colour. Sizes 20, 40, 72 and 120. */
export function ProgressRing({
  progress,
  size = 40,
  color,
  children,
  accessibilityLabel,
  testID,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const stroke = Math.max(2, Math.round(size / 10));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const centre = size / 2;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      testID={testID}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={centre}
          cy={centre}
          r={r}
          stroke={colors.border}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={centre}
          cy={centre}
          r={r}
          stroke={color ?? colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          rotation={-90}
          origin={`${centre}, ${centre}`}
        />
      </Svg>
      {children ? <View style={[StyleSheet.absoluteFill, styles.centre]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center' },
});
