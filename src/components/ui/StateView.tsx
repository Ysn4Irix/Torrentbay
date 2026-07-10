import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { cn } from '@/utils/cn';

type StateViewProps = {
  title: string;
  message?: string;
  className?: string;
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

export function EmptyState({ title, message, className }: StateViewProps) {
  return (
    <StateShell className={className}>
      <Inbox color={colors.muted} size={28} />
      <Text className="mt-3 text-center font-semibold">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-muted">{message}</Text>
      ) : null}
    </StateShell>
  );
}

export function ErrorState({ title, message, className }: StateViewProps) {
  return (
    <StateShell className={className}>
      <AlertCircle color={colors.danger} size={28} />
      <Text className="mt-3 text-center font-semibold">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-muted">{message}</Text>
      ) : null}
    </StateShell>
  );
}
