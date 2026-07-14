import { ComponentRef, forwardRef, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

type ButtonProps = PressableProps & {
  label: string;
  className?: string;
  loading?: boolean;
  leftIcon?: ReactNode;
  variant?: ButtonVariant;
};

const buttonClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  secondary: 'border border-border bg-surface-muted active:bg-surface-elevated',
  destructive: 'bg-error active:opacity-80',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-background',
  secondary: 'text-content-primary',
  destructive: 'text-background',
};

const indicatorColor: Record<ButtonVariant, string> = {
  primary: colors.background,
  secondary: colors.textPrimary,
  destructive: colors.background,
};

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(
  function Button(
    {
      label,
      className,
      disabled,
      loading = false,
      leftIcon,
      variant = 'primary',
      accessibilityLabel,
      accessibilityState,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <Pressable
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{
          ...accessibilityState,
          busy: loading || accessibilityState?.busy,
          disabled: isDisabled || accessibilityState?.disabled,
        }}
        className={cn(
          'min-h-[52px] flex-row items-center justify-center gap-2 rounded-md px-5 py-3',
          buttonClasses[variant],
          isDisabled ? 'opacity-50' : 'active:opacity-85',
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={indicatorColor[variant]} size="small" />
        ) : leftIcon ? (
          <View>{leftIcon}</View>
        ) : null}
        <Text className={cn('font-semibold', labelClasses[variant])}>
          {label}
        </Text>
      </Pressable>
    );
  },
);
