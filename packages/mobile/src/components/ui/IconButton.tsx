import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/design/ThemeProvider';
import type { TextColorKey } from '@/design/tokens';

export interface IconButtonProps {
  icon: LucideIcon;
  /** Required: an icon alone says nothing to a screen reader. */
  accessibilityLabel: string;
  onPress?: () => void;
  color?: TextColorKey;
  /** Small dot at the top-right, for "something needs attention". */
  badge?: boolean;
  disabled?: boolean;
  testID?: string;
}

/** 44x44 hit area with a 22 px icon (doc 02 section 2.6). */
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  color = 'text',
  badge = false,
  disabled = false,
  testID,
}: IconButtonProps) {
  const { colors, controls, layout, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          width: layout.touchMin,
          height: layout.touchMin,
          opacity: disabled ? controls.disabledOpacity : pressed ? controls.pressedOpacity : 1,
        },
      ]}
    >
      <Icon size={controls.iconSize.bar} strokeWidth={controls.iconStroke} color={colors[color]} />
      {badge ? (
        <View
          testID={testID ? `${testID}-badge` : undefined}
          style={[
            styles.badge,
            {
              top: space[2],
              right: space[2],
              width: controls.badgeDot,
              height: controls.badgeDot,
              borderRadius: controls.badgeDot,
              backgroundColor: colors.danger,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute' },
});
