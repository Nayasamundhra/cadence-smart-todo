import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/design/ThemeProvider';
import type { TextColorKey } from '@/design/tokens';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const { colors, controls } = theme;

  const looks: Record<
    ButtonVariant,
    { background: string; border: string; text: TextColorKey; spinner: string }
  > = {
    primary: {
      background: colors.accent,
      border: colors.accent,
      text: 'onAccent',
      spinner: colors.onAccent,
    },
    secondary: {
      background: colors.surface,
      border: colors.border,
      text: 'text',
      spinner: colors.text,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      text: 'accent',
      spinner: colors.accent,
    },
    // The danger fill is light in dark mode, so its label uses the surface colour in both themes.
    danger: {
      background: colors.danger,
      border: colors.danger,
      text: 'surface',
      spinner: colors.surface,
    },
  };
  const look = looks[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          height: controls.buttonHeight[size],
          minWidth: controls.buttonHeight[size],
          paddingHorizontal: theme.space[size === 'sm' ? 3 : 5],
          borderRadius: theme.radius.md,
          backgroundColor: look.background,
          borderColor: look.border,
          // Loading keeps full strength: the spinner is the feedback. Disabled is dimmed.
          opacity: disabled ? controls.disabledOpacity : pressed ? controls.pressedOpacity : 1,
        },
      ]}
    >
      {/* The label stays in layout while loading, so the button keeps its width. */}
      <View style={[styles.content, { opacity: loading ? 0 : 1, gap: theme.space[2] }]}>
        {Icon ? (
          <Icon
            size={controls.iconSize.row}
            strokeWidth={controls.iconStroke}
            color={colors[look.text]}
          />
        ) : null}
        <Text variant="bodyStrong" color={look.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {loading ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.spinner}>
            <ActivityIndicator color={look.spinner} />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  spinner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
