import { Pressable, View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';
import { Text } from './Text';

export interface ListHeaderProps {
  title: string;
  count?: number;
  action?: { label: string; onPress: () => void };
  testID?: string;
}

/** Overline title, optional count and action. 32 above, 8 below. */
export function ListHeader({ title, count, action, testID }: ListHeaderProps) {
  const { space, layout } = useTheme();
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: space[8],
        paddingBottom: space[2],
        paddingHorizontal: layout.screenPadding,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2], flexShrink: 1 }}>
        <Text
          variant="overline"
          color="textSecondary"
          accessibilityRole="header"
          accessibilityLabel={count === undefined ? title : `${title}, ${count}`}
        >
          {title}
        </Text>
        {count !== undefined ? (
          <Text variant="overline" color="textTertiary" importantForAccessibility="no">
            {count}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          hitSlop={space[2]}
        >
          <Text variant="callout" color="accent">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
