import { Link, router, useFocusEffect } from 'expo-router';
import { Clock3, Search, Settings, Star } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { CategoryGrid } from '@/features/search/components/CategoryGrid';
import { SearchInput } from '@/features/search/components/SearchInput';
import { useInstantTorrentSearch } from '@/features/search/hooks/useTorrentSearch';
import { TorrentCategory } from '@/models/torrent';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSearchStore } from '@/store/searchStore';

export default function HomeScreen() {
  const inputQuery = useSearchStore((state) => state.inputQuery);
  const status = useSearchStore((state) => state.status);
  const results = useSearchStore((state) => state.results);
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const category = useSearchStore((state) => state.category);
  const setInputQuery = useSearchStore((state) => state.setInputQuery);
  const clearInput = useSearchStore((state) => state.clearInput);
  const setCategory = useSearchStore((state) => state.setCategory);
  const runSearch = useSearchStore((state) => state.search);
  const invalidateActiveRequest = useSearchStore(
    (state) => state.invalidateActiveRequest,
  );
  const favorites = useFavoritesStore((state) => state.favorites);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);

      return () => {
        setIsFocused(false);
        invalidateActiveRequest();
      };
    }, [invalidateActiveRequest]),
  );

  useInstantTorrentSearch(inputQuery, isFocused);

  function openSearch(query = inputQuery) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setInputQuery(trimmedQuery);
    router.push({ pathname: '/search', params: { query: trimmedQuery } });
  }

  function selectCategory(nextCategory: TorrentCategory) {
    setCategory(nextCategory);

    if (isFocused && inputQuery.trim().length >= 2) {
      void runSearch({
        query: inputQuery,
        category: nextCategory,
        page: 1,
        commit: false,
      });
    }
  }

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="py-5 pb-32">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold">
            <Text className="text-lg font-bold text-foreground">Torrent</Text>
            <Text className="text-lg font-bold text-primary">Bay</Text>
          </Text>
          <Link href="/settings" asChild>
            <IconButton accessibilityLabel="Open settings">
              <Settings color={colors.foreground} size={20} />
            </IconButton>
          </Link>
        </View>

        <View className="mt-4">
          <SearchInput
            label="Search torrents"
            onChangeText={setInputQuery}
            onClear={clearInput}
            onSubmit={() => openSearch()}
            placeholder="Search for movies, series, games..."
            value={inputQuery}
          />
          {inputQuery.trim().length >= 2 ? (
            <Text className="mt-3 text-sm text-muted">
              {status === 'loading'
                ? 'Scanning the provider pipeline...'
                : `${results.length} instant result${results.length === 1 ? '' : 's'} ready`}
            </Text>
          ) : null}
        </View>

        <Card className="mt-4 p-4 shadow-none">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Clock3 color={colors.primarySoft} size={17} />
              <Text className="text-base font-semibold">Recent Searches</Text>
            </View>
            <Search color={colors.muted} size={17} />
          </View>
          {recentSearches.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {recentSearches.map((recent) => (
                <Chip
                  accessibilityLabel={`Search again for ${recent}`}
                  className="min-h-9 px-3 py-1"
                  key={recent}
                  label={recent}
                  onPress={() => {
                    setInputQuery(recent);
                    openSearch(recent);
                  }}
                />
              ))}
            </View>
          ) : (
            <Text className="mt-2 text-muted">
              Your latest searches appear here for quick access.
            </Text>
          )}
        </Card>

        <View className="mt-5">
          <Text className="mb-3 text-base font-semibold">Categories</Text>
          <CategoryGrid selected={category} onSelect={selectCategory} />
        </View>

        <Card className="mt-5 p-4 shadow-none">
          <View className="flex-row items-center gap-3">
            <Star color={colors.primarySoft} size={20} />
            <Text className="text-base font-semibold">Favorites shortcuts</Text>
          </View>
          {favorites.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap gap-3">
              {favorites.slice(0, 4).map((favorite) => (
                <Chip
                  accessibilityLabel={`Search favorite ${favorite.name}`}
                  className="min-h-9 px-3 py-1"
                  key={favorite.id}
                  label={favorite.name}
                  onPress={() => {
                    setInputQuery(favorite.name);
                    openSearch(favorite.name);
                  }}
                />
              ))}
            </View>
          ) : (
            <Text className="mt-2 text-muted">
              Saved torrents will become launch points for related searches.
            </Text>
          )}
        </Card>
      </Screen>
      <BottomShortcuts active="home" />
    </View>
  );
}
