import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Check } from '@/design/icons/lucide';
import { useTheme } from '@/design/ThemeProvider';
import type { PriorityLevel } from '@/design/tokens';
import { haptics } from '@/services/haptics';

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Ring colour follows task priority; 0 (none) uses `borderStrong`. */
  priority?: PriorityLevel;
  size?: 'default' | 'subtask';
  accessibilityLabel: string;
  disabled?: boolean;
  testID?: string;
}

/** 22 px circle (18 for subtasks) inside a 44 px hit area. */
export function Checkbox({
  checked,
  onChange,
  priority = 0,
  size = 'default',
  accessibilityLabel,
  disabled = false,
  testID,
}: CheckboxProps) {
  const theme = useTheme();
  const { colors, controls, layout, motion } = theme;
  const diameter = controls.checkbox[size];
  const ringColor = theme.priority(priority);
  const [fill] = useState(() => new Animated.Value(checked ? 1 : 0));

  // The fill is a fast fade, which is also what Reduce motion asks for.
  useEffect(() => {
    Animated.timing(fill, {
      toValue: checked ? 1 : 0,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [checked, fill, motion.duration.fast]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      testID={testID}
      onPress={() => {
        if (checked) haptics.light();
        else haptics.success();
        onChange?.(!checked);
      }}
      style={[
        styles.hit,
        {
          width: layout.touchMin,
          height: layout.touchMin,
          opacity: disabled ? controls.disabledOpacity : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter,
            borderWidth: controls.checkbox.ring,
            borderColor: ringColor,
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.circle,
            { backgroundColor: ringColor, opacity: fill, borderRadius: diameter },
          ]}
        >
          <Check
            size={diameter - controls.checkbox.ring * 4}
            strokeWidth={controls.iconStroke + 0.75}
            color={colors.surface}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { alignItems: 'center', justifyContent: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
