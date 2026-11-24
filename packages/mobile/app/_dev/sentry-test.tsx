import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Button, Text } from '@/components/ui';
import { useTheme } from '@/design';
import { env } from '@/lib/env';
import { captureError, monitoringEnabled } from '@/services/monitoring';

/**
 * Dev-only screen to prove error reporting works (Phase 0 Definition of Done).
 * Not reachable in production builds. Open via the deep link /_dev/sentry-test.
 */
export default function SentryTest() {
  const { colors, space, layout } = useTheme();
  if (env.EXPO_PUBLIC_ENV === 'production') return <Redirect href="/today" />;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[3],
        padding: layout.screenPadding,
        backgroundColor: colors.bg,
      }}
    >
      <Text variant="title2">Error reporting test</Text>
      <Text variant="caption" color="textSecondary">
        {monitoringEnabled ? 'Sentry is enabled.' : 'Sentry is off: no DSN configured.'}
      </Text>
      <Button
        label="Send handled error"
        variant="secondary"
        testID="sentry-capture"
        onPress={() => captureError(new Error('Phase 0 test: handled error'))}
      />
      <Button
        label="Throw unhandled error"
        variant="secondary"
        testID="sentry-throw"
        onPress={() => {
          throw new Error('Phase 0 test: unhandled error');
        }}
      />
    </View>
  );
}
