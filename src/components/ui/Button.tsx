import { ComponentRef, forwardRef } from 'react';
import { Pressable, PressableProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/utils/cn';

type ButtonProps = PressableProps & {
  label: string;
  className?: string;
};

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(
  function Button({ label, className, disabled, ...props }, ref) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        className={cn(
          'min-h-12 items-center justify-center rounded-2xl bg-primary px-5 py-3',
          disabled ? 'opacity-50' : 'active:opacity-80',
          className,
        )}
        disabled={disabled}
        {...props}
      >
        <Text className="font-semibold text-foreground">{label}</Text>
      </Pressable>
    );
  },
);
