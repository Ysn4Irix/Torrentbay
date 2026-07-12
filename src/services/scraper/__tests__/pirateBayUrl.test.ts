import { describe, expect, test } from 'bun:test';

import {
  buildApiBaySearchUrl,
  buildPirateBaySearchUrl,
} from '@/services/scraper/pirateBayUrl';
import { ScraperError } from '@/services/scraper/scraperErrors';

function expectScraperCode(fn: () => unknown, code: ScraperError['code']) {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ScraperError);
    expect((error as ScraperError).code).toBe(code);
    return;
  }

  throw new Error(`Expected scraper error code ${code}`);
}

describe('buildPirateBaySearchUrl', () => {
  test('builds a default search URL with encoded query', () => {
    expect(buildPirateBaySearchUrl({ query: 'ubuntu iso' })).toBe(
      'https://thepiratebay.org/search/ubuntu%20iso/0/99/0',
    );
  });

  test('supports category, pagination, and sort mappings', () => {
    expect(
      buildPirateBaySearchUrl({
        query: 'linux',
        page: 3,
        category: 'video',
        sort: 'seeders_desc',
      }),
    ).toBe('https://thepiratebay.org/search/linux/2/7/200');
  });

  test('supports PRD subcategory mappings while preserving top-level categories', () => {
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'music' })).toBe(
      'https://thepiratebay.org/search/x/0/99/101',
    );
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'movies' })).toBe(
      'https://thepiratebay.org/search/x/0/99/201',
    );
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'tv_shows' })).toBe(
      'https://thepiratebay.org/search/x/0/99/205',
    );
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'books' })).toBe(
      'https://thepiratebay.org/search/x/0/99/601',
    );
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'ebooks' })).toBe(
      'https://thepiratebay.org/search/x/0/99/601',
    );
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'anime' })).toBe(
      'https://thepiratebay.org/search/x/0/99/200',
    );
    expect(buildPirateBaySearchUrl({ query: 'x', category: 'audio' })).toBe(
      'https://thepiratebay.org/search/x/0/99/100',
    );
  });

  test('encodes URL-looking queries as path data', () => {
    const url = buildPirateBaySearchUrl({ query: 'https://evil.test/?q=x' });

    expect(url).toBe(
      'https://thepiratebay.org/search/https%3A%2F%2Fevil.test%2F%3Fq%3Dx/0/99/0',
    );
  });

  test('rejects invalid inputs with typed errors', () => {
    expectScraperCode(
      () => buildPirateBaySearchUrl({ query: '   ' }),
      'empty_query',
    );
    expectScraperCode(
      () => buildPirateBaySearchUrl({ query: 'x', page: 0 }),
      'invalid_page',
    );
    expectScraperCode(
      () =>
        buildPirateBaySearchUrl({
          query: 'x',
          category: 'documentaries' as never,
        }),
      'invalid_category',
    );
    expectScraperCode(
      () =>
        buildPirateBaySearchUrl({
          query: 'x',
          sort: 'newest' as never,
        }),
      'invalid_sort',
    );
  });
});

describe('buildApiBaySearchUrl', () => {
  test('builds an Apibay q.php URL with encoded query and all category', () => {
    expect(buildApiBaySearchUrl({ query: '  ubuntu iso  ' })).toBe(
      'https://apibay.org/q.php?q=ubuntu+iso&cat=0',
    );
  });

  test('uses existing TPB numeric category mappings and ignores pagination/sort in URL', () => {
    expect(
      buildApiBaySearchUrl({
        query: 'linux',
        page: 3,
        category: 'video',
        sort: 'seeders_desc',
      }),
    ).toBe('https://apibay.org/q.php?q=linux&cat=200');
  });

  test('encodes URL-looking queries as query data', () => {
    expect(buildApiBaySearchUrl({ query: 'https://evil.test/?q=x' })).toBe(
      'https://apibay.org/q.php?q=https%3A%2F%2Fevil.test%2F%3Fq%3Dx&cat=0',
    );
  });

  test('rejects invalid inputs with typed errors', () => {
    expectScraperCode(
      () => buildApiBaySearchUrl({ query: '   ' }),
      'empty_query',
    );
    expectScraperCode(
      () => buildApiBaySearchUrl({ query: 'x', page: 0 }),
      'invalid_page',
    );
    expectScraperCode(
      () =>
        buildApiBaySearchUrl({
          query: 'x',
          category: 'documentaries' as never,
        }),
      'invalid_category',
    );
    expectScraperCode(
      () =>
        buildApiBaySearchUrl({
          query: 'x',
          sort: 'newest' as never,
        }),
      'invalid_sort',
    );
  });
});
