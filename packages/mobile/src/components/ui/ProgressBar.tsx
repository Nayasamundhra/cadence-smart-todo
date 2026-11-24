import { View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

export interface ProgressBarProps {
  /** 0 to 1. Values outside the range are clamped. */
  progress: number;
  /** A resolved colour for the fill. Defaults to the accent. */
  color?: string;
  accessibilityLabel: string;
  testID?: string;
}

/** 6 px high, fully rounded. */
export function ProgressBar({ progress, color, accessibilityLabel, testID }: ProgressBarProps) {
  const { colors, controls, radius } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      testID={testID}
      style={{
        height: controls.progressBarHeight,
        borderRadius: radius.full,
        backgroundColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: color ?? colors.accent,
        }}
      />
    </View>
  );
}
