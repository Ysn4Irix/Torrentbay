import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import {
  SEARCH_CATEGORIES,
  SearchCategoryOption,
} from '@/features/search/constants';
import { TorrentCategory, TorrentSort } from '@/models/torrent';
import { cn } from '@/utils/cn';

type SortField = 'relevance' | 'seeders' | 'leechers' | 'uploaded' | 'size';
type SortDirection = 'desc' | 'asc';

type SearchFilterSheetProps = {
  visible: boolean;
  category: TorrentCategory;
  sort: TorrentSort;
  categories?: SearchCategoryOption[];
  onDismiss: () => void;
  onApply: (filters: { category: TorrentCategory; sort: TorrentSort }) => void;
};

const SORT_FIELDS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'seeders', label: 'Seeders' },
  { value: 'leechers', label: 'Leechers' },
  { value: 'uploaded', label: 'Upload date' },
  { value: 'size', label: 'Size' },
] satisfies { value: SortField; label: string }[];

const SORT_DIRECTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
] satisfies { value: SortDirection; label: string }[];

function getSortDraft(sort: TorrentSort): {
  field: SortField;
  direction: SortDirection;
} {
  if (sort === 'relevance') {
    return { field: 'relevance', direction: 'desc' };
  }

  const [field, direction] = sort.split('_') as [SortField, SortDirection];

  return { field, direction };
}

function buildSort(field: SortField, direction: SortDirection): TorrentSort {
  if (field === 'relevance') {
    return 'relevance';
  }

  return `${field}_${direction}` as TorrentSort;
}

export function SearchFilterSheet({
  visible,
  category,
  sort,
  categories = SEARCH_CATEGORIES,
  onDismiss,
  onApply,
}: SearchFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const [draftCategory, setDraftCategory] = useState<TorrentCategory>(category);
  const [{ field: draftSortField, direction: draftDirection }, setDraftSort] =
    useState(getSortDraft(sort));

  function resetDraft() {
    setDraftCategory('all');
    setDraftSort({ field: 'relevance', direction: 'desc' });
  }

  function applyDraft() {
    onApply({
      category: draftCategory,
      sort: buildSort(draftSortField, draftDirection),
    });
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onDismiss}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Dismiss filters"
          accessibilityRole="button"
          className="absolute inset-0 bg-scrim"
          onPress={onDismiss}
        />
        <View
          className="max-h-[88%] rounded-t-xl border border-border bg-surface-elevated px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="self-center rounded-full bg-surface-muted px-7 py-0.5" />
          <View className="mt-4 flex-row items-center justify-between gap-4">
            <View>
              <Text variant="h2">Filter and sort</Text>
              <Text className="mt-1 text-sm text-content-secondary">
                Changes apply after you confirm.
              </Text>
            </View>
          </View>

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-6 pb-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text className="text-sm font-semibold text-content-secondary">
                Category
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {categories.map((item) => (
                  <Chip
                    accessibilityLabel={`${item.label} category`}
                    key={item.value}
                    className="min-h-10 px-3 py-1"
                    label={item.label}
                    onPress={() => setDraftCategory(item.value)}
                    selected={draftCategory === item.value}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-content-secondary">
                Sort by
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {SORT_FIELDS.map((item) => (
                  <Chip
                    accessibilityLabel={`${item.label} sort field`}
                    key={item.value}
                    className="min-h-10 px-3 py-1"
                    label={item.label}
                    onPress={() =>
                      setDraftSort((current) => ({
                        ...current,
                        field: item.value,
                      }))
                    }
                    selected={draftSortField === item.value}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-content-secondary">
                Sort direction
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {SORT_DIRECTIONS.map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityLabel={`${item.label} sort direction`}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: draftDirection === item.value,
                    }}
                    className={cn(
                      'min-h-10 min-w-28 items-center justify-center rounded-full border px-4 py-2 active:opacity-85',
                      draftDirection === item.value
                        ? 'border-primary bg-primary-soft'
                        : 'border-border bg-surface-muted',
                    )}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    onPress={() =>
                      setDraftSort((current) => ({
                        ...current,
                        direction: item.value,
                      }))
                    }
                  >
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        draftDirection === item.value
                          ? 'text-primary'
                          : 'text-content-secondary',
                      )}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {draftSortField === 'relevance' ? (
                <Text className="mt-2 text-xs text-content-muted">
                  Direction is ignored for provider default sorting.
                </Text>
              ) : null}
            </View>
          </ScrollView>

          <View className="flex-row gap-3 border-t border-border pt-3">
            <Button
              className="flex-1"
              label="Reset"
              onPress={resetDraft}
              variant="secondary"
            />
            <Button
              className="flex-1"
              label="Apply filters"
              onPress={applyDraft}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function getSearchFilterSortLabel(sort: TorrentSort): string {
  if (sort === 'relevance') {
    return 'Relevance';
  }

  const { field, direction } = getSortDraft(sort);
  const sortLabel = SORT_FIELDS.find((item) => item.value === field)?.label;
  const directionLabel = direction === 'asc' ? 'Asc' : 'Desc';

  return sortLabel ? `${sortLabel} ${directionLabel}` : 'Sort';
}
