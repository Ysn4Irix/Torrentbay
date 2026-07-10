import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

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
  placeholder?: string;
  autoFocus?: boolean;
  showSubmitButton?: boolean;
};

export function SearchInput({
  value,
  onChangeText,
  onClear,
  onSubmit,
  label = 'Search torrents',
  placeholder = 'Movies, Linux ISOs, apps...',
  autoFocus = false,
  showSubmitButton = true,
}: SearchInputProps) {
  const canSubmit = value.trim().length > 0;

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-muted">{label}</Text>
      <View className="min-h-14 flex-row items-center rounded-3xl border border-border bg-surfaceElevated px-4">
        <Search color={colors.primarySoft} size={20} />
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          className="min-h-12 flex-1 px-3 text-base text-foreground"
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          value={value}
        />
        {value.length > 0 ? (
          <IconButton
            accessibilityLabel="Clear search input"
            className="min-h-11 min-w-11 border-transparent bg-transparent"
            onPress={onClear}
          >
            <X color={colors.muted} size={20} />
          </IconButton>
        ) : null}
        {showSubmitButton ? (
          <Pressable
            accessibilityLabel="Submit search"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className={cn(
              'ml-2 h-11 w-11 items-center justify-center rounded-2xl bg-primary',
              canSubmit ? 'active:opacity-80' : 'opacity-50',
            )}
            disabled={!canSubmit}
            onPress={onSubmit}
          >
            <Search color={colors.foreground} size={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
