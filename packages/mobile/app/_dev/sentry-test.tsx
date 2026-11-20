import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { env } from '@/lib/env';
import { captureError, monitoringEnabled } from '@/services/monitoring';

/**
 * Dev-only screen to prove error reporting works (Phase 0 Definition of Done).
 * Not reachable in production builds. Open via the deep link /_dev/sentry-test.
 */
export default function SentryTest() {
  if (env.EXPO_PUBLIC_ENV === 'production') return <Redirect href="/today" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error reporting test</Text>
      <Text style={styles.caption}>
        {monitoringEnabled ? 'Sentry is enabled.' : 'Sentry is off: no DSN configured.'}
      </Text>
      <Pressable
        accessibilityRole="button"
        testID="sentry-capture"
        style={styles.button}
        onPress={() => captureError(new Error('Phase 0 test: handled error'))}
      >
        <Text>Send handled error</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        testID="sentry-throw"
        style={styles.button}
        onPress={() => {
          throw new Error('Phase 0 test: unhandled error');
        }}
      >
        <Text>Throw unhandled error</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 20, fontWeight: '600' },
  caption: { fontSize: 13, opacity: 0.6 },
  button: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
});
