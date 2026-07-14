import { afterEach, describe, expect, test } from 'bun:test';

import { persistentStorage } from '@/services/storage/persistentStorage';
import { useFavoritesStore } from '@/store/favoritesStore';

const torrent = {
  id: 'torrent-1',
  name: 'Ubuntu Desktop ISO',
  category: 'Apps',
  seeders: 100,
};

async function readPersistedState<T>(key: string): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 0));

  const raw = await persistentStorage.getItem(key);

  expect(raw).toBeString();

  return JSON.parse(raw as string).state as T;
}

describe('favoritesStore', () => {
  afterEach(() => {
    useFavoritesStore.getState().clearFavorites();
  });

  test('adds favorites with cache timestamps and newest first de-dupe', () => {
    useFavoritesStore.getState().addFavorite(torrent);
    useFavoritesStore
      .getState()
      .addFavorite({ id: 'torrent-2', name: 'Debian' });
    useFavoritesStore.getState().addFavorite({ ...torrent, seeders: 120 });

    const favorites = useFavoritesStore.getState().favorites;

    expect(favorites).toHaveLength(2);
    expect(favorites[0]).toMatchObject({
      id: 'torrent-1',
      name: 'Ubuntu Desktop ISO',
      seeders: 120,
    });
    expect(favorites[0]?.savedAt).toBeString();
    expect(favorites[0]?.cachedAt).toBeString();
  });

  test('toggles, restores, and clears favorites', () => {
    expect(useFavoritesStore.getState().toggleFavorite(torrent)).toBe(true);
    const favorite = useFavoritesStore.getState().favorites[0];

    expect(useFavoritesStore.getState().isFavorite(torrent.id)).toBe(true);
    expect(useFavoritesStore.getState().toggleFavorite(torrent)).toBe(false);
    expect(useFavoritesStore.getState().favorites).toEqual([]);

    if (favorite) {
      useFavoritesStore.getState().restoreFavorite(favorite);
    }

    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
    useFavoritesStore.getState().clearFavorites();
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  test('persists only favorite entries with cached metadata', async () => {
    useFavoritesStore.getState().addFavorite(torrent);

    const persisted = await readPersistedState<{
      favorites: { id: string; name: string; savedAt: string }[];
      isFavorite?: unknown;
    }>('torrentbay:favorites');

    expect(persisted.favorites).toHaveLength(1);
    expect(persisted.favorites[0]).toMatchObject({
      id: 'torrent-1',
      name: 'Ubuntu Desktop ISO',
    });
    expect(persisted.favorites[0]?.savedAt).toBeString();
    expect(persisted.isFavorite).toBeUndefined();
  });
});
