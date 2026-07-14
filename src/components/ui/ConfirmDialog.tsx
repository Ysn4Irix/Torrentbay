import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View
        className="flex-1 items-center justify-center px-5"
        style={{ backgroundColor: colors.scrim }}
      >
        <Pressable
          accessibilityLabel="Dismiss dialog"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={onCancel}
        />
        <View
          accessibilityRole="alert"
          accessible
          className="w-full max-w-[420px] rounded-xl border border-border bg-surface-elevated p-5"
        >
          <Text variant="h2">{title}</Text>
          <Text className="mt-3 text-content-secondary">{message}</Text>
          <View className="mt-5 flex-row gap-3">
            <Button
              className="flex-1"
              label={cancelLabel}
              onPress={onCancel}
              variant="secondary"
            />
            <Button
              className="flex-1"
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'destructive' : 'primary'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
