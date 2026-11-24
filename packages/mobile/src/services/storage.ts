import { createMMKV } from 'react-native-mmkv';

/**
 * Small synchronous key-value store for non-secret preferences (theme, flags). Secrets never go here
 * (they use expo-secure-store, doc 04 section 4.4). Synchronous reads let the theme resolve before the
 * first frame, so there is no flash of the wrong scheme.
 */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  setString(key: string, value: string): void;
  getBoolean(key: string): boolean | undefined;
  setBoolean(key: string, value: boolean): void;
  remove(key: string): void;
}

function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string | boolean>();
  return {
    getString: (key) => {
      const value = map.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    setString: (key, value) => void map.set(key, value),
    getBoolean: (key) => {
      const value = map.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    setBoolean: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  };
}

function createStore(): KeyValueStore {
  try {
    const mmkv = createMMKV({ id: 'preferences' });
    return {
      getString: (key) => mmkv.getString(key),
      setString: (key, value) => mmkv.set(key, value),
      getBoolean: (key) => mmkv.getBoolean(key),
      setBoolean: (key, value) => mmkv.set(key, value),
      remove: (key) => void mmkv.remove(key),
    };
  } catch (error) {
    // The native module is missing (a development build made before this dependency was added).
    // Preferences then last for the session only instead of crashing the app at start-up.
    console.warn('MMKV is unavailable, preferences will not persist:', error);
    return createMemoryStore();
  }
}

export const storage: KeyValueStore = createStore();
