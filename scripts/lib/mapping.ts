export type InsertArtista = {
  mbid: string;
  nombre: string;
  generos: string[];
  metadata: Record<string, unknown>;
};

export type InsertAlbum = {
  mbid: string;
  titulo: string;
  fecha_lanzamiento: string | null;
  cover_url: string | null;
  generos: string[];
  artista_id: string | null;
  metadata: Record<string, unknown>;
};

export type InsertCancion = {
  mbid: string;
  titulo: string;
  duracion_ms: number | null;
  posicion: number;
  artista_id: string | null;
  album_id: string;
};
