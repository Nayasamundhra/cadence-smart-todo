import { View } from 'react-native';
import { CircleAlert } from '@/design/icons/lucide';
import { useTheme } from '@/design/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export interface ErrorStateProps {
  /** A plain sentence saying what failed and what to do (doc 02 section 2.10). */
  message: string;
  onRetry: () => void;
  testID?: string;
}

export function ErrorState({ message, onRetry, testID }: ErrorStateProps) {
  const { colors, controls, space, layout } = useTheme();
  return (
    <View
      testID={testID}
      style={{ alignItems: 'center', gap: space[3], padding: layout.screenPadding }}
    >
      <CircleAlert
        size={controls.iconSize.emptyState}
        strokeWidth={controls.iconStroke}
        color={colors.danger}
      />
      <Text variant="body" accessibilityRole="alert" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      <Button label="Try again" variant="secondary" onPress={onRetry} />
    </View>
  );
}
