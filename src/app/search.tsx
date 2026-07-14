import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Copy,
  ExternalLink,
  Share2,
  SearchX,
  SlidersHorizontal,
  WifiOff,
} from 'lucide-react-native';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share as NativeShare,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Snackbar } from '@/components/ui/Snackbar';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import {
  SEARCH_CATEGORIES,
  getSearchCategoryLabel,
  getVisibleSearchCategories,
} from '@/features/search/constants';
import {
  SearchFilterSheet,
  getSearchFilterSortLabel,
} from '@/features/search/components/SearchFilterSheet';
import { SearchInput } from '@/features/search/components/SearchInput';
import { TorrentResultCard } from '@/features/search/components/TorrentResultCard';
import { TorrentCard } from '@/features/torrents/components/TorrentCard';
import { Torrent, TorrentCategory, TorrentSort } from '@/models/torrent';
import { FavoriteEntry, useFavoritesStore } from '@/store/favoritesStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';

const SKELETON_RESULTS = [
  'skeleton-1',
  'skeleton-2',
  'skeleton-3',
  'skeleton-4',
  'skeleton-5',
  'skeleton-6',
];

type SkeletonResult = { id: string; type: 'skeleton' };
type ResultListItem = Torrent | SkeletonResult;
type SnackbarState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
} | null;

const VALID_SORTS = new Set<TorrentSort>([
  'relevance',
  'name_asc',
  'name_desc',
  'uploaded_desc',
  'uploaded_asc',
  'size_desc',
  'size_asc',
  'seeders_desc',
  'seeders_asc',
  'leechers_desc',
  'leechers_asc',
]);

function keyExtractor(item: ResultListItem) {
  return item.id;
}

function isSkeletonResult(item: ResultListItem): item is SkeletonResult {
  return 'type' in item && item.type === 'skeleton';
}

function normalizeText(value?: string): string | undefined {
  const text = value?.replace(/\s+/g, ' ').trim();

  return text || undefined;
}

function getTorrentTitle(torrent: Torrent) {
  return normalizeText(torrent.name) ?? 'Untitled torrent';
}

function getRouteCategory(categoryParam?: string): TorrentCategory | undefined {
  return SEARCH_CATEGORIES.find((item) => item.value === categoryParam)?.value;
}

function getRouteSort(sortParam?: string): TorrentSort | undefined {
  return VALID_SORTS.has(sortParam as TorrentSort)
    ? (sortParam as TorrentSort)
    : undefined;
}

function ResultStateCard({
  icon,
  title,
  message,
  children,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <View className="mt-2 items-center rounded-lg border border-border bg-surface p-6">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
        {icon}
      </View>
      <Text className="mt-4 text-center" variant="h3">
        {title}
      </Text>
      <Text className="mt-2 text-center text-content-secondary">{message}</Text>
      {children ? <View className="mt-5 w-full gap-3">{children}</View> : null}
    </View>
  );
}

export default function SearchResultsScreen() {
  const insets = useSafeAreaInsets();
  const {
    category: categoryParam,
    query: queryParam,
    sort: sortParam,
  } = useLocalSearchParams<{
    category?: string;
    query?: string;
    sort?: string;
  }>();
  const inputQuery = useSearchStore((state) => state.inputQuery);
  const query = useSearchStore((state) => state.query);
  const page = useSearchStore((state) => state.page);
  const category = useSearchStore((state) => state.category);
  const sort = useSearchStore((state) => state.sort);
  const results = useSearchStore((state) => state.results);
  const hasNextPage = useSearchStore((state) => state.hasNextPage);
  const status = useSearchStore((state) => state.status);
  const error = useSearchStore((state) => state.error);
  const setInputQuery = useSearchStore((state) => state.setInputQuery);
  const clearInput = useSearchStore((state) => state.clearInput);
  const setCategory = useSearchStore((state) => state.setCategory);
  const setSort = useSearchStore((state) => state.setSort);
  const runSearch = useSearchStore((state) => state.search);
  const retry = useSearchStore((state) => state.retry);
  const favorites = useFavoritesStore((state) => state.favorites);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const restoreFavorite = useFavoritesStore((state) => state.restoreFavorite);
  const showMatureCategories = useSettingsStore(
    (state) => state.showMatureCategories,
  );
  const confirmBeforeOpeningMagnetLinks = useSettingsStore(
    (state) => state.confirmBeforeOpeningMagnetLinks,
  );
  const magnetNoticeAcknowledged = useSettingsStore(
    (state) => state.magnetNoticeAcknowledged,
  );
  const acknowledgeMagnetNotice = useSettingsStore(
    (state) => state.acknowledgeMagnetNotice,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);
  const [pendingMagnetTorrent, setPendingMagnetTorrent] =
    useState<Torrent | null>(null);
  const [overflowTorrent, setOverflowTorrent] = useState<Torrent | null>(null);
  const visibleCategories = getVisibleSearchCategories(showMatureCategories);

  useEffect(() => {
    const routeQuery = Array.isArray(queryParam) ? queryParam[0] : queryParam;
    const routeCategoryParam = Array.isArray(categoryParam)
      ? categoryParam[0]
      : categoryParam;
    const routeSortParam = Array.isArray(sortParam) ? sortParam[0] : sortParam;
    const routeCategory = getRouteCategory(routeCategoryParam);
    const routeSort = getRouteSort(routeSortParam);
    const trimmedQuery = routeQuery?.trim();
    const safeCategory =
      routeCategory === 'adult' && !showMatureCategories
        ? 'all'
        : routeCategory;

    if (safeCategory) {
      setCategory(safeCategory);
    }

    if (routeSort) {
      setSort(routeSort);
    }

    if (!trimmedQuery) {
      return;
    }

    setInputQuery(trimmedQuery);
    void runSearch({
      query: trimmedQuery,
      page: 1,
      category: safeCategory,
      sort: routeSort,
    });
  }, [
    categoryParam,
    queryParam,
    runSearch,
    setCategory,
    setInputQuery,
    setSort,
    showMatureCategories,
    sortParam,
  ]);

  useEffect(() => {
    if (showMatureCategories || category !== 'adult') {
      return;
    }

    if (query) {
      void runSearch({ category: 'all', page: 1 });
      return;
    }

    setCategory('all');
  }, [category, query, runSearch, setCategory, showMatureCategories]);

  const submitSearch = useCallback(() => {
    const trimmedQuery = inputQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    void runSearch({ query: trimmedQuery, page: 1 });
  }, [inputQuery, runSearch]);

  const applyFilters = useCallback(
    (filters: { category: TorrentCategory; sort: TorrentSort }) => {
      setShowFilters(false);

      if (!query) {
        setCategory(filters.category);
        setSort(filters.sort);
        return;
      }

      void runSearch({ ...filters, page: 1 });
    },
    [query, runSearch, setCategory, setSort],
  );

  const clearFilters = useCallback(() => {
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

  const toggleTorrentFavorite = useCallback(
    (torrent: Torrent) => {
      const existingFavorite = favorites.find((item) => item.id === torrent.id);
      const added = toggleFavorite(torrent);

      setSnackbar({
        message: added ? 'Added to favorites' : 'Removed from favorites',
        actionLabel: 'Undo',
        onAction: () => {
          if (added) {
            removeFavorite(torrent.id);
          } else if (existingFavorite) {
            restoreFavorite(existingFavorite as FavoriteEntry);
          }

          setSnackbar(null);
        },
      });
    },
    [favorites, removeFavorite, restoreFavorite, toggleFavorite],
  );

  const showSnackbar = useCallback((message: string) => {
    setSnackbar({ message });
  }, []);

  const openUrl = useCallback(
    async (url: string, failureMessage: string) => {
      try {
        await Linking.openURL(url);
      } catch {
        showSnackbar(failureMessage);
      }
    },
    [showSnackbar],
  );

  const openMagnetLink = useCallback(
    async (torrent: Torrent) => {
      if (!torrent.magnet) {
        showSnackbar('Magnet link not available');
        return;
      }

      await openUrl(torrent.magnet, 'No app could open this magnet link');
    },
    [openUrl, showSnackbar],
  );

  const requestMagnetOpen = useCallback(
    (torrent: Torrent) => {
      if (!torrent.magnet) {
        showSnackbar('Magnet link not available');
        return;
      }

      if (confirmBeforeOpeningMagnetLinks && !magnetNoticeAcknowledged) {
        setPendingMagnetTorrent(torrent);
        return;
      }

      void openMagnetLink(torrent);
    },
    [
      confirmBeforeOpeningMagnetLinks,
      magnetNoticeAcknowledged,
      openMagnetLink,
      showSnackbar,
    ],
  );

  const confirmPendingMagnetOpen = useCallback(() => {
    const torrent = pendingMagnetTorrent;

    if (!torrent) {
      return;
    }

    acknowledgeMagnetNotice();
    setPendingMagnetTorrent(null);
    void openMagnetLink(torrent);
  }, [acknowledgeMagnetNotice, openMagnetLink, pendingMagnetTorrent]);

  const copyMagnetLink = useCallback(
    async (torrent: Torrent) => {
      if (!torrent.magnet) {
        showSnackbar('Magnet link not available');
        return;
      }

      await Clipboard.setStringAsync(torrent.magnet);
      showSnackbar('Copied magnet link');
    },
    [showSnackbar],
  );

  const shareMagnetLink = useCallback(
    async (torrent: Torrent) => {
      if (!torrent.magnet) {
        showSnackbar('Magnet link not available');
        return;
      }

      try {
        await NativeShare.share({ message: torrent.magnet });
        showSnackbar('Share sheet opened');
      } catch {
        showSnackbar('Magnet link could not be shared');
      }
    },
    [showSnackbar],
  );

  const openProviderPage = useCallback(
    (torrent: Torrent) => {
      if (!torrent.detailsUrl) {
        showSnackbar('Provider page not available');
        return;
      }

      void openUrl(torrent.detailsUrl, 'Provider page could not be opened');
    },
    [openUrl, showSnackbar],
  );

  const isInitialLoading = status === 'loading' && results.length === 0;
  const hasActiveFilters = category !== 'all' || sort !== 'relevance';
  const selectedCategoryLabel = getSearchCategoryLabel(category);
  const selectedSortLabel = getSearchFilterSortLabel(sort);
  const shownCount =
    status === 'success' || status === 'loading' ? results.length : 0;
  const resultSummary = query ? `Results for “${query}”` : 'Search results';
  const pageSummary = `Page ${page} • ${shownCount} shown`;

  const listData = useMemo<ResultListItem[]>(() => {
    if (isInitialLoading) {
      return SKELETON_RESULTS.map((id) => ({ id, type: 'skeleton' }));
    }

    if (status === 'success' || (status === 'loading' && results.length > 0)) {
      return results;
    }

    return [];
  }, [isInitialLoading, results, status]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ResultListItem>) => {
      if (isSkeletonResult(item)) {
        return <TorrentCard className="mb-0" variant="skeleton" />;
      }

      return (
        <TorrentResultCard
          className="mb-0"
          onPress={openTorrent}
          favorite={isFavorite(item.id)}
          onFavoritePress={toggleTorrentFavorite}
          onMagnetPress={requestMagnetOpen}
          onOverflowPress={setOverflowTorrent}
          torrent={item}
        />
      );
    },
    [isFavorite, openTorrent, requestMagnetOpen, toggleTorrentFavorite],
  );

  function renderState() {
    if (status === 'error' && error) {
      const isOffline = error.kind === 'network';

      return (
        <ResultStateCard
          icon={
            isOffline ? (
              <WifiOff color={colors.error} size={26} />
            ) : (
              <AlertCircle color={colors.error} size={26} />
            )
          }
          message={error.message}
          title={error.title}
        >
          {error.retryable ? (
            <Button label="Retry" onPress={() => void retry()} />
          ) : null}
          {error.kind === 'provider_unavailable' ? (
            <Button
              label="Back to Home"
              onPress={() => router.replace('/home')}
              variant="secondary"
            />
          ) : null}
        </ResultStateCard>
      );
    }

    if (status === 'empty') {
      return (
        <ResultStateCard
          icon={<SearchX color={colors.primary} size={26} />}
          message="Try another keyword, remove a filter, or search all categories."
          title="No results found"
        >
          <Button
            label="Edit search"
            onPress={() => setInputQuery(query)}
            variant="secondary"
          />
          <Button
            disabled={!hasActiveFilters}
            label="Clear filters"
            onPress={clearFilters}
          />
        </ResultStateCard>
      );
    }

    return (
      <ResultStateCard
        icon={<SearchX color={colors.primary} size={26} />}
        message="Enter a keyword, choose filters, then search."
        title="Start a search"
      />
    );
  }

  const footer =
    status === 'success' || (status === 'loading' && results.length > 0) ? (
      <View className="gap-3 pb-3 pt-1">
        {status === 'loading' ? (
          <Text className="text-center text-sm text-content-secondary">
            Loading page…
          </Text>
        ) : null}
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            disabled={page <= 1 || status === 'loading'}
            label="Previous"
            onPress={() => goToPage(page - 1)}
            variant="secondary"
          />
          <Button
            className="flex-1"
            disabled={!hasNextPage || status === 'loading'}
            label="Next"
            onPress={() => goToPage(page + 1)}
          />
        </View>
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="px-0 py-0" scroll={false}>
        <View className="border-b border-border bg-background px-4 pb-3 pt-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="h-12 w-12 items-center justify-center rounded-md border border-border bg-surface-muted active:bg-surface-elevated active:opacity-85"
              onPress={() => router.back()}
            >
              <ArrowLeft color={colors.textPrimary} size={20} />
            </Pressable>
            <View className="flex-1">
              <SearchInput
                label="Search torrents"
                loading={status === 'loading'}
                onChangeText={setInputQuery}
                onClear={clearInput}
                onSubmit={submitSearch}
                placeholder="Search torrents"
                value={inputQuery}
                variant="compact"
              />
            </View>
          </View>

          <View className="mt-3 rounded-lg border border-border bg-surface px-3 py-3">
            <ScrollView
              contentContainerClassName="gap-2 pr-2"
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
            >
              <Chip
                accessibilityLabel={`Filter by category, ${selectedCategoryLabel}`}
                label={selectedCategoryLabel}
                onPress={() => setShowFilters(true)}
                selected={category !== 'all'}
              />
              <Chip
                accessibilityLabel={`Sort results, ${selectedSortLabel}`}
                label={`Sort: ${selectedSortLabel}`}
                onPress={() => setShowFilters(true)}
                selected={sort !== 'relevance'}
              />
              <Pressable
                accessibilityLabel="Open filters"
                accessibilityRole="button"
                className="min-h-10 flex-row items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary-soft px-4 py-2 active:opacity-85"
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                onPress={() => setShowFilters(true)}
              >
                <SlidersHorizontal color={colors.primary} size={17} />
                <Text className="text-sm font-semibold text-primary">
                  Filters
                </Text>
              </Pressable>
            </ScrollView>
            <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2 px-1">
              <Text className="font-semibold text-content-primary">
                {resultSummary}
              </Text>
              <Text className="text-sm text-content-secondary">
                {pageSummary}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ListEmptyComponent={renderState}
          ListFooterComponent={footer}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerClassName="px-4 py-4 pb-8"
          data={listData}
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

      {showFilters ? (
        <SearchFilterSheet
          category={category}
          categories={visibleCategories}
          onApply={applyFilters}
          onDismiss={() => setShowFilters(false)}
          sort={sort}
          visible
        />
      ) : null}
      <ConfirmDialog
        confirmLabel="Continue"
        message="This will pass the magnet link to another app installed on your device. TorrentBay does not download the content."
        onCancel={() => setPendingMagnetTorrent(null)}
        onConfirm={confirmPendingMagnetOpen}
        title="Open magnet link?"
        visible={pendingMagnetTorrent !== null}
      />
      <Modal
        animationType="fade"
        onRequestClose={() => setOverflowTorrent(null)}
        transparent
        visible={overflowTorrent !== null}
      >
        <View
          className="flex-1 justify-end px-4"
          style={{
            backgroundColor: colors.scrim,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <Pressable
            accessibilityLabel="Dismiss result actions"
            accessibilityRole="button"
            className="absolute inset-0"
            onPress={() => setOverflowTorrent(null)}
          />
          {overflowTorrent ? (
            <View className="rounded-xl border border-border bg-surface-elevated p-4">
              <Text variant="h3">Result actions</Text>
              <Text
                className="mt-1 text-sm text-content-secondary"
                numberOfLines={2}
              >
                {getTorrentTitle(overflowTorrent)}
              </Text>
              <View className="mt-3 gap-3">
                <Button
                  accessibilityLabel={`Copy magnet link for ${getTorrentTitle(overflowTorrent)}`}
                  disabled={!overflowTorrent.magnet}
                  label="Copy magnet link"
                  leftIcon={<Copy color={colors.textPrimary} size={18} />}
                  onPress={() => {
                    const torrent = overflowTorrent;

                    setOverflowTorrent(null);
                    void copyMagnetLink(torrent);
                  }}
                  variant="secondary"
                />
                <Button
                  accessibilityLabel={`Share magnet link for ${getTorrentTitle(overflowTorrent)}`}
                  disabled={!overflowTorrent.magnet}
                  label="Share magnet link"
                  leftIcon={<Share2 color={colors.textPrimary} size={18} />}
                  onPress={() => {
                    const torrent = overflowTorrent;

                    setOverflowTorrent(null);
                    void shareMagnetLink(torrent);
                  }}
                  variant="secondary"
                />
                <Button
                  accessibilityHint="Opens an external website in your browser."
                  accessibilityLabel="Open provider page"
                  disabled={!overflowTorrent.detailsUrl}
                  label="Open provider page"
                  leftIcon={
                    <ExternalLink color={colors.textPrimary} size={18} />
                  }
                  onPress={() => {
                    const torrent = overflowTorrent;

                    setOverflowTorrent(null);
                    openProviderPage(torrent);
                  }}
                  variant="secondary"
                />
                <Button
                  accessibilityLabel={
                    isFavorite(overflowTorrent.id)
                      ? `Remove ${getTorrentTitle(overflowTorrent)} torrent from favorites`
                      : `Add ${getTorrentTitle(overflowTorrent)} torrent to favorites`
                  }
                  label={
                    isFavorite(overflowTorrent.id)
                      ? 'Remove favorite'
                      : 'Add favorite'
                  }
                  leftIcon={
                    <Bookmark
                      color={colors.textPrimary}
                      fill={
                        isFavorite(overflowTorrent.id)
                          ? colors.textPrimary
                          : 'transparent'
                      }
                      size={18}
                    />
                  }
                  onPress={() => {
                    const torrent = overflowTorrent;

                    setOverflowTorrent(null);
                    toggleTorrentFavorite(torrent);
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
      <Snackbar
        actionLabel={snackbar?.actionLabel}
        message={snackbar?.message ?? ''}
        onAction={snackbar?.onAction}
        onDismiss={() => setSnackbar(null)}
        visible={Boolean(snackbar)}
      />
    </View>
  );
}
