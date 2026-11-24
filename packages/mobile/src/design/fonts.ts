import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { fontFamily } from './tokens';

/**
 * Loads Inter (UI) and Instrument Serif (display) from the @expo-google-fonts packages, which are
 * bundled with the app so text never depends on the network. Keys must equal `fontFamily` values.
 */
const fontAssets = {
  [fontFamily.regular]: Inter_400Regular,
  [fontFamily.medium]: Inter_500Medium,
  [fontFamily.semibold]: Inter_600SemiBold,
  [fontFamily.display]: InstrumentSerif_400Regular,
};

/** `[loaded, error]` as returned by expo-font. On error the app renders with the system font. */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts(fontAssets);
}
