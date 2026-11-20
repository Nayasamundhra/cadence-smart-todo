import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '@/lib/appInfo';

/**
 * Phase 0 stand-in for a tab. Replaced by the real screens in later phases.
 * Phase 1 introduces the theme tokens; until then this uses no custom colours.
 */
export function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={styles.container} testID={`screen-${name.toLowerCase()}`}>
      <Text style={styles.title} accessibilityRole="header">
        {name}
      </Text>
      <Text style={styles.caption}>{APP_NAME}: placeholder screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '600' },
  caption: { fontSize: 13, opacity: 0.6 },
});
