import { Link, router } from 'expo-router';
import {
  ChevronRight,
  Clock3,
  Info,
  Search as SearchIcon,
  Settings,
  Star,
} from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { BrandWordmark } from '@/components/brand/BrandMark';
import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import {
  getSearchCategoryLabel,
  getVisibleSearchCategories,
} from '@/features/search/constants';
import { CategoryGrid } from '@/features/search/components/CategoryGrid';
import { SearchInput } from '@/features/search/components/SearchInput';
import { TorrentCard } from '@/features/torrents/components/TorrentCard';
import { Torrent, TorrentCategory } from '@/models/torrent';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/utils/cn';
import {
  filterMatureTorrents,
  isMatureCategory,
} from '@/utils/torrentMaturity';

function formatRelativeSearchDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Recently';
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays}d ago`;
}

export default function HomeScreen() {
  const inputQuery = useSearchStore((state) => state.inputQuery);
  const category = useSearchStore((state) => state.category);
  const setInputQuery = useSearchStore((state) => state.setInputQuery);
  const clearInput = useSearchStore((state) => state.clearInput);
  const setCategory = useSearchStore((state) => state.setCategory);
  const favorites = useFavoritesStore((state) => state.favorites);
  const history = useHistoryStore((state) => state.history);
  const showMatureCategories = useSettingsStore(
    (state) => state.showMatureCategories,
  );
  const visibleCategories = useMemo(
    () => getVisibleSearchCategories(showMatureCategories),
    [showMatureCategories],
  );
  const visibleHistory = useMemo(
    () =>
      showMatureCategories
        ? history
        : history.filter((entry) => !isMatureCategory(entry.category)),
    [history, showMatureCategories],
  );
  const visibleFavorites = useMemo(
    () => filterMatureTorrents(favorites, showMatureCategories),
    [favorites, showMatureCategories],
  );

  useEffect(() => {
    if (
      category === 'adult' &&
      !visibleCategories.some((item) => item.value === category)
    ) {
      setCategory('all');
    }
  }, [category, setCategory, visibleCategories]);

  function openSearch(query = inputQuery, nextCategory = category) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setInputQuery(trimmedQuery);
    setCategory(nextCategory);
    router.push({
      pathname: '/search',
      params: {
        query: trimmedQuery,
        ...(nextCategory !== 'all' ? { category: nextCategory } : {}),
      },
    });
  }

  function selectCategory(nextCategory: TorrentCategory) {
    setCategory(nextCategory);
  }

  function openFavorite(torrent: Torrent) {
    router.push({ pathname: '/torrent/[id]', params: { id: torrent.id } });
  }

  const hasLocalContent =
    visibleHistory.length > 0 || visibleFavorites.length > 0;

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="pb-24 pt-4">
        <View className="flex-1 justify-between">
          <View>
            <View className="flex-row items-center justify-between">
              <BrandWordmark
                size={40}
                textClassName="text-[22px] font-bold text-content-primary"
              />
              <Link href="/settings" asChild>
                <IconButton accessibilityLabel="Open settings">
                  <Settings color={colors.textPrimary} size={20} />
                </IconButton>
              </Link>
            </View>

            <View className="mt-4">
              <SearchInput
                label="Search torrents"
                labelClassName="text-[16px]"
                onChangeText={setInputQuery}
                onClear={clearInput}
                onSubmit={() => openSearch()}
                placeholder="Search torrents"
                value={inputQuery}
              />
              <CategoryGrid
                className="mt-2"
                onSelect={selectCategory}
                selected={category}
                showMatureCategories={showMatureCategories}
              />
            </View>

            {!hasLocalContent ? (
              <Card className="mt-3 flex-row items-center gap-3 p-4 shadow-none">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                  <SearchIcon color={colors.primary} size={18} />
                </View>
                <Text className="flex-1 text-sm text-content-secondary">
                  Search by title, software name, artist, or keyword.
                </Text>
              </Card>
            ) : null}

            <Card
              className={cn(
                'p-4 shadow-none',
                hasLocalContent ? 'mt-3' : 'mt-4',
              )}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Clock3 color={colors.primary} size={17} />
                  <Text className="text-base font-semibold">
                    Recent searches
                  </Text>
                </View>
                {visibleHistory.length > 5 ? (
                  <Link href="/history" asChild>
                    <Pressable
                      accessibilityLabel="Open full search history"
                      accessibilityRole="button"
                      className="min-h-10 justify-center px-2 active:opacity-85"
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Text className="text-sm font-semibold text-primary">
                        See all
                      </Text>
                    </Pressable>
                  </Link>
                ) : (
                  <SearchIcon color={colors.textMuted} size={17} />
                )}
              </View>
              {visibleHistory.length > 0 ? (
                <View className="mt-2">
                  {visibleHistory.slice(0, 5).map((recent, index, visible) => (
                    <Pressable
                      accessibilityLabel={`Search again for ${recent.query}`}
                      accessibilityRole="button"
                      className={cn(
                        'min-h-12 flex-row items-center gap-3 border-b border-border py-2 active:opacity-85',
                        index === visible.length - 1 ? 'border-b-0' : null,
                      )}
                      key={recent.id}
                      onPress={() => {
                        setInputQuery(recent.query);
                        setCategory(recent.category);
                        router.push({
                          pathname: '/search',
                          params: {
                            query: recent.query,
                            ...(recent.category !== 'all'
                              ? { category: recent.category }
                              : {}),
                            ...(recent.sort !== 'relevance'
                              ? { sort: recent.sort }
                              : {}),
                          },
                        });
                      }}
                    >
                      <Clock3 color={colors.textMuted} size={18} />
                      <View className="flex-1">
                        <Text className="font-semibold" numberOfLines={1}>
                          {recent.query}
                        </Text>
                        <Text className="mt-0.5 text-xs text-content-muted">
                          {getSearchCategoryLabel(recent.category)} ·{' '}
                          {formatRelativeSearchDate(recent.searchedAt)}
                        </Text>
                      </View>
                      <ChevronRight color={colors.textMuted} size={19} />
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text className="mt-2 text-content-secondary">
                  Your latest searches appear here for quick access.
                </Text>
              )}
            </Card>

            <Card className="mt-4 p-4 shadow-none">
              <View className="flex-row items-center gap-3">
                <Star color={colors.primary} size={20} />
                <Text className="text-base font-semibold">Favorites</Text>
              </View>
              {visibleFavorites.length > 0 ? (
                <View className="mt-3">
                  {visibleFavorites.slice(0, 3).map((favorite) => (
                    <TorrentCard
                      cached
                      favorite
                      key={favorite.id}
                      onPress={openFavorite}
                      showSwarmStats={false}
                      torrent={favorite}
                      variant="favorite"
                    />
                  ))}
                </View>
              ) : (
                <Text className="mt-2 text-content-secondary">
                  Saved torrents will become launch points for related searches.
                </Text>
              )}
            </Card>
          </View>

          <Card className="mt-6 flex-row gap-3 p-4 shadow-none">
            <Info color={colors.info} size={19} />
            <Text className="flex-1 text-sm leading-[20px] text-content-secondary">
              {
                'TorrentBay indexes public metadata from an external provider. It does not host or download files.'
              }
            </Text>
          </Card>
        </View>
      </Screen>
      <BottomShortcuts active="home" />
    </View>
  );
}
