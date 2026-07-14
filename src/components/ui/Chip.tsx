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
    {
      label,
      selected = false,
      className,
      disabled,
      accessibilityLabel,
      accessibilityState,
      hitSlop = { top: 4, bottom: 4, left: 4, right: 4 },
      ...props
    },
    ref,
  ) {
    return (
      <Pressable
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{
          ...accessibilityState,
          disabled: disabled || accessibilityState?.disabled,
          selected,
        }}
        className={cn(
          'h-10 min-w-12 items-center justify-center self-start rounded-sm border px-4 py-0',
          selected
            ? 'border-primary bg-primary-soft'
            : 'border-border bg-surface-muted',
          disabled ? 'opacity-50' : 'active:opacity-85',
          className,
        )}
        disabled={disabled}
        hitSlop={hitSlop}
        {...props}
      >
        <Text
          className={cn(
            'text-center text-sm font-semibold',
            selected ? 'text-primary' : 'text-content-secondary',
          )}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    );
  },
);
