import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';

const ENTER_DURATION_MS = 180;
const EXIT_DURATION_MS = 160;
const snackbarEntering = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: 10 }, { scale: 0.98 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
}).duration(ENTER_DURATION_MS);
const snackbarExiting = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  100: {
    opacity: 0,
    transform: [{ translateY: 10 }, { scale: 0.98 }],
  },
}).duration(EXIT_DURATION_MS);

type SnackbarProps = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  durationMs?: number;
  bottomOffset?: number;
  onAction?: () => void;
  onDismiss?: () => void;
};

export function Snackbar({
  visible,
  message,
  actionLabel,
  durationMs = 3500,
  bottomOffset = 0,
  onAction,
  onDismiss,
}: SnackbarProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || !onDismiss) {
      return undefined;
    }

    const timeout = setTimeout(onDismiss, durationMs);

    return () => clearTimeout(timeout);
  }, [durationMs, onDismiss, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="absolute left-4 right-4 rounded-lg border border-border bg-surface-elevated px-5 py-4 shadow-sm shadow-black/30"
      entering={snackbarEntering}
      exiting={snackbarExiting}
      pointerEvents={actionLabel && onAction ? 'box-none' : 'none'}
      style={{
        bottom: Math.max(insets.bottom, 24) + bottomOffset,
      }}
    >
      <View className="flex-row items-center gap-3" pointerEvents="box-none">
        <Text className="flex-1 text-content-primary">{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            className="min-h-10 min-w-12 items-center justify-center rounded-md px-3 active:bg-primary-soft active:opacity-85"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            onPress={onAction}
          >
            <Text className="font-semibold text-primary">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
