import * as cheerio from 'cheerio';

import { Torrent } from '@/models/torrent';

export function parseTorrentSearchHtmlPlaceholder(html: string): Torrent[] {
  cheerio.load(html);

  return [];
}
