import { Pressable, StyleSheet, View } from 'react-native';
import { X, type LucideIcon } from '@/design/icons/lucide';
import { useTheme } from '@/design/ThemeProvider';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** When set, a trailing X appears and calls this. */
  onRemove?: () => void;
  icon?: LucideIcon;
  /** A resolved colour for the leading dot (use `theme.swatch(key)`). */
  dotColor?: string;
  testID?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  icon: Icon,
  dotColor,
  testID,
}: ChipProps) {
  const { colors, controls, radius, space } = useTheme();
  const foreground = selected ? 'accent' : 'text';

  return (
    <View
      style={[
        styles.row,
        {
          minHeight: controls.chipHeight,
          borderRadius: radius.full,
          backgroundColor: selected ? colors.accentSoft : colors.surfaceAlt,
          paddingLeft: space[3],
          paddingRight: onRemove ? space[1] : space[3],
          gap: space[1],
        },
      ]}
    >
      <Pressable
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLabel={label}
        accessibilityState={onPress ? { selected } : undefined}
        disabled={!onPress}
        onPress={onPress}
        testID={testID}
        style={[styles.row, { gap: space[1], minHeight: controls.chipHeight }]}
      >
        {Icon ? (
          <Icon
            size={controls.iconSize.chip}
            strokeWidth={controls.iconStroke}
            color={colors[foreground]}
          />
        ) : null}
        {dotColor ? (
          <View
            style={{
              width: space[2],
              height: space[2],
              borderRadius: radius.full,
              backgroundColor: dotColor,
            }}
          />
        ) : null}
        <Text variant="caption" color={foreground} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          onPress={onRemove}
          hitSlop={space[2]}
          style={[styles.remove, { width: controls.chipHeight, height: controls.chipHeight }]}
        >
          <X
            size={controls.iconSize.chip}
            strokeWidth={controls.iconStroke}
            color={colors.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  remove: { alignItems: 'center', justifyContent: 'center' },
});
