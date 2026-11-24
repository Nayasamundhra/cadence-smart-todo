import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/design/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  icon: LucideIcon;
  /** Specific to the screen (copy is given per screen in doc 03). */
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
  testID?: string;
}

/** 48 px line icon, serif title, one line of text and at most one primary action. */
export function EmptyState({ icon: Icon, title, message, action, testID }: EmptyStateProps) {
  const { colors, controls, space, layout } = useTheme();
  return (
    <View
      testID={testID}
      style={{
        alignItems: 'center',
        gap: space[3],
        padding: layout.screenPadding,
        maxWidth: layout.maxContentWidth,
      }}
    >
      <Icon
        size={controls.iconSize.emptyState}
        strokeWidth={controls.iconStroke}
        color={colors.textTertiary}
      />
      <Text variant="emptyTitle" accessibilityRole="header" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      <Text variant="callout" color="textSecondary" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      {action ? (
        <View style={{ marginTop: space[2] }}>
          <Button label={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}
