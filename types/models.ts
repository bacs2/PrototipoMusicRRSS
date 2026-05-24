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
