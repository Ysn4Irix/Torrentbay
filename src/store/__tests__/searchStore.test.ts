import { afterEach, describe, expect, test } from 'bun:test';

import {
  resetSearchServiceForTests,
  setSearchServiceForTests,
  useSearchStore,
} from '@/store/searchStore';
import { ScraperError } from '@/services/scraper/scraperErrors';

const torrent = { id: 'fixture-1', name: 'Fixture result' };

describe('searchStore', () => {
  afterEach(() => {
    useSearchStore.getState().reset();
    resetSearchServiceForTests();
  });

  test('stores successful scraper results and recent searches', async () => {
    setSearchServiceForTests(async (params) => ({
      query: params.query,
      page: params.page ?? 1,
      category: params.category ?? 'all',
      sort: params.sort ?? 'relevance',
      results: [torrent],
    }));

    await useSearchStore.getState().search({ query: 'ubuntu' });

    expect(useSearchStore.getState()).toMatchObject({
      query: 'ubuntu',
      status: 'success',
      results: [torrent],
      recentSearches: ['ubuntu'],
    });
  });

  test('prevents stale responses from overwriting newer searches', async () => {
    let resolveFirst: (() => void) | undefined;

    setSearchServiceForTests(async (params) => {
      if (params.query === 'first') {
        await new Promise<void>((resolve) => {
          resolveFirst = resolve;
        });

        return {
          query: params.query,
          page: 1,
          category: 'all',
          sort: 'relevance',
          results: [{ id: 'first', name: 'First' }],
        };
      }

      return {
        query: params.query,
        page: 1,
        category: 'all',
        sort: 'relevance',
        results: [{ id: 'second', name: 'Second' }],
      };
    });

    const firstSearch = useSearchStore.getState().search({ query: 'first' });
    await useSearchStore.getState().search({ query: 'second' });

    resolveFirst?.();
    await firstSearch;

    expect(useSearchStore.getState()).toMatchObject({
      query: 'second',
      status: 'success',
      results: [{ id: 'second', name: 'Second' }],
    });
  });

  test('does not let invalidated instant search block later committed search', async () => {
    let calls = 0;
    let resolveSearch: (() => void) | undefined;

    setSearchServiceForTests(async (params) => {
      calls += 1;

      if (calls === 1) {
        await new Promise<void>((resolve) => {
          resolveSearch = resolve;
        });
      }

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [torrent],
      };
    });

    const instantSearch = useSearchStore
      .getState()
      .search({ query: 'ubuntu', commit: false });

    useSearchStore.getState().invalidateActiveRequest();
    resolveSearch?.();
    await instantSearch;

    await useSearchStore.getState().search({ query: ' ubuntu ', page: 1 });

    expect(calls).toBe(2);
    expect(useSearchStore.getState()).toMatchObject({
      query: 'ubuntu',
      status: 'success',
      recentSearches: ['ubuntu'],
    });
  });

  test('does not let stale request set the current search key', async () => {
    let calls = 0;
    let resolveFirst: (() => void) | undefined;

    setSearchServiceForTests(async (params) => {
      calls += 1;

      if (params.query === 'first' && calls === 1) {
        await new Promise<void>((resolve) => {
          resolveFirst = resolve;
        });
      }

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [{ id: params.query, name: params.query }],
      };
    });

    const firstSearch = useSearchStore.getState().search({ query: 'first' });
    await useSearchStore.getState().search({ query: 'second' });

    resolveFirst?.();
    await firstSearch;
    await useSearchStore.getState().search({ query: 'first' });

    expect(calls).toBe(3);
    expect(useSearchStore.getState()).toMatchObject({
      query: 'first',
      status: 'success',
      results: [{ id: 'first', name: 'first' }],
    });
  });

  test('coalesces duplicate in-flight searches', async () => {
    let calls = 0;
    let resolveSearch: (() => void) | undefined;

    setSearchServiceForTests(async (params) => {
      calls += 1;
      await new Promise<void>((resolve) => {
        resolveSearch = resolve;
      });

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [torrent],
      };
    });

    const firstSearch = useSearchStore.getState().search({ query: 'ubuntu' });
    const duplicateSearch = useSearchStore
      .getState()
      .search({ query: ' ubuntu ', page: 1 });

    expect(calls).toBe(1);

    resolveSearch?.();
    await Promise.all([firstSearch, duplicateSearch]);

    expect(useSearchStore.getState()).toMatchObject({
      query: 'ubuntu',
      status: 'success',
      results: [torrent],
    });
  });

  test('skips duplicate searches when params are already current', async () => {
    let calls = 0;

    setSearchServiceForTests(async (params) => {
      calls += 1;

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [torrent],
      };
    });

    await useSearchStore.getState().search({ query: 'ubuntu' });
    await useSearchStore.getState().search({ query: ' ubuntu ', page: 1 });

    expect(calls).toBe(1);
    expect(useSearchStore.getState()).toMatchObject({
      query: 'ubuntu',
      status: 'success',
      recentSearches: ['ubuntu'],
    });
  });

  test('clears current key on error so a later search can refetch', async () => {
    let calls = 0;

    setSearchServiceForTests(async (params) => {
      calls += 1;

      if (calls === 1) {
        throw new ScraperError({
          code: 'provider_unavailable',
          message: 'Provider down',
          retryable: true,
        });
      }

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [torrent],
      };
    });

    await useSearchStore.getState().search({ query: 'ubuntu' });
    await useSearchStore.getState().search({ query: 'ubuntu' });

    expect(calls).toBe(2);
    expect(useSearchStore.getState()).toMatchObject({
      status: 'success',
      results: [torrent],
    });
  });

  test('retry bypasses a successful current search skip', async () => {
    let calls = 0;

    setSearchServiceForTests(async (params) => {
      calls += 1;

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [{ id: String(calls), name: `Result ${calls}` }],
      };
    });

    await useSearchStore.getState().search({ query: 'ubuntu' });
    await useSearchStore.getState().search({ query: 'ubuntu' });

    expect(calls).toBe(1);

    await useSearchStore.getState().retry();

    expect(calls).toBe(2);
    expect(useSearchStore.getState()).toMatchObject({
      status: 'success',
      results: [{ id: '2', name: 'Result 2' }],
    });
  });

  test('uses committed query for filter, sort, and pagination changes', async () => {
    const calls: string[] = [];

    setSearchServiceForTests(async (params) => {
      calls.push(`${params.query}:${params.sort}:${params.page}`);

      return {
        query: params.query,
        page: params.page ?? 1,
        category: params.category ?? 'all',
        sort: params.sort ?? 'relevance',
        results: [torrent],
      };
    });

    await useSearchStore.getState().search({ query: 'submitted' });
    useSearchStore.getState().setInputQuery('draft');
    await useSearchStore.getState().search({ sort: 'seeders_desc', page: 2 });

    expect(calls).toEqual([
      'submitted:relevance:1',
      'submitted:seeders_desc:2',
    ]);
    expect(useSearchStore.getState()).toMatchObject({
      inputQuery: 'draft',
      query: 'submitted',
      sort: 'seeders_desc',
      page: 2,
    });
  });

  test('keeps instant searches out of the committed query and history', async () => {
    setSearchServiceForTests(async (params) => ({
      query: params.query,
      page: params.page ?? 1,
      category: params.category ?? 'all',
      sort: params.sort ?? 'relevance',
      results: [torrent],
    }));

    await useSearchStore.getState().search({ query: 'preview', commit: false });

    expect(useSearchStore.getState()).toMatchObject({
      inputQuery: 'preview',
      query: '',
      status: 'success',
      results: [torrent],
      recentSearches: [],
    });
  });

  test('input edits invalidate active requests before stale responses land', async () => {
    let resolveSearch: (() => void) | undefined;

    setSearchServiceForTests(async (params) => {
      await new Promise<void>((resolve) => {
        resolveSearch = resolve;
      });

      return {
        query: params.query,
        page: 1,
        category: 'all',
        sort: 'relevance',
        results: [{ id: 'stale', name: 'Stale' }],
      };
    });

    const activeSearch = useSearchStore
      .getState()
      .search({ query: 'stale preview', commit: false });

    useSearchStore.getState().setInputQuery('s');
    resolveSearch?.();
    await activeSearch;

    expect(useSearchStore.getState()).toMatchObject({
      inputQuery: 's',
      query: '',
      status: 'idle',
      results: [],
      recentSearches: [],
    });
  });
});
