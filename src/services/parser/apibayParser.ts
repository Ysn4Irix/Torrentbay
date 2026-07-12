import {
  PIRATE_BAY_BASE_URL,
  PIRATE_BAY_CATEGORY_LABEL_MAP,
} from '@/constants/pirateBay';
import { Torrent } from '@/models/torrent';
import { ScraperError } from '@/services/scraper/scraperErrors';

type ApiBayRecord = {
  id?: unknown;
  name?: unknown;
  info_hash?: unknown;
  leechers?: unknown;
  seeders?: unknown;
  num_files?: unknown;
  size?: unknown;
  username?: unknown;
  added?: unknown;
  status?: unknown;
  category?: unknown;
  imdb?: unknown;
};

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return undefined;
  }

  const sanitized = String(value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized || undefined;
}

function parseInteger(value: unknown): number | undefined {
  const sanitized = sanitizeText(value);

  if (!sanitized || !/^\d+$/.test(sanitized)) {
    return undefined;
  }

  const parsed = Number.parseInt(sanitized, 10);

  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function normalizeInfoHash(value: unknown): string | undefined {
  const hash = sanitizeText(value)?.toLowerCase();

  if (!hash || !/^(?:[a-f0-9]{40}|[a-z2-7]{32})$/.test(hash)) {
    return undefined;
  }

  return hash;
}

function formatByteSize(bytes: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 2;
  const formatted = value
    .toFixed(precision)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1');

  return `${formatted} ${units[unitIndex]}`;
}

function parseSize(value: unknown): string | undefined {
  const bytes = parseInteger(value);

  return bytes === undefined ? undefined : formatByteSize(bytes);
}

function parseUploaded(value: unknown): string | undefined {
  const raw = sanitizeText(value);

  if (!raw) {
    return undefined;
  }

  const numeric = /^\d+$/.test(raw) ? Number.parseInt(raw, 10) : undefined;
  const timestamp =
    numeric === undefined
      ? Date.parse(raw)
      : numeric < 10_000_000_000
        ? numeric * 1000
        : numeric;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toISOString().slice(0, 10);
}

function parseCategory(
  value: unknown,
): Pick<Torrent, 'category' | 'subcategory'> | undefined {
  const code = sanitizeText(value);

  if (!code || !(code in PIRATE_BAY_CATEGORY_LABEL_MAP)) {
    return undefined;
  }

  return PIRATE_BAY_CATEGORY_LABEL_MAP[
    code as keyof typeof PIRATE_BAY_CATEGORY_LABEL_MAP
  ];
}

function buildMagnet(infoHash: string, name: string): string {
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}`;
}

function buildDetailsUrl(id: string | undefined): string | undefined {
  if (!id || !/^\d+$/.test(id)) {
    return undefined;
  }

  const url = new URL('/description.php', PIRATE_BAY_BASE_URL);

  url.searchParams.set('id', id);

  return url.toString();
}

function parseRecord(record: ApiBayRecord): Torrent | undefined {
  const id = sanitizeText(record.id);
  const name = sanitizeText(record.name);

  if (id === '0' || name === 'No results returned') {
    return undefined;
  }

  const infoHash = normalizeInfoHash(record.info_hash);
  const size = parseSize(record.size);

  if (!name || !infoHash || !size) {
    return undefined;
  }

  const status = sanitizeText(record.status)?.toLowerCase();
  const stableId = id && id !== '0' ? id : `btih-${infoHash}`;
  const categories = parseCategory(record.category);

  return {
    id: stableId,
    name,
    ...categories,
    uploaded: parseUploaded(record.added),
    size,
    seeders: parseInteger(record.seeders),
    leechers: parseInteger(record.leechers),
    uploader: sanitizeText(record.username),
    magnet: buildMagnet(infoHash, name),
    detailsUrl: buildDetailsUrl(id),
    trusted: status === 'trusted' || status === 'vip',
    vip: status === 'vip',
  };
}

export function parseApiBaySearchJson(payload: unknown): Torrent[] {
  if (!Array.isArray(payload)) {
    throw new ScraperError({
      code: 'parse_failed',
      message: 'Provider JSON search response was not an array.',
    });
  }

  return payload
    .map((record) =>
      record && typeof record === 'object'
        ? parseRecord(record as ApiBayRecord)
        : undefined,
    )
    .filter((torrent): torrent is Torrent => Boolean(torrent));
}
