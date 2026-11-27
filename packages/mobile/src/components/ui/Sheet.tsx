import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard, Modal, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/design/ThemeProvider';
import { useReduceMotion } from '@/design/useReduceMotion';
import { SheetProvider } from './sheetContext';
import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** Fixed snap points (e.g. `['40%', '85%']`). Without them the sheet sizes itself to its content. */
  snapPoints?: (string | number)[];
  children: ReactNode;
  testID?: string;
}

/**
 * Bottom sheet wrapper (doc 02 section 2.6): rounded top corners, grabber, overlay, keyboard-aware.
 *
 * It is a plain @gorhom/bottom-sheet `BottomSheet` inside a React Native `Modal`, not the library's
 * `BottomSheetModal`: on the Android test phone the modal variant never started its animation (its
 * portal host did not render the sheet) while the plain sheet worked. A `Modal` also gives system back
 * handling (`onRequestClose`) and a window of its own, so no provider is needed at the app root.
 * Gestures inside a Modal need their own <GestureHandlerRootView> on Android, hence the wrapper.
 */
/** Current on-screen keyboard height (0 when hidden). Uses the cross-platform Keyboard events. */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

export function Sheet({ visible, onClose, title, snapPoints, children, testID }: SheetProps) {
  const { colors, controls, radius, space, motion, elevation } = useTheme();
  const reduceMotion = useReduceMotion();
  // The library's own keyboard handling does nothing inside a Modal on Android (the keyboard covered
  // the sheet), so the sheet is lifted by the keyboard height explicitly.
  const keyboardHeight = useKeyboardHeight();
  const ref = useRef<BottomSheet>(null);
  // Stays mounted while the close animation runs, then unmounts.
  const [mounted, setMounted] = useState(visible);

  // Spring from the bottom normally; a short timing animation when Reduce motion is on.
  const spring = useBottomSheetSpringConfigs(motion.spring.gentle);
  const timing = useBottomSheetTimingConfigs({ duration: motion.duration.fast });

  // Mount as soon as it is asked to show (state adjusted during render, per React's guidance).
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (!visible) ref.current?.close();
  }, [visible]);

  const handleClosed = useCallback(() => {
    setMounted(false);
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, { backgroundColor: colors.overlay }]}
      />
    ),
    [colors.overlay],
  );

  const renderHandle = useCallback(
    () => (
      <View style={[styles.handleArea, { paddingVertical: space[2] }]}>
        <View
          style={{
            width: controls.grabber.width,
            height: controls.grabber.height,
            borderRadius: radius.full,
            backgroundColor: colors.borderStrong,
          }}
        />
      </View>
    ),
    [colors.borderStrong, controls.grabber, radius.full, space],
  );

  if (!mounted && !visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      // The Android back button closes the sheet before anything else pops (doc 04 section 4.12).
      onRequestClose={() => ref.current?.close()}
    >
      <GestureHandlerRootView style={styles.fill}>
        <BottomSheet
          ref={ref}
          index={0}
          {...(snapPoints
            ? { snapPoints, enableDynamicSizing: false }
            : { enableDynamicSizing: true })}
          enablePanDownToClose
          bottomInset={keyboardHeight}
          onClose={handleClosed}
          backdropComponent={renderBackdrop}
          handleComponent={renderHandle}
          animationConfigs={reduceMotion ? timing : spring}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
            },
            elevation.float,
          ]}
        >
          <BottomSheetView
            testID={testID}
            style={{
              paddingHorizontal: space[5],
              paddingBottom: space[8],
              gap: space[4],
            }}
          >
            {title ? (
              <Text variant="title2" accessibilityRole="header">
                {title}
              </Text>
            ) : null}
            <SheetProvider value>{children}</SheetProvider>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  handleArea: { alignItems: 'center' },
});
