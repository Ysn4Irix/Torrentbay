import { create } from 'zustand';

type SearchState = {
  query: string;
  setQuery: (query: string) => void;
  reset: () => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  reset: () => set({ query: '' }),
}));
