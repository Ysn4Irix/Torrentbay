import {
  APIBAY_BASE_URL,
  PIRATE_BAY_BASE_URL,
  PIRATE_BAY_CATEGORY_MAP,
  PIRATE_BAY_SORT_MAP,
} from '@/constants/pirateBay';
import {
  TorrentCategory,
  TorrentSearchParams,
  TorrentSort,
} from '@/models/torrent';
import { ScraperError } from '@/services/scraper/scraperErrors';

const DEFAULT_CATEGORY: TorrentCategory = 'all';
const DEFAULT_SORT: TorrentSort = 'relevance';
const DEFAULT_PAGE = 1;

export type NormalizedPirateBaySearchParams = Required<TorrentSearchParams>;

export function normalizePirateBaySearchParams(
  params: TorrentSearchParams,
): NormalizedPirateBaySearchParams {
  const query = params.query.trim();

  if (!query) {
    throw new ScraperError({
      code: 'empty_query',
      message: 'Search query cannot be empty.',
    });
  }

  const page = params.page ?? DEFAULT_PAGE;

  if (!Number.isInteger(page) || page < 1) {
    throw new ScraperError({
      code: 'invalid_page',
      message: 'Search page must be a positive integer.',
    });
  }

  const category = params.category ?? DEFAULT_CATEGORY;

  if (!(category in PIRATE_BAY_CATEGORY_MAP)) {
    throw new ScraperError({
      code: 'invalid_category',
      message: 'Unsupported Pirate Bay category.',
    });
  }

  const sort = params.sort ?? DEFAULT_SORT;

  if (!(sort in PIRATE_BAY_SORT_MAP)) {
    throw new ScraperError({
      code: 'invalid_sort',
      message: 'Unsupported Pirate Bay sort.',
    });
  }

  return { query, page, category, sort };
}

export function buildPirateBaySearchUrl(params: TorrentSearchParams): string {
  const normalized = normalizePirateBaySearchParams(params);
  const categoryCode = PIRATE_BAY_CATEGORY_MAP[normalized.category];
  const sortCode = PIRATE_BAY_SORT_MAP[normalized.sort];
  const providerPage = normalized.page - 1;
  const encodedQuery = encodeURIComponent(normalized.query);
  const url = new URL(
    `/search/${encodedQuery}/${providerPage}/${sortCode}/${categoryCode}`,
    PIRATE_BAY_BASE_URL,
  );

  return url.toString();
}

export function buildApiBaySearchUrl(params: TorrentSearchParams): string {
  const normalized = normalizePirateBaySearchParams(params);
  const url = new URL('/q.php', APIBAY_BASE_URL);

  url.searchParams.set('q', normalized.query);
  url.searchParams.set('cat', PIRATE_BAY_CATEGORY_MAP[normalized.category]);

  return url.toString();
}
