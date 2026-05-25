export type ItemType = "artista" | "album" | "cancion";

export type DatosUsuario = {
  id: string;
  username: string;
  nombre?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

export type Artista = {
  id: string;
  mbid?: string | null;
  nombre: string;
  generos?: string[] | null;
  avatar_url?: string | null;
  bio?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type Album = {
  id: string;
  mbid?: string | null;
  artista_id?: string | null;
  titulo: string;
  fecha_lanzamiento?: string | null;
  generos?: string[] | null;
  cover_url?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type Cancion = {
  id: string;
  mbid?: string | null;
  artista_id?: string | null;
  album_id?: string | null;
  titulo: string;
  duracion_ms?: number | null;
  metadata?: Record<string, unknown> | null;
};

export type ResenaDeUsuario = {
  id: string;
  usuario_id: string;
  item_type: ItemType;
  item_id: string;
  rating: number;
  comentario?: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewShareData = {
  reviewId: string;
  itemTitle: string;
  itemSubtitle?: string | null;
  rating: number;
  comment?: string | null;
  coverUrl?: string | null;
};

export type TimelineItem = {
  id: string;
  date: string;
  user?: { name: string; avatar?: string | null } | null;
  action: string;
  description?: string | null;
};

export type RatingDistribution = {
  stars: number;
  count: number;
  percentage: number;
};

export type TrendingItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  rating?: number;
  reviewCount: number;
};

export type FriendActivityItem = {
  id: string;
  userName: string;
  userAvatar: string | null;
  action: string;
  itemTitle: string;
  itemCover: string | null;
  rating?: number;
};
