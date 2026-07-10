import { type Href, Link } from 'expo-router';
import { Clock3, Heart, Home, Search, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { cn } from '@/utils/cn';

type ShortcutKey = 'home' | 'search' | 'history' | 'favorites' | 'settings';

type BottomShortcutsProps = {
  active: ShortcutKey;
};

const shortcuts = [
  { key: 'home', label: 'Home', href: '/home', Icon: Home, a11y: 'Open Home' },
  {
    key: 'search',
    label: 'Search',
    href: '/search',
    Icon: Search,
    a11y: 'Open Search',
  },
  {
    key: 'favorites',
    label: 'Favorites',
    href: '/favorites',
    Icon: Heart,
    a11y: 'Open Favorites',
  },
  {
    key: 'history',
    label: 'History',
    href: '/history' as Href,
    Icon: Clock3,
    a11y: 'Open History',
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    Icon: Settings,
    a11y: 'Open Settings',
  },
] as const;

export function BottomShortcuts({ active }: BottomShortcutsProps) {
  return (
    <View className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between rounded-3xl border border-border bg-background/95 px-2 py-2 shadow-lg shadow-black">
      {shortcuts.map(({ key, label, href, Icon, a11y }) => {
        const selected = active === key;

        return (
          <Link asChild href={href} key={key}>
            <Pressable
              accessibilityLabel={a11y}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={cn(
                'min-h-14 flex-1 items-center justify-center rounded-2xl',
                selected ? 'bg-primary/20' : 'active:bg-surfaceElevated',
              )}
            >
              <Icon
                color={selected ? colors.primarySoft : colors.muted}
                size={20}
              />
              <Text
                className={cn(
                  'mt-1 text-[11px] font-semibold',
                  selected ? 'text-primary' : 'text-muted',
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
