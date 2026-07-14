import { router } from 'expo-router';
import { ArrowLeft, Clock3, Search, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Snackbar } from '@/components/ui/Snackbar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { getSearchFilterSortLabel } from '@/features/search/components/SearchFilterSheet';
import { getSearchCategoryLabel } from '@/features/search/constants';
import { HistoryEntry, useHistoryStore } from '@/store/historyStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';
import { isMatureCategory } from '@/utils/torrentMaturity';

type HistorySection = {
  title: string;
  data: HistoryEntry[];
};

function daysSince(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.floor((Date.now() - timestamp) / 86400000);
}

function groupHistory(history: HistoryEntry[]): HistorySection[] {
  const sections: HistorySection[] = [
    { title: 'Today', data: [] },
    { title: 'Previous 7 days', data: [] },
    { title: 'Older', data: [] },
  ];

  history.forEach((entry) => {
    const age = daysSince(entry.searchedAt);

    if (age < 1) {
      sections[0].data.push(entry);
    } else if (age <= 7) {
      sections[1].data.push(entry);
    } else {
      sections[2].data.push(entry);
    }
  });

  return sections.filter((section) => section.data.length > 0);
}

export default function HistoryScreen() {
  const history = useHistoryStore((state) => state.history);
  const removeHistoryEntry = useHistoryStore(
    (state) => state.removeHistoryEntry,
  );
  const restoreHistoryEntry = useHistoryStore(
    (state) => state.restoreHistoryEntry,
  );
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const setInputQuery = useSearchStore((state) => state.setInputQuery);
  const setCategory = useSearchStore((state) => state.setCategory);
  const setSort = useSearchStore((state) => state.setSort);
  const showMatureCategories = useSettingsStore(
    (state) => state.showMatureCategories,
  );
  const [removedEntry, setRemovedEntry] = useState<HistoryEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function searchAgain(entry: HistoryEntry) {
    setInputQuery(entry.query);
    setCategory(entry.category);
    setSort(entry.sort);
    router.push({
      pathname: '/search',
      params: {
        query: entry.query,
        ...(entry.category !== 'all' ? { category: entry.category } : {}),
        ...(entry.sort !== 'relevance' ? { sort: entry.sort } : {}),
      },
    });
  }

  function removeEntry(entry: HistoryEntry) {
    setRemovedEntry(entry);
    removeHistoryEntry(entry.id);
  }

  function undoRemove() {
    if (removedEntry) {
      restoreHistoryEntry(removedEntry);
    }

    setRemovedEntry(null);
  }

  function confirmClearHistory() {
    clearHistory();
    setRemovedEntry(null);
    setShowClearConfirm(false);
  }

  const visibleHistory = useMemo(
    () =>
      showMatureCategories
        ? history
        : history.filter((entry) => !isMatureCategory(entry.category)),
    [history, showMatureCategories],
  );

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="px-0 py-0" scroll={false}>
        <SectionList
          ListHeaderComponent={
            <View className="px-4 pb-4 pt-5">
              <View className="flex-row items-center gap-3">
                <IconButton
                  accessibilityLabel="Go back"
                  onPress={() => router.back()}
                >
                  <ArrowLeft color={colors.textPrimary} size={19} />
                </IconButton>
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/15">
                  <Clock3 color={colors.primary} size={21} />
                </View>
                <View className="flex-1">
                  <Text variant="h1">Search history</Text>
                  <Text className="mt-1 text-sm text-content-secondary">
                    Replay saved searches with their filters.
                  </Text>
                </View>
                {visibleHistory.length > 0 ? (
                  <IconButton
                    accessibilityLabel="Clear search history"
                    onPress={() => setShowClearConfirm(true)}
                  >
                    <Trash2 color={colors.error} size={20} />
                  </IconButton>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <Card className="mx-4 mt-2 items-center p-6 shadow-none">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
                <Clock3 color={colors.primary} size={28} />
              </View>
              <Text className="mt-4 text-center" variant="h3">
                No search history
              </Text>
              <Text className="mt-2 text-center text-content-secondary">
                Your recent searches will appear here.
              </Text>
              <Button
                className="mt-5"
                label="Start searching"
                leftIcon={<Search color={colors.background} size={18} />}
                onPress={() => router.push('/home')}
              />
            </Card>
          }
          contentContainerClassName="pb-8"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4">
              <Card className="mb-2 p-0 shadow-none">
                <Pressable
                  accessibilityLabel={`Search again for ${item.query}`}
                  accessibilityRole="button"
                  className="min-h-16 flex-row items-center gap-3 p-3 active:opacity-85"
                  onPress={() => searchAgain(item)}
                >
                  <Clock3 color={colors.textMuted} size={18} />
                  <View className="flex-1">
                    <Text className="font-semibold" numberOfLines={1}>
                      {item.query}
                    </Text>
                    <Text className="mt-1 text-xs text-content-muted">
                      {getSearchCategoryLabel(item.category)} ·{' '}
                      {getSearchFilterSortLabel(item.sort)}
                    </Text>
                  </View>
                  <IconButton
                    accessibilityLabel={`Remove ${item.query} from search history`}
                    onPress={() => removeEntry(item)}
                  >
                    <Trash2 color={colors.textSecondary} size={18} />
                  </IconButton>
                </Pressable>
              </Card>
            </View>
          )}
          renderSectionHeader={({ section }) => (
            <View className="bg-background px-4 pb-2 pt-3">
              <Text className="text-sm font-semibold text-content-secondary">
                {section.title}
              </Text>
            </View>
          )}
          sections={groupHistory(visibleHistory)}
          stickySectionHeadersEnabled={false}
        />
      </Screen>
      <ConfirmDialog
        confirmLabel="Clear history"
        destructive
        message="This removes all locally stored search history."
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={confirmClearHistory}
        title="Clear search history?"
        visible={showClearConfirm}
      />
      <Snackbar
        actionLabel="Undo"
        message="History entry removed"
        onAction={undoRemove}
        onDismiss={() => setRemovedEntry(null)}
        visible={Boolean(removedEntry)}
      />
    </View>
  );
}
