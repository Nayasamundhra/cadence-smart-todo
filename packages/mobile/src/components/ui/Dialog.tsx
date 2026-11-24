import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';
import { haptics } from '@/services/haptics';
import { Button } from './Button';
import { Text } from './Text';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Destructive confirmations use the danger button and a warning haptic. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Centred dialog, for destructive confirmation only; everything else is a sheet (doc 02 section 2.6).
 * The Android back button and tapping the overlay both cancel.
 */
export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: DialogProps) {
  const { colors, controls, radius, space, elevation, layout } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={[styles.root, { padding: layout.screenPadding }]}>
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onCancel}
        />
        <View
          accessibilityViewIsModal
          style={[
            {
              width: '100%',
              maxWidth: controls.dialogMaxWidth,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: space[5],
              gap: space[3],
            },
            elevation.float,
          ]}
        >
          <Text variant="title3" accessibilityRole="header">
            {title}
          </Text>
          {message ? (
            <Text variant="callout" color="textSecondary">
              {message}
            </Text>
          ) : null}
          <View style={[styles.actions, { gap: space[2], marginTop: space[2] }]}>
            <View style={styles.action}>
              <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
            </View>
            <View style={styles.action}>
              <Button
                label={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                onPress={() => {
                  if (destructive) haptics.warning();
                  onConfirm();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row' },
  action: { flex: 1 },
});
