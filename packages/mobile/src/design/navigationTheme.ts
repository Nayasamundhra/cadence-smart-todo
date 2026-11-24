import { DefaultTheme, type Theme as NavigationTheme } from 'expo-router';
import type { Theme } from './theme';

/**
 * Maps our tokens onto the navigation library's theme so the screen behind a transition, headers
 * and the tab bar border use Cadence colours instead of the library defaults (no white flash in dark).
 */
export function createNavigationTheme(theme: Theme): NavigationTheme {
  return {
    ...DefaultTheme,
    dark: theme.isDark,
    colors: {
      primary: theme.colors.accent,
      background: theme.colors.bg,
      card: theme.colors.bg,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}
