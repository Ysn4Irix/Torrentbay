import { TorrentCategory, TorrentSort } from '@/models/torrent';

export const SEARCH_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'movies', label: 'Movies' },
  { value: 'tv_shows', label: 'TV Shows' },
  { value: 'games', label: 'Games' },
  { value: 'music', label: 'Music' },
  { value: 'applications', label: 'Applications' },
  { value: 'anime', label: 'Anime' },
  { value: 'ebooks', label: 'Books/eBooks' },
  { value: 'other', label: 'Other' },
  { value: 'adult', label: 'Adult' },
] satisfies { value: TorrentCategory; label: string }[];

export const SEARCH_SORTS = [
  { value: 'relevance', label: 'Best match' },
  { value: 'uploaded_desc', label: 'Newest' },
  { value: 'seeders_desc', label: 'Seeders' },
  { value: 'size_desc', label: 'Size' },
] satisfies { value: TorrentSort; label: string }[];
