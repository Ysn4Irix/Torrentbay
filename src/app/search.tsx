import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, SlidersHorizontal, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { SEARCH_CATEGORIES, SEARCH_SORTS } from '@/features/search/constants';
import { SearchInput } from '@/features/search/components/SearchInput';
import { TorrentResultCard } from '@/features/search/components/TorrentResultCard';
import { Torrent, TorrentCategory, TorrentSort } from '@/models/torrent';
import { useSearchStore } from '@/store/searchStore';

function keyExtractor(torrent: Torrent) {
  return torrent.id;
}

export default function SearchResultsScreen() {
  const { query: queryParam } = useLocalSearchParams<{ query?: string }>();
  const inputQuery = useSearchStore((state) => state.inputQuery);
  const query = useSearchStore((state) => state.query);
  const page = useSearchStore((state) => state.page);
  const category = useSearchStore((state) => state.category);
  const sort = useSearchStore((state) => state.sort);
  const results = useSearchStore((state) => state.results);
  const status = useSearchStore((state) => state.status);
  const error = useSearchStore((state) => state.error);
  const setInputQuery = useSearchStore((state) => state.setInputQuery);
  const clearInput = useSearchStore((state) => state.clearInput);
  const setCategory = useSearchStore((state) => state.setCategory);
  const setSort = useSearchStore((state) => state.setSort);
  const runSearch = useSearchStore((state) => state.search);
  const retry = useSearchStore((state) => state.retry);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const routeQuery = Array.isArray(queryParam) ? queryParam[0] : queryParam;
    const trimmedQuery = routeQuery?.trim();

    if (!trimmedQuery) {
      return;
    }

    setInputQuery(trimmedQuery);
    void runSearch({ query: trimmedQuery, page: 1 });
  }, [queryParam, runSearch, setInputQuery]);

  const submitSearch = useCallback(() => {
    const trimmedQuery = inputQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    void runSearch({ query: trimmedQuery, page: 1 });
  }, [inputQuery, runSearch]);

  const selectCategory = useCallback(
    (nextCategory: TorrentCategory) => {
      if (!query) {
        setCategory(nextCategory);
        return;
      }

      void runSearch({ category: nextCategory, page: 1 });
    },
    [query, runSearch, setCategory],
  );

  const selectSort = useCallback(
    (nextSort: TorrentSort) => {
      if (!query) {
        setSort(nextSort);
        return;
      }

      void runSearch({ sort: nextSort, page: 1 });
    },
    [query, runSearch, setSort],
  );

  const resetFilters = useCallback(() => {
    if (!query) {
      setCategory('all');
      setSort('relevance');
      return;
    }

    void runSearch({ category: 'all', sort: 'relevance', page: 1 });
  }, [query, runSearch, setCategory, setSort]);

  const goToPage = useCallback(
    (nextPage: number) => {
      void runSearch({ page: nextPage });
    },
    [runSearch],
  );

  const openTorrent = useCallback((torrent: Torrent) => {
    router.push({ pathname: '/torrent/[id]', params: { id: torrent.id } });
  }, []);

  const selectedCategoryLabel =
    SEARCH_CATEGORIES.find((item) => item.value === category)?.label ??
    'Category';
  const selectedSortLabel =
    SEARCH_SORTS.find((item) => item.value === sort)?.label ?? 'Sort';

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Torrent>) => (
      <TorrentResultCard torrent={item} onPress={openTorrent} />
    ),
    [openTorrent],
  );

  function renderState() {
    if (status === 'loading') {
      return (
        <LoadingState
          title="Scanning providers"
          message="TorrentBay is searching the scraper pipeline."
        />
      );
    }

    if (status === 'error' && error) {
      return (
        <ErrorState
          actionLabel={error.retryable ? 'Retry search' : undefined}
          message={error.message}
          onAction={error.retryable ? () => void retry() : undefined}
          title={error.title}
        />
      );
    }

    if (status === 'empty') {
      return (
        <EmptyState
          actionLabel="Try Another Search"
          title="No torrents found"
          message="Try a broader query, another category, or a different sort."
          onAction={clearInput}
        />
      );
    }

    return (
      <EmptyState
        title="Start a search"
        message="Enter a torrent name, choose filters, then search."
      />
    );
  }

  const header = (
    <View className="pb-3">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="min-h-10 min-w-10 items-center justify-center rounded-2xl border border-border bg-surfaceElevated active:opacity-80"
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.foreground} size={19} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">
            Search Results
          </Text>
          <Text className="mt-0.5 text-sm text-muted" numberOfLines={1}>
            {query ? `Results for: ${query}` : 'No query submitted yet'}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={showFilters ? 'Hide filters' : 'Show filters'}
          accessibilityRole="button"
          className="min-h-10 min-w-10 items-center justify-center rounded-2xl border border-border bg-surfaceElevated active:opacity-80"
          onPress={() => setShowFilters((visible) => !visible)}
        >
          <SlidersHorizontal color={colors.primarySoft} size={19} />
        </Pressable>
      </View>

      <View className="mt-3">
        <SearchInput
          label="Refine"
          onChangeText={setInputQuery}
          onClear={clearInput}
          onSubmit={submitSearch}
          value={inputQuery}
        />
      </View>

      <ScrollView
        className="mt-3"
        contentContainerClassName="gap-2 pr-5"
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
      >
        {SEARCH_CATEGORIES.map((item) => (
          <Chip
            key={item.value}
            className="min-h-9 px-3 py-1"
            label={item.label}
            onPress={() => selectCategory(item.value)}
            selected={category === item.value}
          />
        ))}
      </ScrollView>

      <View className="mt-3 flex-row items-center justify-between border-b border-border pb-3">
        <Text className="flex-1 text-sm text-muted" numberOfLines={1}>
          {selectedCategoryLabel} • {selectedSortLabel}
        </Text>
        <Pressable
          accessibilityLabel="Reset filters and sorting"
          accessibilityRole="button"
          className="ml-3 min-h-9 flex-row items-center justify-center gap-1 rounded-xl border border-primary/30 px-3 active:opacity-80"
          onPress={resetFilters}
        >
          <X color={colors.primarySoft} size={16} />
          <Text className="text-sm font-semibold text-primary">Reset</Text>
        </Pressable>
      </View>

      {showFilters ? (
        <View className="mt-3 rounded-2xl border border-border bg-surfaceElevated p-3">
          <Text className="text-sm font-semibold uppercase tracking-widest text-muted">
            Sort by
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {SEARCH_SORTS.map((item) => (
              <Chip
                key={item.value}
                className="min-h-9 px-3 py-1"
                label={item.label}
                onPress={() => selectSort(item.value)}
                selected={sort === item.value}
              />
            ))}
          </View>
        </View>
      ) : null}

      {status === 'success' ? (
        <View className="mt-3 flex-row items-center justify-between px-1">
          <Text className="text-sm font-semibold">Page {page}</Text>
          <Text className="text-sm text-muted">
            {results.length} result{results.length === 1 ? '' : 's'}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const footer =
    status === 'success' ? (
      <View className="mt-2 flex-row gap-3 pb-2">
        <Button
          className="flex-1 bg-surfaceElevated"
          disabled={page <= 1}
          label="Previous"
          onPress={() => goToPage(page - 1)}
        />
        <Button
          className="flex-1"
          disabled={results.length === 0}
          label="Next"
          onPress={() => goToPage(page + 1)}
        />
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="px-0 py-0" scroll={false}>
        <FlatList
          ListEmptyComponent={renderState}
          ListFooterComponent={footer}
          ListHeaderComponent={header}
          contentContainerClassName="px-4 py-5 pb-32"
          data={status === 'success' ? results : []}
          initialNumToRender={8}
          keyboardShouldPersistTaps="handled"
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={8}
          removeClippedSubviews
          renderItem={renderItem}
          updateCellsBatchingPeriod={50}
          windowSize={7}
        />
      </Screen>
      <BottomShortcuts active="search" />
    </View>
  );
}
