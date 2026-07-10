import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

type ScreenProps = PropsWithChildren<{
  centered?: boolean;
  className?: string;
  contentClassName?: string;
  scroll?: boolean;
}>;

export function Screen({
  centered = false,
  children,
  className,
  contentClassName,
  scroll = true,
}: ScreenProps) {
  if (centered) {
    return (
      <SafeAreaView className={cn('flex-1 bg-background', className)}>
        <View
          className={cn(
            'flex-1 items-center justify-center px-6',
            contentClassName,
          )}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }

  if (!scroll) {
    return (
      <SafeAreaView className={cn('flex-1 bg-background', className)}>
        <View className={cn('flex-1 px-5 py-6', contentClassName)}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)}>
      <ScrollView
        contentContainerClassName={cn('px-5 py-6', contentClassName)}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
