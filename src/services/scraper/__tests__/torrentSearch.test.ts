import { describe, expect, test } from 'bun:test';

import { HttpClient } from '@/services/networking/httpClient';
import { searchTorrents } from '@/services/scraper/torrentSearch';
import { ScraperError } from '@/services/scraper/scraperErrors';

const torrent = {
  id: 'tpb-1',
  name: 'Result',
};

const apiRows = [
  {
    id: '1',
    name: 'Charlie',
    info_hash: '0123456789abcdef0123456789abcdef01234567',
    leechers: '9',
    seeders: '30',
    size: '300',
    username: 'carol',
    added: '1704240000',
    status: 'member',
    category: '200',
  },
  {
    id: '2',
    name: 'Alpha',
    info_hash: 'abcdefabcdefabcdefabcdefabcdefabcdefabcd',
    leechers: '5',
    seeders: '10',
    size: '100',
    username: 'alice',
    added: '1704067200',
    status: 'trusted',
    category: '101',
  },
  {
    id: '3',
    name: 'Bravo',
    info_hash: '1111111111111111111111111111111111111111',
    leechers: '20',
    seeders: '20',
    size: '200',
    username: 'bob',
    added: '1704153600',
    status: 'vip',
    category: '201',
  },
];

describe('searchTorrents', () => {
  test('composes URL builder, HTTP client, and parser dependencies', async () => {
    const urls: string[] = [];
    const httpClient: HttpClient = {
      async get(url) {
        urls.push(url);
        return '<html>fixture</html>';
      },
    };

    const response = await searchTorrents(
      {
        query: 'ubuntu',
        page: 1,
        category: 'applications',
        sort: 'uploaded_desc',
      },
      {
        httpClient,
        parser(html) {
          expect(html).toBe('<html>fixture</html>');
          return [torrent];
        },
      },
    );

    expect(urls).toEqual(['https://apibay.org/q.php?q=ubuntu&cat=300']);
    expect(response).toEqual({
      query: 'ubuntu',
      page: 1,
      category: 'applications',
      sort: 'uploaded_desc',
      results: [torrent],
      totalResults: 1,
      pageSize: 30,
      totalPages: 1,
      hasNextPage: false,
    });
  });

  test('does not call dependencies when params are invalid', async () => {
    let called = false;

    try {
      await searchTorrents(
        { query: 'x', page: -1 },
        {
          httpClient: {
            async get() {
              called = true;
              return '';
            },
          },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ScraperError);
      expect((error as ScraperError).code).toBe('invalid_page');
      expect(called).toBe(false);
      return;
    }

    throw new Error('Expected invalid_page');
  });

  test('propagates HTTP and parser typed errors', async () => {
    const httpError = new ScraperError({
      code: 'timeout',
      message: 'Timed out',
      retryable: true,
    });

    await expect(
      searchTorrents(
        { query: 'ubuntu' },
        {
          httpClient: {
            async get() {
              throw httpError;
            },
          },
        },
      ),
    ).rejects.toBe(httpError);

    const parserError = new ScraperError({
      code: 'layout_changed',
      message: 'Changed layout',
    });

    await expect(
      searchTorrents(
        { query: 'ubuntu' },
        {
          httpClient: {
            async get() {
              return '<html></html>';
            },
          },
          parser() {
            throw parserError;
          },
        },
      ),
    ).rejects.toBe(parserError);
  });

  test('fetches and parses Apibay JSON by default', async () => {
    const urls: string[] = [];
    const httpClient: HttpClient = {
      async get() {
        throw new Error('unexpected text fetch');
      },
      async getJson(url) {
        urls.push(url);
        return apiRows;
      },
    };

    const response = await searchTorrents(
      { query: 'linux iso', category: 'all' },
      { httpClient },
    );

    expect(urls).toEqual(['https://apibay.org/q.php?q=linux+iso&cat=0']);
    expect(response.results).toHaveLength(3);
    expect(response.results[0]).toMatchObject({
      id: '1',
      name: 'Charlie',
      category: 'Video',
      size: '300 B',
      seeders: 30,
      leechers: 9,
      uploader: 'carol',
      uploaded: '2024-01-03',
    });
  });

  test('returns empty results for Apibay sentinel rows', async () => {
    const response = await searchTorrents(
      { query: 'missing' },
      {
        httpClient: {
          async get() {
            throw new Error('unexpected text fetch');
          },
          async getJson() {
            return [{ id: '0', name: 'No results returned' }];
          },
        },
      },
    );

    expect(response.results).toEqual([]);
  });

  test('paginates Apibay results app-side with 1-based public pages', async () => {
    const results = Array.from({ length: 31 }, (_, index) => ({
      id: String(index + 1),
      name: `Result ${index + 1}`,
    }));

    const response = await searchTorrents(
      { query: 'ubuntu', page: 2 },
      {
        httpClient: {
          async get() {
            return 'fixture';
          },
        },
        parser() {
          return results;
        },
      },
    );

    expect(response.page).toBe(2);
    expect(response.results).toEqual([{ id: '31', name: 'Result 31' }]);
    expect(response.totalResults).toBe(31);
    expect(response.totalPages).toBe(2);
    expect(response.hasNextPage).toBe(false);
  });

  test('filters mature parser results before paginating when disabled', async () => {
    const results = [
      ...Array.from({ length: 30 }, (_, index) => ({
        id: `adult-${index + 1}`,
        name: `Adult ${index + 1}`,
        category: 'Adult',
      })),
      { id: 'safe-1', name: 'Safe', category: 'Video' },
    ];

    const response = await searchTorrents(
      { query: 'mixed' },
      {
        showMatureCategories: false,
        httpClient: {
          async get() {
            return 'fixture';
          },
        },
        parser() {
          return results;
        },
      },
    );

    expect(response.results).toEqual([
      { id: 'safe-1', name: 'Safe', category: 'Video' },
    ]);
    expect(response.totalResults).toBe(1);
    expect(response.hasNextPage).toBe(false);
  });

  test('sorts before paginating app-side results', async () => {
    const results = Array.from({ length: 31 }, (_, index) => ({
      id: String(index + 1),
      name: `Result ${String(index + 1).padStart(2, '0')}`,
      seeders: 31 - index,
    }));

    const response = await searchTorrents(
      { query: 'ubuntu', page: 2, sort: 'seeders_asc' },
      {
        httpClient: {
          async get() {
            return 'fixture';
          },
        },
        parser() {
          return results;
        },
      },
    );

    expect(response.results).toEqual([
      { id: '1', name: 'Result 01', seeders: 31 },
    ]);
  });

  test.each([
    ['name_asc', ['Alpha', 'Bravo', 'Charlie']],
    ['name_desc', ['Charlie', 'Bravo', 'Alpha']],
    ['uploaded_desc', ['Charlie', 'Bravo', 'Alpha']],
    ['uploaded_asc', ['Alpha', 'Bravo', 'Charlie']],
    ['size_desc', ['Charlie', 'Bravo', 'Alpha']],
    ['size_asc', ['Alpha', 'Bravo', 'Charlie']],
    ['seeders_desc', ['Charlie', 'Bravo', 'Alpha']],
    ['seeders_asc', ['Alpha', 'Bravo', 'Charlie']],
    ['leechers_desc', ['Bravo', 'Charlie', 'Alpha']],
    ['leechers_asc', ['Alpha', 'Charlie', 'Bravo']],
  ] as const)('sorts Apibay results app-side by %s', async (sort, names) => {
    const response = await searchTorrents(
      { query: 'linux', sort },
      {
        httpClient: {
          async get() {
            throw new Error('unexpected text fetch');
          },
          async getJson() {
            return apiRows;
          },
        },
      },
    );

    expect(response.results.map((result) => result.name)).toEqual([...names]);
  });
});
