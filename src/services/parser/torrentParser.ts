import * as cheerio from 'cheerio/slim';
import { CheerioAPI } from 'cheerio/slim';

import {
  PIRATE_BAY_BASE_URL,
  PIRATE_BAY_CATEGORY_LABEL_MAP,
  PIRATE_BAY_PARSER_IGNORE_SELECTORS,
} from '@/constants/pirateBay';
import { Torrent } from '@/models/torrent';
import { ScraperError } from '@/services/scraper/scraperErrors';

const EMPTY_RESULT_PATTERN =
  /\b(no hits|no results|nothing found|0 torrents)\b/i;
const RESULT_CONTAINER_SELECTOR = [
  '#searchResult',
  '.search-results',
  '[data-testid="torrent-results"]',
].join(', ');
const RESULT_ROW_SELECTOR = [
  'table#searchResult > tbody > tr',
  'table#searchResult > tr',
  '.search-result',
  '.list-entry',
  '[data-testid="torrent-result"]',
  'li.torrent-result',
].join(', ');

type TorrentRow = ReturnType<CheerioAPI>;
type TorrentRowElement = Parameters<CheerioAPI>[0];

function sanitizeText(value: string | undefined): string | undefined {
  const sanitized = value
    ?.replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized || undefined;
}

function parseInteger(value: string | undefined): number | undefined {
  const sanitized = sanitizeText(value);

  if (!sanitized) {
    return undefined;
  }

  if (!/^(?:\d+|\d{1,3}(?:[,\s]\d{3})+)$/.test(sanitized)) {
    return undefined;
  }

  const normalized = sanitized.replace(/[,\s]/g, '');

  const parsed = Number.parseInt(normalized, 10);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeProviderUrl(value: string | undefined): string | undefined {
  const sanitized = sanitizeText(value);

  if (!sanitized) {
    return undefined;
  }

  try {
    const url = new URL(sanitized, PIRATE_BAY_BASE_URL);
    const baseUrl = new URL(PIRATE_BAY_BASE_URL);

    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.hostname !== baseUrl.hostname
    ) {
      return undefined;
    }

    if (!/^\/(torrent|description\.php)\b/i.test(url.pathname)) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function normalizeMagnet(value: string | undefined): string | undefined {
  const sanitized = sanitizeText(value);

  if (!sanitized || !sanitized.startsWith('magnet:?')) {
    return undefined;
  }

  try {
    const magnet = new URL(sanitized);
    const infoHash = magnet.searchParams.get('xt');

    if (
      !infoHash ||
      !/^urn:btih:(?:[a-f0-9]{40}|[a-z2-7]{32})$/i.test(infoHash)
    ) {
      return undefined;
    }

    return sanitized;
  } catch {
    return undefined;
  }
}

function idFromDetailsUrl(detailsUrl: string | undefined): string | undefined {
  if (!detailsUrl) {
    return undefined;
  }

  const url = new URL(detailsUrl);
  const pathMatch = url.pathname.match(/\/torrent\/(\d+)/i);
  const queryId = url.searchParams.get('id');
  const id = pathMatch?.[1] ?? queryId ?? undefined;

  return id ? `tpb-${id}` : undefined;
}

function idFromMagnet(magnet: string | undefined): string | undefined {
  if (!magnet) {
    return undefined;
  }

  const infoHash = new URL(magnet).searchParams
    .get('xt')
    ?.replace(/^urn:btih:/i, '');

  return infoHash ? `btih-${infoHash.toLowerCase()}` : undefined;
}

function firstText(row: TorrentRow, selector: string): string | undefined {
  return sanitizeText(row.find(selector).first().text());
}

function extractName(row: TorrentRow): string | undefined {
  return (
    firstText(row, '.detLink, [data-testid="torrent-name"]') ??
    sanitizeText(
      row
        .find('a[href*="/torrent/"], a[href*="/description.php"]')
        .first()
        .text(),
    )
  );
}

function extractDetailsUrl(row: TorrentRow): string | undefined {
  const href = row
    .find(
      '.detLink[href], [data-testid="torrent-name"][href], a[href*="/torrent/"], a[href*="/description.php"]',
    )
    .first()
    .attr('href');

  return normalizeProviderUrl(href);
}

function extractMagnet(row: TorrentRow): string | undefined {
  const href = row.find('a[href^="magnet:?"]').first().attr('href');

  return normalizeMagnet(href);
}

function browseCodeFromHref(value: string | undefined): string | undefined {
  const href = sanitizeText(value);

  return href?.match(/\/browse\/(\d{1,3})(?:\b|[/?#])/i)?.[1];
}

function categoryFromBrowseCode(
  code: string | undefined,
): Pick<Torrent, 'category' | 'subcategory'> | undefined {
  if (!code || !(code in PIRATE_BAY_CATEGORY_LABEL_MAP)) {
    return undefined;
  }

  return PIRATE_BAY_CATEGORY_LABEL_MAP[
    code as keyof typeof PIRATE_BAY_CATEGORY_LABEL_MAP
  ];
}

function extractCategory(
  row: TorrentRow,
): Pick<Torrent, 'category' | 'subcategory'> {
  const categoryLinks = row.find('.vertTh a, .category a, a[href*="/browse/"]');
  const labelsFromHref = categoryLinks
    .toArray()
    .map((element) =>
      categoryFromBrowseCode(
        browseCodeFromHref(row.find(element).attr('href')),
      ),
    )
    .filter((labels): labels is Pick<Torrent, 'category' | 'subcategory'> =>
      Boolean(labels),
    );
  const subcategoryLabels = labelsFromHref.find((labels) => labels.subcategory);

  if (subcategoryLabels) {
    return subcategoryLabels;
  }

  if (labelsFromHref[0]) {
    return labelsFromHref[0];
  }

  return {
    category: sanitizeText(categoryLinks.eq(0).text()),
    subcategory: sanitizeText(categoryLinks.eq(1).text()),
  };
}

function extractDescription(row: TorrentRow): string | undefined {
  return (
    firstText(row, '.detDesc, [data-testid="torrent-description"]') ??
    sanitizeText(row.find('font').first().text())
  );
}

function extractUploaded(description: string | undefined): string | undefined {
  return sanitizeText(description?.match(/Uploaded\s+([^,]+?)(?:,|$)/i)?.[1]);
}

function extractSize(description: string | undefined): string | undefined {
  const size = sanitizeText(description?.match(/Size\s+([^,]+?)(?:,|$)/i)?.[1]);

  if (!size) {
    return undefined;
  }

  return /^\d+(?:[.,]\d+)?\s*(?:B|KiB|MiB|GiB|TiB|PiB|KB|MB|GB|TB|PB)$/i.test(
    size,
  )
    ? size
    : undefined;
}

function extractUploader(
  row: TorrentRow,
  description: string | undefined,
): string | undefined {
  return (
    sanitizeText(row.find('a[href*="/user/"]').first().text()) ??
    sanitizeText(description?.match(/ULed by\s+([^,]+?)(?:,|$)/i)?.[1])
  );
}

function extractTrailingIntegerCell(
  row: TorrentRow,
  offsetFromEnd: number,
): number | undefined {
  const numericCells = row
    .find('td')
    .toArray()
    .map((cell) => parseInteger(row.find(cell).text()))
    .filter((value): value is number => value !== undefined);

  return numericCells[numericCells.length - 1 - offsetFromEnd];
}

function extractSeeders(row: TorrentRow): number | undefined {
  return (
    parseInteger(
      row.find('.seeders, [data-testid="seeders"]').first().text(),
    ) ?? extractTrailingIntegerCell(row, 1)
  );
}

function extractLeechers(row: TorrentRow): number | undefined {
  return (
    parseInteger(
      row.find('.leechers, [data-testid="leechers"]').first().text(),
    ) ?? extractTrailingIntegerCell(row, 0)
  );
}

function extractBadges(row: TorrentRow): Pick<Torrent, 'trusted' | 'vip'> {
  const badgeText = [
    row.attr('class'),
    row
      .find('[alt], [title], [class]')
      .toArray()
      .map((element) => {
        const node = row.find(element);

        return [node.attr('alt'), node.attr('title'), node.attr('class')].join(
          ' ',
        );
      }),
  ]
    .flat()
    .join(' ');

  return {
    trusted: /\btrusted\b/i.test(badgeText),
    vip: /\bvip\b/i.test(badgeText),
  };
}

function isIgnoredRow(row: TorrentRow): boolean {
  return /\b(ad|ads|sponsor|promo|banner|tracker)\b/i.test(
    [row.attr('id'), row.attr('class')].join(' '),
  );
}

function parseRow(
  $: CheerioAPI,
  rowElement: TorrentRowElement,
): Torrent | undefined {
  const row = $(rowElement);

  if (isIgnoredRow(row)) {
    return undefined;
  }

  const name = extractName(row);
  const detailsUrl = extractDetailsUrl(row);
  const magnet = extractMagnet(row);
  const id = idFromDetailsUrl(detailsUrl) ?? idFromMagnet(magnet);

  if (!id || !name) {
    return undefined;
  }

  const description = extractDescription(row);
  const categories = extractCategory(row);
  const badges = extractBadges(row);

  return {
    id,
    name,
    ...categories,
    uploaded: extractUploaded(description),
    size: extractSize(description),
    seeders: extractSeeders(row),
    leechers: extractLeechers(row),
    uploader: extractUploader(row, description),
    magnet,
    detailsUrl,
    ...badges,
    description,
  };
}

export function parseTorrentSearchHtml(html: string): Torrent[] {
  if (!html.trim()) {
    throw new ScraperError({
      code: 'invalid_html',
      message: 'Cannot parse an empty HTML document.',
    });
  }

  try {
    const $ = cheerio.load(html);

    $(PIRATE_BAY_PARSER_IGNORE_SELECTORS.join(', ')).remove();

    const bodyText = sanitizeText($('body').text()) ?? '';
    const hasKnownEmptyResult = EMPTY_RESULT_PATTERN.test(bodyText);

    if (hasKnownEmptyResult) {
      return [];
    }

    const rows = $(RESULT_ROW_SELECTOR).toArray();

    if (rows.length === 0) {
      if ($(RESULT_CONTAINER_SELECTOR).length > 0) {
        throw new ScraperError({
          code: 'layout_changed',
          message:
            'The provider search result container layout was not recognized.',
        });
      }

      throw new ScraperError({
        code: 'layout_changed',
        message: 'The provider search result layout was not recognized.',
      });
    }

    const torrents = rows
      .map((row) => parseRow($, row))
      .filter((torrent): torrent is Torrent => Boolean(torrent));

    if (torrents.length === 0) {
      throw new ScraperError({
        code: 'layout_changed',
        message:
          'The provider search result rows did not contain torrent metadata.',
      });
    }

    return torrents;
  } catch (error) {
    if (error instanceof ScraperError) {
      throw error;
    }

    throw new ScraperError({
      code: 'parse_failed',
      message: 'Failed to parse provider HTML.',
      cause: error,
    });
  }
}
