import Constants from 'expo-constants';

/**
 * The product name is not final. UI copy, notifications and prompts must use this
 * constant and never a literal string. The value comes from app.config.ts.
 */
export const APP_NAME: string =
  typeof Constants.expoConfig?.extra?.appName === 'string'
    ? Constants.expoConfig.extra.appName
    : 'Cadence';
