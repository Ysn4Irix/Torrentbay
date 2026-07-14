import { ScrollView } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { getVisibleSearchCategories } from '@/features/search/constants';
import { TorrentCategory } from '@/models/torrent';
import { cn } from '@/utils/cn';

type CategoryGridProps = {
  selected: TorrentCategory;
  onSelect: (category: TorrentCategory) => void;
  showMatureCategories?: boolean;
  className?: string;
  contentContainerClassName?: string;
};

export function CategoryGrid({
  selected,
  onSelect,
  showMatureCategories = false,
  className,
  contentContainerClassName,
}: CategoryGridProps) {
  const categories = getVisibleSearchCategories(showMatureCategories);

  return (
    <ScrollView
      className={cn('h-11', className)}
      contentContainerClassName={cn(
        'items-center gap-2 pr-5',
        contentContainerClassName,
      )}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => (
        <Chip
          accessibilityLabel={`Search ${category.label} torrents`}
          className="h-11 flex-none self-center"
          hitSlop={{ bottom: 2, top: 2, left: 4, right: 4 }}
          key={category.value}
          label={category.label}
          onPress={() => onSelect(category.value)}
          selected={category.value === selected}
        />
      ))}
    </ScrollView>
  );
}
