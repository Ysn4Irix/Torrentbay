import { ComponentRef, forwardRef, ReactNode } from 'react';
import { Pressable, PressableProps } from 'react-native';

import { cn } from '@/utils/cn';

type IconButtonProps = PressableProps & {
  accessibilityLabel: string;
  children: ReactNode;
  className?: string;
};

export const IconButton = forwardRef<
  ComponentRef<typeof Pressable>,
  IconButtonProps
>(function IconButton(
  { accessibilityLabel, children, className, disabled, ...props },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled ?? undefined }}
      className={cn(
        'min-h-12 min-w-12 items-center justify-center rounded-full border border-border bg-surfaceElevated',
        disabled ? 'opacity-50' : 'active:opacity-80',
        className,
      )}
      disabled={disabled}
      hitSlop={4}
      {...props}
    >
      {children}
    </Pressable>
  );
});
