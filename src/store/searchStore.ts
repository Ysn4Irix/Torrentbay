import { create } from 'zustand';

import {
  SearchErrorState,
  mapScraperError,
} from '@/features/search/utils/mapScraperError';
import {
  Torrent,
  TorrentCategory,
  TorrentSearchParams,
  TorrentSearchResponse,
  TorrentSort,
} from '@/models/torrent';

type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

type SearchService = (
  params: TorrentSearchParams,
) => Promise<TorrentSearchResponse>;

type SearchActionParams = Partial<TorrentSearchParams> & {
  commit?: boolean;
  force?: boolean;
};

type NormalizedSearchParams = Required<TorrentSearchParams>;

type SearchState = {
  inputQuery: string;
  query: string;
  page: number;
  category: TorrentCategory;
  sort: TorrentSort;
  results: Torrent[];
  status: SearchStatus;
  error: SearchErrorState | null;
  recentSearches: string[];
  activeRequestId: number;
  activeRequestKey: string | null;
  currentSearchKey: string | null;
  setInputQuery: (query: string) => void;
  setQuery: (query: string) => void;
  clearInput: () => void;
  invalidateActiveRequest: () => void;
  setCategory: (category: TorrentCategory) => void;
  setSort: (sort: TorrentSort) => void;
  search: (params?: SearchActionParams) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
};

const MAX_RECENT_SEARCHES = 8;
const initialSearchState = {
  inputQuery: '',
  query: '',
  page: 1,
  category: 'all' as TorrentCategory,
  sort: 'relevance' as TorrentSort,
  results: [],
  status: 'idle' as SearchStatus,
  error: null,
  recentSearches: [],
  activeRequestId: 0,
  activeRequestKey: null,
  currentSearchKey: null,
};

let nextRequestId = 0;
const defaultSearchService: SearchService = async (params) => {
  const { searchTorrents } = await import('@/services/scraper/torrentSearch');

  return searchTorrents(params);
};
let searchService: SearchService = defaultSearchService;
let inFlightSearchKey: string | null = null;
let inFlightSearchPromise: Promise<void> | null = null;
let inFlightShouldCommit = false;
let inFlightRequestId: number | null = null;

function clearInFlightSearch() {
  inFlightSearchKey = null;
  inFlightSearchPromise = null;
  inFlightShouldCommit = false;
  inFlightRequestId = null;
}

function addRecentSearch(recentSearches: string[], query: string): string[] {
  return [query, ...recentSearches.filter((recent) => recent !== query)].slice(
    0,
    MAX_RECENT_SEARCHES,
  );
}

function getSearchKey({
  query,
  page,
  category,
  sort,
}: NormalizedSearchParams): string {
  return JSON.stringify([query.toLocaleLowerCase(), page, category, sort]);
}

export const useSearchStore = create<SearchState>((set) => ({
  ...initialSearchState,
  setInputQuery: (inputQuery) =>
    set((state) => {
      clearInFlightSearch();

      return {
        inputQuery,
        status:
          state.status === 'loading'
            ? state.results.length > 0
              ? 'success'
              : 'idle'
            : state.status,
        error: state.status === 'loading' ? null : state.error,
        activeRequestId: ++nextRequestId,
        activeRequestKey: null,
        currentSearchKey:
          state.status === 'loading' && state.results.length === 0
            ? null
            : state.currentSearchKey,
      };
    }),
  setQuery: (query) => set({ inputQuery: query, query }),
  clearInput: () =>
    set(() => {
      clearInFlightSearch();

      return {
        inputQuery: '',
        query: '',
        page: 1,
        results: [],
        status: 'idle',
        error: null,
        activeRequestId: ++nextRequestId,
        activeRequestKey: null,
        currentSearchKey: null,
      };
    }),
  invalidateActiveRequest: () =>
    set((state) => {
      clearInFlightSearch();

      return {
        status:
          state.status === 'loading'
            ? state.results.length > 0
              ? 'success'
              : 'idle'
            : state.status,
        error: state.status === 'loading' ? null : state.error,
        activeRequestId: ++nextRequestId,
        activeRequestKey: null,
        currentSearchKey:
          state.status === 'loading' && state.results.length === 0
            ? null
            : state.currentSearchKey,
      };
    }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  search: async (params = {}) => {
    const currentState = useSearchStore.getState();
    const hasQueryParam = params.query !== undefined;
    const commit = params.commit ?? true;
    const force = params.force ?? false;
    const nextQuery = hasQueryParam ? (params.query ?? '') : currentState.query;
    const query = nextQuery.trim();

    if (!query) {
      clearInFlightSearch();

      set({
        inputQuery: hasQueryParam ? '' : currentState.inputQuery,
        query: '',
        page: 1,
        results: [],
        status: 'idle',
        error: null,
        activeRequestId: ++nextRequestId,
        activeRequestKey: null,
        currentSearchKey: null,
      });
      return;
    }

    const page = params.page ?? currentState.page;
    const category = params.category ?? currentState.category;
    const sort = params.sort ?? currentState.sort;
    const searchParams = { query, page, category, sort };
    const searchKey = getSearchKey(searchParams);

    if (!force) {
      if (
        currentState.status === 'loading' &&
        currentState.activeRequestKey === searchKey &&
        inFlightSearchKey === searchKey &&
        inFlightSearchPromise
      ) {
        inFlightShouldCommit = inFlightShouldCommit || commit;
        set((state) => ({
          inputQuery: hasQueryParam ? query : state.inputQuery,
          query: commit ? query : state.query,
          page,
          category,
          sort,
          error: null,
          activeRequestKey: searchKey,
        }));

        return inFlightSearchPromise;
      }

      if (
        currentState.currentSearchKey === searchKey &&
        ['success', 'empty'].includes(currentState.status)
      ) {
        set((state) => ({
          inputQuery: hasQueryParam ? query : state.inputQuery,
          query: commit ? query : state.query,
          page,
          category,
          sort,
          recentSearches:
            commit && state.status !== 'error'
              ? addRecentSearch(state.recentSearches, query)
              : state.recentSearches,
        }));

        return;
      }
    }

    const requestId = ++nextRequestId;

    inFlightSearchKey = searchKey;
    inFlightShouldCommit = commit;
    inFlightRequestId = requestId;

    const searchPromise = (async () => {
      set({
        inputQuery: hasQueryParam ? query : currentState.inputQuery,
        query: commit ? query : currentState.query,
        page,
        category,
        sort,
        status: 'loading',
        error: null,
        activeRequestId: requestId,
        activeRequestKey: searchKey,
      });

      try {
        const response = await searchService(searchParams);

        if (useSearchStore.getState().activeRequestId !== requestId) {
          return;
        }

        set((state) => ({
          results: response.results,
          status: response.results.length > 0 ? 'success' : 'empty',
          error: null,
          activeRequestKey: null,
          currentSearchKey: searchKey,
          recentSearches: inFlightShouldCommit
            ? addRecentSearch(state.recentSearches, query)
            : state.recentSearches,
        }));
      } catch (error) {
        if (useSearchStore.getState().activeRequestId !== requestId) {
          return;
        }

        set({
          results: [],
          status: 'error',
          error: mapScraperError(error),
          activeRequestKey: null,
          currentSearchKey: null,
        });
      } finally {
        if (
          inFlightSearchKey === searchKey &&
          inFlightRequestId === requestId
        ) {
          clearInFlightSearch();
        }
      }
    })();

    inFlightSearchPromise = searchPromise;

    return searchPromise;
  },
  retry: async () => {
    const { query, page, category, sort, search } = useSearchStore.getState();

    await search({ query, page, category, sort, force: true });
  },
  reset: () => {
    clearInFlightSearch();
    set({ ...initialSearchState, activeRequestId: ++nextRequestId });
  },
}));

export function setSearchServiceForTests(service: SearchService) {
  searchService = service;
}

export function resetSearchServiceForTests() {
  searchService = defaultSearchService;
  nextRequestId = 0;
  clearInFlightSearch();
}
