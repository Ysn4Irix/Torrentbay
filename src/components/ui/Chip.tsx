import { ComponentRef, forwardRef } from 'react';
import { Pressable, PressableProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/utils/cn';

type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
  className?: string;
};

export const Chip = forwardRef<ComponentRef<typeof Pressable>, ChipProps>(
  function Chip(
    { label, selected = false, className, disabled, ...props },
    ref,
  ) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled ?? undefined, selected }}
        className={cn(
          'min-h-11 items-center justify-center rounded-full border px-4 py-2',
          selected
            ? 'border-primary bg-primary'
            : 'border-border bg-surfaceElevated',
          disabled ? 'opacity-50' : 'active:opacity-80',
          className,
        )}
        disabled={disabled}
        {...props}
      >
        <Text
          className={cn(
            'text-sm font-semibold',
            selected ? 'text-foreground' : 'text-muted',
          )}
        >
          {label}
        </Text>
      </Pressable>
    );
  },
);
