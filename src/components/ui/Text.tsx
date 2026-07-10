import { Text as NativeText, TextProps as NativeTextProps } from 'react-native';

import { cn } from '@/utils/cn';

type TextProps = NativeTextProps & {
  className?: string;
};

export function Text({ className, ...props }: TextProps) {
  return (
    <NativeText
      className={cn('text-base text-foreground', className)}
      {...props}
    />
  );
}
