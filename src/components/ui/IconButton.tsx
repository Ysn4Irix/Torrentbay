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
  {
    accessibilityLabel,
    accessibilityState,
    children,
    className,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: disabled || accessibilityState?.disabled,
      }}
      className={cn(
        'h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-muted',
        disabled
          ? 'opacity-50'
          : 'active:bg-surface-elevated active:opacity-85',
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
