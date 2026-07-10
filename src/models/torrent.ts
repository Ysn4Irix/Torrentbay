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
