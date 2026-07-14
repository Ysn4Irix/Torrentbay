import { Torrent, TorrentCategory } from '@/models/torrent';

function normalizeMaturityLabel(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function isMatureCategory(category: TorrentCategory): boolean {
  return category === 'adult';
}

export function coerceMatureCategory(
  category: TorrentCategory,
  showMatureCategories: boolean,
): TorrentCategory {
  return !showMatureCategories && isMatureCategory(category) ? 'all' : category;
}

export function isMatureTorrent(
  torrent: Pick<Torrent, 'category' | 'subcategory'>,
): boolean {
  return [torrent.category, torrent.subcategory].some(
    (value) => normalizeMaturityLabel(value) === 'adult',
  );
}

export function filterMatureTorrents<
  T extends Pick<Torrent, 'category' | 'subcategory'>,
>(torrents: T[], showMatureCategories: boolean): T[] {
  return showMatureCategories
    ? torrents
    : torrents.filter((torrent) => !isMatureTorrent(torrent));
}
