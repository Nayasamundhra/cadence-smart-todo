import * as Haptics from 'expo-haptics';
import { storage } from './storage';

/**
 * Haptics are an enhancement only (doc 04 section 4.12): nothing relies on them, failures are
 * swallowed, and the in-app toggle (Settings, later phase) turns them off everywhere.
 */
const ENABLED_KEY = 'haptics.enabled';

export function hapticsEnabled(): boolean {
  return storage.getBoolean(ENABLED_KEY) ?? true;
}

export function setHapticsEnabled(enabled: boolean): void {
  storage.setBoolean(ENABLED_KEY, enabled);
}

function run(action: () => Promise<void>): void {
  if (!hapticsEnabled()) return;
  action().catch(() => undefined);
}

export const haptics = {
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
};
