import NativeSlider from '@react-native-community/slider';
import { useTheme } from '@/design/ThemeProvider';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  accessibilityLabel: string;
  disabled?: boolean;
  testID?: string;
}

/** The platform's native slider, tinted with the accent. */
export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step,
  accessibilityLabel,
  disabled = false,
  testID,
}: SliderProps) {
  const { colors, layout, controls } = useTheme();
  return (
    <NativeSlider
      value={value}
      onValueChange={onValueChange}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      accessibilityValue={{ min: minimumValue, max: maximumValue, now: value }}
      testID={testID}
      minimumTrackTintColor={colors.accent}
      maximumTrackTintColor={colors.borderStrong}
      thumbTintColor={colors.accent}
      style={{ height: layout.touchMin, opacity: disabled ? controls.disabledOpacity : 1 }}
    />
  );
}
