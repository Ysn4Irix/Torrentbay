import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

type ScreenProps = PropsWithChildren<{
  centered?: boolean;
  className?: string;
}>;

export function Screen({ centered = false, children, className }: ScreenProps) {
  if (centered) {
    return (
      <SafeAreaView className={cn('flex-1 bg-background', className)}>
        <View className="flex-1 items-center justify-center px-6">
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)}>
      <ScrollView
        contentContainerClassName="px-5 py-6"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
