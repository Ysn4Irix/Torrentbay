import { AlertCircle, LoaderCircle } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { cn } from '@/utils/cn';

type StateViewProps = {
  title: string;
  message?: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
};

function StateShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'items-center rounded-3xl border border-border bg-surface p-6',
        className,
      )}
    >
      {children}
    </View>
  );
}

function SadMagnifierIllustration() {
  return (
    <View className="h-44 w-48 items-center justify-center">
      <View className="absolute bottom-4 h-8 w-40 rounded-full bg-primary opacity-15" />
      <Svg height="168" viewBox="0 0 190 168" width="190">
        <Circle
          cx="82"
          cy="76"
          fill={`${colors.primary}26`}
          r="48"
          stroke={colors.primarySoft}
          strokeWidth="8"
        />
        <Path
          d="M51 67c6-16 20-27 37-28"
          stroke={colors.foreground}
          strokeLinecap="round"
          strokeWidth="4"
          opacity="0.55"
        />
        <Line
          stroke={colors.primarySoft}
          strokeLinecap="round"
          strokeWidth="14"
          x1="118"
          x2="154"
          y1="111"
          y2="147"
        />
        <Circle cx="66" cy="78" fill={colors.primarySoft} r="4" />
        <Circle cx="97" cy="78" fill={colors.primarySoft} r="4" />
        <Path
          d="M66 101c10-10 22-10 32 0"
          stroke={colors.primarySoft}
          strokeLinecap="round"
          strokeWidth="5"
        />
        <Circle cx="28" cy="70" fill={colors.primarySoft} r="2" />
        <Circle cx="147" cy="62" fill={colors.primarySoft} r="2" />
        <Path
          d="M37 42l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"
          fill={colors.primarySoft}
        />
        <Path
          d="M138 28l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"
          fill={colors.foreground}
          opacity="0.7"
        />
      </Svg>
    </View>
  );
}

export function LoadingState({ title, message, className }: StateViewProps) {
  return (
    <StateShell className={className}>
      <LoaderCircle color={colors.primary} size={28} />
      <Text className="mt-3 text-center font-semibold">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-muted">{message}</Text>
      ) : null}
    </StateShell>
  );
}

export function EmptyState({
  title,
  message,
  className,
  actionLabel,
  onAction,
}: StateViewProps) {
  return (
    <StateShell className={className}>
      <SadMagnifierIllustration />
      <Text className="mt-2 text-center text-lg font-semibold">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-muted">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" label={actionLabel} onPress={onAction} />
      ) : null}
    </StateShell>
  );
}

export function ErrorState({
  title,
  message,
  className,
  actionLabel,
  onAction,
}: StateViewProps) {
  return (
    <StateShell className={className}>
      <AlertCircle color={colors.danger} size={28} />
      <Text className="mt-3 text-center font-semibold">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-muted">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" label={actionLabel} onPress={onAction} />
      ) : null}
    </StateShell>
  );
}
