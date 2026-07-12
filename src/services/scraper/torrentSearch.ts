import {
  Torrent,
  TorrentSearchParams,
  TorrentSearchResponse,
} from '@/models/torrent';
import { APIBAY_SEARCH_PAGE_SIZE } from '@/constants/pirateBay';
import {
  defaultHttpClient,
  HttpClient,
} from '@/services/networking/httpClient';
import { parseApiBaySearchJson } from '@/services/parser/apibayParser';
import {
  buildApiBaySearchUrl,
  normalizePirateBaySearchParams,
} from '@/services/scraper/pirateBayUrl';
import { ScraperError } from '@/services/scraper/scraperErrors';

type SearchTorrentsDeps = {
  httpClient?: HttpClient;
  parser?: (payload: unknown) => TorrentSearchResponse['results'];
  urlBuilder?: (params: TorrentSearchParams) => string;
};

function parseJsonText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ScraperError({
      code: 'parse_failed',
      message: 'Failed to parse provider JSON.',
      cause: error,
    });
  }
}

function parseSizeBytes(size: string | undefined): number | undefined {
  const match = size?.match(/^(\d+(?:\.\d+)?)\s*(B|KiB|MiB|GiB|TiB|PiB)$/i);

  if (!match) {
    return undefined;
  }

  const value = Number.parseFloat(match[1] ?? '');
  const units = ['b', 'kib', 'mib', 'gib', 'tib', 'pib'];
  const unitIndex = units.indexOf((match[2] ?? '').toLowerCase());

  if (!Number.isFinite(value) || unitIndex < 0) {
    return undefined;
  }

  return value * 1024 ** unitIndex;
}

function parseUploadedTime(uploaded: string | undefined): number | undefined {
  if (!uploaded) {
    return undefined;
  }

  const parsed = Date.parse(uploaded);

  return Number.isNaN(parsed) ? undefined : parsed;
}

function compareOptionalNumbers(
  left: number | undefined,
  right: number | undefined,
  direction: 'asc' | 'desc',
): number {
  if (left === undefined && right === undefined) {
    return 0;
  }

  if (left === undefined) {
    return 1;
  }

  if (right === undefined) {
    return -1;
  }

  return direction === 'asc' ? left - right : right - left;
}

function sortTorrents(
  torrents: Torrent[],
  sort: TorrentSearchResponse['sort'],
): Torrent[] {
  if (sort === 'relevance') {
    return torrents;
  }

  return torrents
    .map((torrent, index) => ({ torrent, index }))
    .sort((left, right) => {
      let comparison = 0;

      switch (sort) {
        case 'name_asc':
          comparison = left.torrent.name.localeCompare(right.torrent.name);
          break;
        case 'name_desc':
          comparison = right.torrent.name.localeCompare(left.torrent.name);
          break;
        case 'uploaded_asc':
          comparison = compareOptionalNumbers(
            parseUploadedTime(left.torrent.uploaded),
            parseUploadedTime(right.torrent.uploaded),
            'asc',
          );
          break;
        case 'uploaded_desc':
          comparison = compareOptionalNumbers(
            parseUploadedTime(left.torrent.uploaded),
            parseUploadedTime(right.torrent.uploaded),
            'desc',
          );
          break;
        case 'size_asc':
          comparison = compareOptionalNumbers(
            parseSizeBytes(left.torrent.size),
            parseSizeBytes(right.torrent.size),
            'asc',
          );
          break;
        case 'size_desc':
          comparison = compareOptionalNumbers(
            parseSizeBytes(left.torrent.size),
            parseSizeBytes(right.torrent.size),
            'desc',
          );
          break;
        case 'seeders_asc':
          comparison = compareOptionalNumbers(
            left.torrent.seeders,
            right.torrent.seeders,
            'asc',
          );
          break;
        case 'seeders_desc':
          comparison = compareOptionalNumbers(
            left.torrent.seeders,
            right.torrent.seeders,
            'desc',
          );
          break;
        case 'leechers_asc':
          comparison = compareOptionalNumbers(
            left.torrent.leechers,
            right.torrent.leechers,
            'asc',
          );
          break;
        case 'leechers_desc':
          comparison = compareOptionalNumbers(
            left.torrent.leechers,
            right.torrent.leechers,
            'desc',
          );
          break;
      }

      return comparison || left.index - right.index;
    })
    .map(({ torrent }) => torrent);
}

function paginateTorrents(torrents: Torrent[], page: number): Torrent[] {
  const start = (page - 1) * APIBAY_SEARCH_PAGE_SIZE;

  return torrents.slice(start, start + APIBAY_SEARCH_PAGE_SIZE);
}

export async function searchTorrents(
  params: TorrentSearchParams,
  deps: SearchTorrentsDeps = {},
): Promise<TorrentSearchResponse> {
  const normalizedParams = normalizePirateBaySearchParams(params);
  const url = (deps.urlBuilder ?? buildApiBaySearchUrl)(normalizedParams);
  const httpClient = deps.httpClient ?? defaultHttpClient;
  const payload = httpClient.getJson
    ? await httpClient.getJson(url)
    : deps.parser
      ? await httpClient.get(url)
      : parseJsonText(await httpClient.get(url));
  const results = (deps.parser ?? parseApiBaySearchJson)(payload);
  const sortedResults = sortTorrents(results, normalizedParams.sort);

  return {
    ...normalizedParams,
    results: paginateTorrents(sortedResults, normalizedParams.page),
  };
}
