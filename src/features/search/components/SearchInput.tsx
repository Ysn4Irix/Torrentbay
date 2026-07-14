import { ArrowRight, Search, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { cn } from '@/utils/cn';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  autoFocus?: boolean;
  loading?: boolean;
  showSubmitButton?: boolean;
  variant?: 'standard' | 'compact';
};

export function SearchInput({
  value,
  onChangeText,
  onClear,
  onSubmit,
  label = 'Search torrents',
  labelClassName,
  placeholder = 'Search torrents',
  autoFocus = false,
  loading = false,
  showSubmitButton = true,
  variant = 'standard',
}: SearchInputProps) {
  const canSubmit = value.trim().length > 0;
  const isSubmitDisabled = !canSubmit || loading;
  const isCompact = variant === 'compact';

  return (
    <View>
      {!isCompact ? (
        <Text
          className={cn(
            'mb-2 text-sm font-semibold text-content-secondary',
            labelClassName,
          )}
        >
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center rounded-md border border-border bg-surface-elevated',
          isCompact ? 'min-h-12 pl-3 pr-1' : 'min-h-14 pl-4 pr-1',
        )}
      >
        <Search color={colors.primary} size={isCompact ? 18 : 20} />
        <TextInput
          accessibilityLabel={label}
          accessibilityHint="Enter a keyword, then use the search key or submit button to search."
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          className={cn(
            'min-h-12 flex-1 px-3 text-content-primary',
            isCompact ? 'text-[15px]' : 'text-base',
          )}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          value={value}
        />
        {value.length > 0 ? (
          <IconButton
            accessibilityLabel="Clear search input"
            className="border-transparent bg-transparent"
            onPress={onClear}
          >
            <X color={colors.textMuted} size={20} />
          </IconButton>
        ) : null}
        {showSubmitButton ? (
          <Pressable
            accessibilityLabel={
              canSubmit ? `Search for ${value.trim()}` : 'Submit search'
            }
            accessibilityRole="button"
            accessibilityState={{ busy: loading, disabled: isSubmitDisabled }}
            className={cn(
              'ml-1 items-center justify-center rounded-md bg-primary',
              isCompact ? 'h-10 w-10' : 'h-12 w-12',
              !isSubmitDisabled
                ? 'active:bg-primary-pressed active:opacity-85'
                : 'opacity-50',
            )}
            disabled={isSubmitDisabled}
            hitSlop={
              isCompact ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined
            }
            onPress={onSubmit}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <ArrowRight
                color={colors.background}
                size={isCompact ? 18 : 20}
              />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
