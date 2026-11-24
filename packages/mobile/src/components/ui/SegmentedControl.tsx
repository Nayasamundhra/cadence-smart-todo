import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for screen readers, e.g. "Theme". */
  accessibilityLabel: string;
  testID?: string;
}

/** 36 high, surfaceAlt track, surface thumb. The switch is instant, with no sliding animation. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testID,
}: SegmentedControlProps<T>) {
  const { colors, controls, radius, space } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[
        styles.track,
        {
          minHeight: controls.segmentedHeight,
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.sm,
          padding: space[1] / 2,
        },
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => onChange(option.value)}
            testID={testID ? `${testID}-${option.value}` : undefined}
            style={[
              styles.segment,
              {
                borderRadius: radius.sm - space[1] / 2,
                backgroundColor: selected ? colors.surface : 'transparent',
                paddingHorizontal: space[3],
              },
            ]}
          >
            <Text
              variant={selected ? 'bodyStrong' : 'callout'}
              color={selected ? 'text' : 'textSecondary'}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
