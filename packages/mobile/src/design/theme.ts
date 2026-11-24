import {
  controls,
  elevation,
  hairline,
  layout,
  motion,
  palette,
  radius,
  space,
  swatches,
  typography,
  type ColorTokens,
  type PriorityLevel,
  type Scheme,
  type SwatchKey,
} from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Theme {
  scheme: Scheme;
  isDark: boolean;
  colors: ColorTokens;
  space: typeof space;
  radius: typeof radius;
  hairline: typeof hairline;
  /** Shadows are omitted in dark: use borders only (doc 02 section 2.2). */
  elevation: { none: object; card: object; float: object };
  motion: typeof motion;
  layout: typeof layout;
  controls: typeof controls;
  typography: typeof typography;
  swatch: (key: SwatchKey) => string;
  priority: (level: PriorityLevel) => string;
}

export function createTheme(scheme: Scheme): Theme {
  const colors: ColorTokens = palette[scheme];
  const isDark = scheme === 'dark';
  return {
    scheme,
    isDark,
    colors,
    space,
    radius,
    hairline,
    elevation: isDark ? { none: {}, card: {}, float: {} } : elevation,
    motion,
    layout,
    controls,
    typography,
    swatch: (key) => swatches[key][scheme],
    priority: (level) => colors.priority[level],
  };
}

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}
