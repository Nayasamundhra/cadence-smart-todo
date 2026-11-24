import { forwardRef, useEffect, useState, type ComponentRef } from 'react';
import { Animated, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';
import { useReduceMotion } from '@/design/useReduceMotion';
import { fontFamily, typography } from '@/design/tokens';
import { haptics } from '@/services/haptics';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Error message shown below the field; also switches the border to the danger colour. */
  error?: string;
}

export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(
  { label, error, onFocus, onBlur, editable = true, ...rest },
  ref,
) {
  const { colors, controls, radius, space, motion } = useTheme();
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReduceMotion();
  const [shake] = useState(() => new Animated.Value(0));

  // Error shake: 6 px, two cycles (doc 02 section 2.5). Skipped with Reduce motion.
  useEffect(() => {
    if (!error) return;
    haptics.error();
    if (reduceMotion) return;
    const step = motion.duration.fast / 4;
    const d = controls.shakeDistance;
    Animated.sequence([
      Animated.timing(shake, { toValue: d, duration: step, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -d, duration: step, useNativeDriver: true }),
      Animated.timing(shake, { toValue: d, duration: step, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: step, useNativeDriver: true }),
    ]).start();
  }, [error, reduceMotion, shake, motion.duration.fast, controls.shakeDistance]);

  const borderColor = error ? colors.danger : focused ? colors.accent : colors.borderStrong;
  const body = typography.body;

  return (
    <View style={{ gap: space[1] }}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          editable={editable}
          allowFontScaling
          maxFontSizeMultiplier={body.maxFontSizeMultiplier}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            {
              minHeight: controls.inputHeight,
              paddingHorizontal: space[4],
              borderRadius: radius.md,
              borderWidth: focused || error ? controls.focusBorder : 1,
              borderColor,
              backgroundColor: colors.surface,
              color: colors.text,
              fontFamily: fontFamily.regular,
              fontSize: body.size,
              opacity: editable ? 1 : controls.disabledOpacity,
            },
          ]}
          {...rest}
        />
      </Animated.View>
      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({ input: { textAlignVertical: 'center' } });
