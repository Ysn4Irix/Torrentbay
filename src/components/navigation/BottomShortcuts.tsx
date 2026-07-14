import { Link } from 'expo-router';
import { Bookmark, Search, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { cn } from '@/utils/cn';

type ShortcutKey = 'home' | 'favorites' | 'settings';

type BottomShortcutsProps = {
  active: ShortcutKey;
};

const shortcuts = [
  {
    key: 'home',
    label: 'Home',
    href: '/home',
    Icon: Search,
  },
  {
    key: 'favorites',
    label: 'Favorites',
    href: '/favorites',
    Icon: Bookmark,
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    Icon: Settings,
  },
] as const;

export function BottomShortcuts({ active }: BottomShortcutsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4 flex-row items-center justify-between rounded-lg border border-border bg-surface/95 px-2 py-2 shadow-sm shadow-black/20"
      style={{ bottom: Math.max(insets.bottom, 16) }}
    >
      {shortcuts.map(({ key, label, href, Icon }) => {
        const selected = active === key;

        return (
          <Link asChild href={href} key={key}>
            <Pressable
              accessibilityLabel={
                selected ? `${label}, current tab` : `Open ${label}`
              }
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={cn(
                'min-h-14 flex-1 items-center justify-center rounded-2xl',
                selected ? 'bg-primary-soft' : 'active:bg-surface-elevated',
              )}
            >
              <Icon
                color={selected ? colors.primary : colors.textMuted}
                size={20}
              />
              <Text
                className={cn(
                  'mt-1 text-[11px] font-semibold',
                  selected ? 'text-primary' : 'text-content-muted',
                )}
              >
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
