import {
  AppWindow,
  BookOpen,
  CircleEllipsis,
  Clapperboard,
  Gamepad2,
  Music,
  ShieldAlert,
  Sparkles,
  Tv,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { SEARCH_CATEGORIES } from '@/features/search/constants';
import { TorrentCategory } from '@/models/torrent';
import { cn } from '@/utils/cn';

type CategoryGridProps = {
  selected: TorrentCategory;
  onSelect: (category: TorrentCategory) => void;
};

const categoryIcons = {
  movies: Clapperboard,
  tv_shows: Tv,
  games: Gamepad2,
  music: Music,
  applications: AppWindow,
  anime: Sparkles,
  ebooks: BookOpen,
  other: CircleEllipsis,
  adult: ShieldAlert,
} satisfies Partial<Record<TorrentCategory, typeof Clapperboard>>;

const categoryAccents = {
  movies: '#A855F7',
  tv_shows: '#8B5CF6',
  games: '#FB923C',
  music: '#EC4899',
  applications: '#4ADE80',
  anime: '#F59E0B',
  ebooks: '#60A5FA',
  other: '#A78BFA',
  adult: '#F472B6',
} satisfies Partial<Record<TorrentCategory, string>>;

export function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
  const categories = SEARCH_CATEGORIES.filter(
    (category) => category.value !== 'all',
  );

  return (
    <View className="flex-row flex-wrap gap-2.5">
      {categories.map((category) => {
        const isSelected = category.value === selected;
        const Icon = categoryIcons[category.value];
        const accent = categoryAccents[category.value] ?? colors.primarySoft;

        return (
          <Pressable
            accessibilityLabel={`Search ${category.label} torrents`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'min-h-20 w-[31%] items-center justify-center rounded-2xl border px-2 py-3 active:opacity-85',
              isSelected
                ? 'border-primary bg-primary/25'
                : 'border-border bg-surfaceElevated',
            )}
            key={category.value}
            onPress={() => onSelect(category.value)}
          >
            <View
              className="mb-2 h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isSelected ? colors.primary : `${accent}20`,
              }}
            >
              {Icon ? (
                <Icon
                  color={isSelected ? colors.foreground : accent}
                  size={21}
                  strokeWidth={2.3}
                />
              ) : null}
            </View>
            <Text
              className="text-center text-xs font-semibold text-foreground"
              numberOfLines={2}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
