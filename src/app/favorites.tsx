import { router } from 'expo-router';
import { Bookmark, Search, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, View } from 'react-native';

import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Snackbar } from '@/components/ui/Snackbar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { TorrentCard } from '@/features/torrents/components/TorrentCard';
import { Torrent } from '@/models/torrent';
import { FavoriteEntry, useFavoritesStore } from '@/store/favoritesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { filterMatureTorrents } from '@/utils/torrentMaturity';

type FavoriteSort = 'recent' | 'name' | 'seeders' | 'category';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'name', label: 'Name' },
  { value: 'seeders', label: 'Seeders' },
  { value: 'category', label: 'Category' },
] satisfies { value: FavoriteSort; label: string }[];

function sortFavorites(favorites: FavoriteEntry[], sort: FavoriteSort) {
  return [...favorites].sort((a, b) => {
    if (sort === 'name') {
      return a.name.localeCompare(b.name);
    }

    if (sort === 'seeders') {
      return (b.seeders ?? -1) - (a.seeders ?? -1);
    }

    if (sort === 'category') {
      return (a.category ?? '').localeCompare(b.category ?? '');
    }

    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });
}

export default function FavoritesScreen() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const restoreFavorite = useFavoritesStore((state) => state.restoreFavorite);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const showMatureCategories = useSettingsStore(
    (state) => state.showMatureCategories,
  );
  const [sort, setSort] = useState<FavoriteSort>('recent');
  const [removedFavorite, setRemovedFavorite] = useState<FavoriteEntry | null>(
    null,
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function openTorrent(torrent: Torrent) {
    router.push({ pathname: '/torrent/[id]', params: { id: torrent.id } });
  }

  function removeSavedFavorite(favorite: FavoriteEntry) {
    setRemovedFavorite(favorite);
    removeFavorite(favorite.id);
  }

  function undoRemove() {
    if (removedFavorite) {
      restoreFavorite(removedFavorite);
    }

    setRemovedFavorite(null);
  }

  function confirmClearFavorites() {
    clearFavorites();
    setRemovedFavorite(null);
    setShowClearConfirm(false);
  }

  const visibleFavorites = useMemo(
    () => filterMatureTorrents(favorites, showMatureCategories),
    [favorites, showMatureCategories],
  );
  const sortedFavorites = sortFavorites(visibleFavorites, sort);

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="px-0 py-0" scroll={false}>
        <FlatList
          ListHeaderComponent={
            <View className="px-4 pb-3 pt-5">
              <View className="min-h-12 flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/15">
                    <Bookmark color={colors.primary} size={21} />
                  </View>
                  <View>
                    <Text variant="h1">Favorites</Text>
                    <Text className="mt-1 text-sm text-content-secondary">
                      Locally saved torrent metadata.
                    </Text>
                  </View>
                </View>
                {visibleFavorites.length > 0 ? (
                  <IconButton
                    accessibilityLabel="Clear favorites"
                    onPress={() => setShowClearConfirm(true)}
                  >
                    <Trash2 color={colors.error} size={20} />
                  </IconButton>
                ) : null}
              </View>

              {visibleFavorites.length > 0 ? (
                <>
                  <Card className="mt-5 border-info/35 p-4 shadow-none">
                    <Text className="text-sm leading-[20px] text-content-secondary">
                      Saved metadata may differ from the current provider
                      listing.
                    </Text>
                  </Card>
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        onPress={() => setSort(option.value)}
                        selected={sort === option.value}
                      />
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <Card className="mx-4 mt-2 items-center p-6 shadow-none">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
                <Bookmark color={colors.primary} size={28} />
              </View>
              <Text className="mt-4 text-center" variant="h3">
                No favorites yet
              </Text>
              <Text className="mt-2 text-center text-content-secondary">
                Bookmark a result to keep its metadata available here.
              </Text>
              <Button
                className="mt-5"
                label="Start searching"
                leftIcon={<Search color={colors.background} size={18} />}
                onPress={() => router.push('/home')}
              />
            </Card>
          }
          contentContainerClassName="pb-32"
          data={sortedFavorites}
          initialNumToRender={8}
          ItemSeparatorComponent={() => <View className="h-3" />}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }: ListRenderItemInfo<FavoriteEntry>) => (
            <View className="px-4">
              <TorrentCard
                cached
                favorite
                onFavoritePress={() => removeSavedFavorite(item)}
                onPress={openTorrent}
                torrent={item}
                variant="favorite"
              />
            </View>
          )}
        />
      </Screen>
      <BottomShortcuts active="favorites" />
      <ConfirmDialog
        confirmLabel="Clear favorites"
        destructive
        message="This removes all locally saved torrent metadata from favorites."
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={confirmClearFavorites}
        title="Clear favorites?"
        visible={showClearConfirm}
      />
      <Snackbar
        actionLabel="Undo"
        bottomOffset={88}
        message="Removed from favorites"
        onAction={undoRemove}
        onDismiss={() => setRemovedFavorite(null)}
        visible={Boolean(removedFavorite)}
      />
    </View>
  );
}
