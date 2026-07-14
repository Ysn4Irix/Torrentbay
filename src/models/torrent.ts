export type Torrent = {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  uploaded?: string;
  size?: string;
  seeders?: number;
  leechers?: number;
  uploader?: string;
  magnet?: string;
  detailsUrl?: string;
  trusted?: boolean;
  vip?: boolean;
  description?: string;
};

export type TorrentTopLevelCategory =
  'all' | 'audio' | 'video' | 'applications' | 'games' | 'adult' | 'other';

export type TorrentSubcategory =
  'music' | 'movies' | 'tv_shows' | 'books' | 'ebooks' | 'anime';

export type TorrentCategory = TorrentTopLevelCategory | TorrentSubcategory;

export type TorrentSort =
  | 'relevance'
  | 'name_asc'
  | 'name_desc'
  | 'uploaded_desc'
  | 'uploaded_asc'
  | 'size_desc'
  | 'size_asc'
  | 'seeders_desc'
  | 'seeders_asc'
  | 'leechers_desc'
  | 'leechers_asc';

export type TorrentSearchParams = {
  query: string;
  page?: number;
  category?: TorrentCategory;
  sort?: TorrentSort;
};

export type TorrentSearchResponse = {
  query: string;
  page: number;
  category: TorrentCategory;
  sort: TorrentSort;
  results: Torrent[];
  totalResults?: number;
  pageSize?: number;
  totalPages?: number;
  hasNextPage?: boolean;
};
