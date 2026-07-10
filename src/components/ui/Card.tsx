import { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '@/utils/cn';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-3xl border border-border bg-surface p-5 shadow-lg shadow-black',
        className,
      )}
    >
      {children}
    </View>
  );
}
