import { Torrent } from '@/models/torrent';

export async function searchTorrentsPlaceholder(
  _query: string,
): Promise<Torrent[]> {
  return [];
}
