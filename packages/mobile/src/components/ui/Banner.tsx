import { Pressable, View } from 'react-native';
import { CircleAlert, Info, TriangleAlert, type LucideIcon } from '@/design/icons/lucide';
import { useTheme } from '@/design/ThemeProvider';
import { Text } from './Text';

export type BannerTone = 'info' | 'warning' | 'danger';

export interface BannerProps {
  tone: BannerTone;
  message: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
  testID?: string;
}

const defaultIcon: Record<BannerTone, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  danger: CircleAlert,
};

/** Inline, full width, soft fill. Used for offline, permission denied and sync errors. */
export function Banner({ tone, message, icon, action, testID }: BannerProps) {
  const { colors, controls, space, layout } = useTheme();
  const Icon = icon ?? defaultIcon[tone];
  const fill = colors[`${tone}Soft`];
  const accent = colors[tone];
  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        backgroundColor: fill,
        paddingVertical: space[3],
        paddingHorizontal: layout.screenPadding,
      }}
    >
      <Icon size={controls.iconSize.row} strokeWidth={controls.iconStroke} color={accent} />
      <Text
        variant="callout"
        accessibilityRole={tone === 'danger' ? 'alert' : undefined}
        style={{ flex: 1 }}
      >
        {message}
      </Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={{ minHeight: layout.touchMin, justifyContent: 'center' }}
        >
          <Text variant="bodyStrong" color={tone}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
