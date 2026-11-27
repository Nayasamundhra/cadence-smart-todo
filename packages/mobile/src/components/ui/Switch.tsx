import { Switch as RNSwitch } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
  testID?: string;
}

/** The platform's native switch, tinted with the accent. */
export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
  testID,
}: SwitchProps) {
  const { colors, controls, isDark } = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      testID={testID}
      trackColor={{ false: colors.borderStrong, true: colors.accent }}
      // The thumb must stay light in dark mode: `surface` there is near-black and vanishes on the track.
      thumbColor={isDark ? colors.text : colors.surface}
      ios_backgroundColor={colors.borderStrong}
      style={{ opacity: disabled ? controls.disabledOpacity : 1 }}
    />
  );
}
