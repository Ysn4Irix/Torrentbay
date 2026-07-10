import { create } from 'zustand';

import { Torrent } from '@/models/torrent';

type FavoritesState = {
  favorites: Torrent[];
};

export const useFavoritesStore = create<FavoritesState>(() => ({
  favorites: [],
}));
