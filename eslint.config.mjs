import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import expo from 'eslint-config-expo/flat.js';

const HEX_COLOUR = '^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$';

const HEX_RULE = {
  selector: `Literal[value=/${HEX_COLOUR}/]`,
  message: 'No hex colours in screen code. Use theme tokens from src/design.',
};

/**
 * Styling numbers belong in the tokens (CLAUDE.md rule 5): font sizes, spacing and durations in
 * screen code come from `useTheme()`. Zero is allowed. Component primitives in components/ui are
 * exempt because they implement the tokens; they still may not contain hex colours.
 */
const STYLE_KEYS =
  '^(fontSize|lineHeight|letterSpacing|gap|rowGap|columnGap|duration|border(Top|Bottom|Left|Right)?(Start|End)?(Width|Radius)|(padding|margin)(Top|Bottom|Left|Right|Start|End|Horizontal|Vertical)?)$';
const NUMBER_RULE = {
  selector: `Property[key.name=/${STYLE_KEYS}/] > Literal[value=type(number)]:not([value=0])`,
  message:
    'No raw font sizes, spacing or durations in screen code. Use tokens: theme.space, theme.radius, theme.typography, theme.motion.',
};

/** CLAUDE.md rule 5 for screen code: no hex colours and no raw styling numbers. */
const tokensOnly = ['error', HEX_RULE, NUMBER_RULE];
/** For the primitives themselves: hex colours stay banned, sizes are theirs to define. */
const noHexColours = ['error', HEX_RULE];

/** Shared import-restriction building blocks (merged per folder below). */
const SQLITE = {
  name: 'expo-sqlite',
  message: 'Only src/data may use SQLite. Go through a repository or a query hook.',
};
const DRIZZLE = {
  group: ['drizzle-orm', 'drizzle-orm/*'],
  message: 'Only src/data may use Drizzle. Go through a repository or a query hook.',
};
const SUPABASE = {
  group: ['@supabase/supabase-js'],
  message: 'Screens and features never call Supabase tables directly (CLAUDE.md rule 1).',
};
const FEATURES_UP = {
  group: ['@/features', '@/features/*', '@/features/**'],
  message: 'Shared UI, services and lib must not import from features. Move shared pieces down.',
};
const COMPONENTS_UP = {
  group: ['@/components', '@/components/*', '@/components/**'],
  message: 'Services and lib sit below components.',
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/coverage/**',
      'packages/mobile/ios/**',
      'packages/mobile/android/**',
      'supabase/.temp/**',
      'docs/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Mobile app: Expo's rules (react, react-hooks, import resolution) on top of the base set.
  ...expo.map((config) => ({ ...config, files: ['packages/mobile/**/*.{js,jsx,ts,tsx}'] })),

  // Let the import plugin resolve the "@/..." alias exactly as TypeScript does.
  {
    files: ['packages/mobile/**/*.{js,jsx,ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: { project: 'packages/mobile/tsconfig.json' },
        node: true,
      },
    },
  },

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Config files run in Node.
  {
    files: ['**/*.config.{js,mjs,cjs,ts}', 'packages/mobile/metro.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },

  // packages/shared is platform-neutral: shared with Edge Functions (Deno) and the app (doc 04 4.3).
  {
    files: ['packages/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-native', 'react-native/*', 'expo', 'expo-*', '@expo/*'],
              message: 'packages/shared must not depend on React, React Native or Expo.',
            },
            {
              group: ['node:*', 'fs', 'path', 'child_process', 'crypto'],
              message: 'packages/shared must not use Node-specific modules (it also runs on Deno).',
            },
          ],
        },
      ],
    },
  },

  // Layering inside the app (doc 04 4.3): app/ -> features/ -> components, data, services -> shared.
  // ESLint keeps ONE no-restricted-imports config per file, so each folder gets a single merged rule.
  {
    files: ['packages/mobile/src/design/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [FEATURES_UP] }] },
  },
  {
    files: ['packages/mobile/src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [SQLITE], patterns: [FEATURES_UP, DRIZZLE, SUPABASE] },
      ],
    },
  },
  {
    // services hosts the Supabase client, so it may import supabase-js.
    files: ['packages/mobile/src/services/**/*.{ts,tsx}', 'packages/mobile/src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [SQLITE], patterns: [FEATURES_UP, COMPONENTS_UP, DRIZZLE] },
      ],
    },
  },
  {
    // Only the data layer may touch SQLite / Drizzle directly (CLAUDE.md rule 1: one write path).
    files: ['packages/mobile/app/**/*.{ts,tsx}', 'packages/mobile/src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [SQLITE], patterns: [DRIZZLE, SUPABASE] }],
    },
  },

  // Tokens only in screen code.
  {
    files: [
      'packages/mobile/app/**/*.{ts,tsx}',
      'packages/mobile/src/components/**/*.{ts,tsx}',
      'packages/mobile/src/features/**/*.{ts,tsx}',
    ],
    ignores: ['packages/mobile/src/components/ui/**'],
    rules: { 'no-restricted-syntax': tokensOnly },
  },
  {
    files: ['packages/mobile/src/components/ui/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': noHexColours },
  },

  // Tests may use jest globals.
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.jest } },
  },

  // Must be last: turns off rules that conflict with Prettier.
  prettier,
);
