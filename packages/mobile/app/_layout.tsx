import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SnackbarProvider } from '@/components/ui';
import { ThemeProvider, useAppFonts, useTheme } from '@/design';
import { createNavigationTheme } from '@/design/navigationTheme';
import { AnalyticsProvider } from '@/services/analytics';
import { initMonitoring, wrapRoot } from '@/services/monitoring';

// Runs once at module load, before the first render. No-op without a DSN.
initMonitoring();

/** Everything that needs the resolved theme, so it sits inside <ThemeProvider>. */
function ThemedShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <SnackbarProvider>{children}</SnackbarProvider>
    </NavigationThemeProvider>
  );
}

function Routes() {
  const { colors } = useTheme();
  const [fontsLoaded, fontsError] = useAppFonts();
  // Hold the first frame until the fonts are ready, on the themed background so dark mode never
  // flashes white. If loading fails the app continues with the system font.
  if (!fontsLoaded && !fontsError) {
    return <View style={[styles.fill, { backgroundColor: colors.bg }]} />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.fill}>
      <AnalyticsProvider>
        <ThemeProvider>
          <ThemedShell>
            <Routes />
          </ThemedShell>
        </ThemeProvider>
      </AnalyticsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

export default wrapRoot(RootLayout);
