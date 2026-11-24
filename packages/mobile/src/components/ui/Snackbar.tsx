import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design/ThemeProvider';
import { useReduceMotion } from '@/design/useReduceMotion';
import { Text } from './Text';

export interface SnackbarMessage {
  message: string;
  /** One action only, e.g. "Undo". */
  actionLabel?: string;
  onAction?: () => void;
}

/** Presentational snackbar (text plus one action). Use `useSnackbar().show` in screens. */
export function Snackbar({
  message,
  actionLabel,
  onAction,
  bottomOffset,
}: SnackbarMessage & { bottomOffset: number }) {
  const { colors, layout, radius, space, elevation, motion } = useTheme();
  const reduceMotion = useReduceMotion();
  const [appear] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [appear, motion.duration.fast]);

  const rise = reduceMotion ? 0 : space[4];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: bottomOffset,
          paddingHorizontal: layout.screenPadding,
          opacity: appear,
          transform: [
            { translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) },
          ],
        },
      ]}
    >
      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.bar,
          {
            maxWidth: layout.maxContentWidth,
            backgroundColor: colors.text,
            borderRadius: radius.md,
            paddingLeft: space[4],
            paddingRight: actionLabel ? space[2] : space[4],
            minHeight: layout.touchMin,
            gap: space[2],
          },
          elevation.float,
        ]}
      >
        {/* The bar is inverted (text colour as fill), so its label uses the page colour. */}
        <Text variant="callout" style={styles.message} color="bg">
          {message}
        </Text>
        {actionLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onAction}
            style={[styles.action, { minHeight: layout.touchMin, paddingHorizontal: space[3] }]}
          >
            <Text variant="bodyStrong" color="accentSoft">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

interface SnackbarContextValue {
  /** Shows a snackbar. A new one replaces the current one (one at a time). */
  show: (message: SnackbarMessage) => void;
  dismiss: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({
  children,
  withTabBar = true,
}: {
  children: ReactNode;
  /** Floats above the tab bar (default). Set false for screens without one. */
  withTabBar?: boolean;
}) {
  const { controls, layout, space } = useTheme();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<(SnackbarMessage & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setCurrent(null);
  }, [clearTimer]);

  const show = useCallback(
    (message: SnackbarMessage) => {
      clearTimer();
      counter.current += 1;
      setCurrent({ ...message, id: counter.current });
      AccessibilityInfo.announceForAccessibility(message.message);
      timer.current = setTimeout(dismiss, controls.snackbarDuration);
    },
    [clearTimer, dismiss, controls.snackbarDuration],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  const bottomOffset = insets.bottom + (withTabBar ? layout.tabBarHeight : 0) + space[3];

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {current ? (
        <Snackbar
          key={current.id}
          message={current.message}
          actionLabel={current.actionLabel}
          bottomOffset={bottomOffset}
          onAction={() => {
            current.onAction?.();
            dismiss();
          }}
        />
      ) : null}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used inside <SnackbarProvider>.');
  return context;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  message: { flex: 1 },
  action: { alignItems: 'center', justifyContent: 'center' },
});
