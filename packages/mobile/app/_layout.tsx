import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AnalyticsProvider } from '@/services/analytics';
import { initMonitoring, wrapRoot } from '@/services/monitoring';

// Runs once at module load, before the first render. No-op without a DSN.
initMonitoring();

function RootLayout() {
  return (
    <AnalyticsProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AnalyticsProvider>
  );
}

export default wrapRoot(RootLayout);
