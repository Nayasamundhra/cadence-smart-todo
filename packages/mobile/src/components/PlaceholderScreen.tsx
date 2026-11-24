import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/design';
import { APP_NAME } from '@/lib/appInfo';

/** Stand-in for a tab until its real screen arrives in a later phase. Uses tokens only. */
export function PlaceholderScreen({ name }: { name: string }) {
  const { colors, space, layout } = useTheme();
  return (
    <View
      testID={`screen-${name.toLowerCase()}`}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: layout.screenPadding,
        gap: space[2],
        backgroundColor: colors.bg,
      }}
    >
      <Text variant="title1" accessibilityRole="header">
        {name}
      </Text>
      <Text variant="caption" color="textSecondary">
        {APP_NAME}: placeholder screen
      </Text>
    </View>
  );
}
