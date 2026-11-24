import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/design/ThemeProvider';
import { useReduceMotion } from '@/design/useReduceMotion';
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
 * Needs <GestureHandlerRootView> and <BottomSheetModalProvider> above it (set up in the root layout).
 * The Android back button closes the sheet before anything else pops (doc 04 section 4.12).
 */
export function Sheet({ visible, onClose, title, snapPoints, children, testID }: SheetProps) {
  const { colors, controls, radius, space, motion, elevation } = useTheme();
  const ref = useRef<BottomSheetModal>(null);
  const reduceMotion = useReduceMotion();

  // Spring from the bottom normally; a short cross-fade-like timing when Reduce motion is on.
  const spring = useBottomSheetSpringConfigs(motion.spring.gentle);
  const timing = useBottomSheetTimingConfigs({ duration: motion.duration.fast });

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

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

  return (
    <BottomSheetModal
      ref={ref}
      {...(snapPoints ? { snapPoints, enableDynamicSizing: false } : { enableDynamicSizing: true })}
      onDismiss={onClose}
      enablePanDownToClose
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
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleArea: { alignItems: 'center' },
});
