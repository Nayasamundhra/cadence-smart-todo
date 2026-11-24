/**
 * Design tokens (docs/02-design-system.md section 2.2 and 2.3). The only file in the app that may
 * contain raw colour values, sizes and durations. Screens read them through `useTheme()`.
 */

export const palette = {
  light: {
    bg: '#F7F6F2', // screen background
    surface: '#FFFFFF', // cards, sheets, inputs
    surfaceAlt: '#F0EEE8', // pressed rows, chips, skeleton base, grouped headers
    border: '#E4E1D8', // hairlines, card borders
    borderStrong: '#CFCBBF', // input borders, checkbox ring (priority none)
    text: '#1B1B18',
    textSecondary: '#5E5C55',
    textTertiary: '#737067', // placeholders, metadata. Do not use on surfaceAlt for essential text
    accent: '#1F6F5C',
    onAccent: '#FFFFFF',
    accentSoft: '#E3F0EC', // AI surfaces, selected chips, today cell
    danger: '#B93636',
    dangerSoft: '#F8E7E5',
    warning: '#9C5606',
    warningSoft: '#F7ECD9',
    info: '#2A62B3',
    infoSoft: '#E4EDF9',
    success: '#27724A',
    successSoft: '#E2F1E8',
    overlay: 'rgba(20,20,18,0.40)', // behind sheets and dialogs
    priority: { 0: '#CFCBBF', 1: '#6E6B62', 2: '#2A62B3', 3: '#9C5606', 4: '#B93636' },
  },
  dark: {
    bg: '#111210',
    surface: '#1A1B18',
    surfaceAlt: '#232420',
    border: '#2E2F2A',
    borderStrong: '#42433D',
    text: '#F2F1EC',
    textSecondary: '#A9A79E',
    textTertiary: '#8F8D84',
    accent: '#5FC2A6',
    onAccent: '#0C1F1A',
    accentSoft: '#17302A',
    danger: '#EF7A74',
    dangerSoft: '#3A1F1D',
    warning: '#E5A04A',
    warningSoft: '#35281A',
    info: '#7FB0F0',
    infoSoft: '#1B2A3D',
    success: '#6CC48D',
    successSoft: '#1A3024',
    overlay: 'rgba(0,0,0,0.60)',
    priority: { 0: '#42433D', 1: '#8F8D84', 2: '#7FB0F0', 3: '#E5A04A', 4: '#EF7A74' },
  },
} as const;

/** Colour tokens of one scheme, with the literal hex types widened to `string`. */
export type ColorTokens = {
  [K in keyof (typeof palette)['light']]: K extends 'priority'
    ? Record<PriorityLevel, string>
    : string;
};
export type PriorityLevel = 0 | 1 | 2 | 3 | 4;
export type TextColorKey = Exclude<keyof ColorTokens, 'priority'>;
export type Scheme = keyof typeof palette;

// User-assignable colours for projects, tags, categories, habits, goals.
// Stored in the DB as the key ('moss'), never as hex, so both themes can render it.
export const swatches = {
  moss: { light: '#4C7B48', dark: '#8DBF88' },
  teal: { light: '#1F7A7A', dark: '#6CC7C7' },
  sky: { light: '#2F74B5', dark: '#82B8EC' },
  indigo: { light: '#4B55B8', dark: '#9AA2F0' },
  plum: { light: '#8A4A9E', dark: '#CE9BE0' },
  rose: { light: '#B5476A', dark: '#EE94B0' },
  brick: { light: '#B04A32', dark: '#EE9580' },
  amber: { light: '#9A6508', dark: '#E3B25C' },
  olive: { light: '#6B6F1E', dark: '#BFC46E' },
  slate: { light: '#55606E', dark: '#A3AEBC' },
} as const;
export type SwatchKey = keyof typeof swatches;

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const hairline = 1; // use StyleSheet.hairlineWidth for list separators only

export const elevation = {
  none: {},
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  float: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;
// card: optional on cards over bg in light theme. float: FAB, sheets, snackbar, drag-lifted item.
// In dark theme use borders only; shadows are not visible and are omitted (see `theme.elevation`).

export const motion = {
  duration: { instant: 90, fast: 160, base: 240, slow: 360 },
  spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 320 } },
  // easing: standard = cubic-bezier(0.2, 0, 0, 1); exit = cubic-bezier(0.4, 0, 1, 1)
  easing: { standard: [0.2, 0, 0, 1], exit: [0.4, 0, 1, 1] },
} as const;

export const layout = {
  screenPadding: 20,
  maxContentWidth: 640,
  tabBarHeight: 56,
  rowMinHeight: 52,
  touchMin: 44,
  fabSize: 56,
  tabletBreakpoint: 768,
} as const;

/**
 * Component dimensions from doc 02 section 2.6 that are not spacing. Kept here so that no component
 * or screen carries a bare size number.
 */
export const controls = {
  buttonHeight: { lg: 52, md: 44, sm: 36 },
  inputHeight: 52,
  chipHeight: 32,
  segmentedHeight: 36,
  checkbox: { default: 22, subtask: 18, ring: 2 },
  iconSize: { chip: 16, row: 20, bar: 22, emptyState: 48 },
  iconStroke: 1.75,
  grabber: { width: 36, height: 4 },
  dialogMaxWidth: 320,
  avatar: { sm: 32, lg: 64 },
  progressRing: { xs: 20, sm: 40, md: 72, lg: 120 },
  progressBarHeight: 6,
  badgeDot: 8,
  focusBorder: 1.5,
  disabledOpacity: 0.4,
  pressedOpacity: 0.85,
  /** Sheet snap points as a share of the screen height. */
  sheetSnap: { compact: '40%', tall: '85%' },
  snackbarDuration: 5000,
  skeletonPulse: 1200,
  skeletonLow: 0.6,
  shakeDistance: 6,
} as const;

/** Font families as registered with expo-font (see `fonts.ts`). */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  display: 'InstrumentSerif_400Regular',
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

export type TypographyVariant = {
  family: FontFamilyKey;
  size: number;
  lineHeight: number;
  letterSpacing?: number;
  uppercase?: boolean;
  tabular?: boolean;
  /** Upper bound for OS font scaling (doc 02 section 2.3). */
  maxFontSizeMultiplier: number;
};

export const typography = {
  display: { family: 'display', size: 34, lineHeight: 40, maxFontSizeMultiplier: 1.4 },
  title1: { family: 'semibold', size: 24, lineHeight: 30, maxFontSizeMultiplier: 2 },
  title2: { family: 'semibold', size: 20, lineHeight: 26, maxFontSizeMultiplier: 2 },
  title3: { family: 'semibold', size: 17, lineHeight: 24, maxFontSizeMultiplier: 2 },
  body: { family: 'regular', size: 16, lineHeight: 24, maxFontSizeMultiplier: 2 },
  bodyStrong: { family: 'medium', size: 16, lineHeight: 24, maxFontSizeMultiplier: 2 },
  callout: { family: 'regular', size: 14, lineHeight: 20, maxFontSizeMultiplier: 2 },
  caption: { family: 'regular', size: 13, lineHeight: 18, maxFontSizeMultiplier: 2 },
  overline: {
    family: 'semibold',
    size: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    uppercase: true,
    maxFontSizeMultiplier: 2,
  },
  stat: {
    family: 'semibold',
    size: 28,
    lineHeight: 32,
    tabular: true,
    maxFontSizeMultiplier: 2,
  },
  // Empty-state titles use Instrument Serif at 24 (doc 02 section 2.6, `EmptyState`).
  emptyTitle: { family: 'display', size: 24, lineHeight: 30, maxFontSizeMultiplier: 1.4 },
} as const satisfies Record<string, TypographyVariant>;

export type TextVariant = keyof typeof typography;
