import { supabaseServer } from "../lib/supabase/server";
import type { ItemType } from "../types/models";

export type FeedItem = {
  id: string;
  username: string;
  itemType: ItemType;
  itemTitle: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export const getFeedReviews = async (userId?: string) => {
  if (!userId) {
    return { items: [], message: "No se pudo identificar al usuario." };
  }

  const supabase = supabaseServer();

  const { data: following } = await supabase
    .from("Seguidores_por_usuario")
    .select("seguido_id")
    .eq("seguidor_id", userId);

  const followedIds = (following ?? []).map((row) => row.seguido_id);
  if (followedIds.length === 0) {
    return { items: [], message: "Aun no sigues a nadie." };
  }

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("id, rating, comentario, item_type, item_id, created_at, usuario:Datos_usuario(username)")
    .in("usuario_id", followedIds)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!reviews) {
    return { items: [], message: "Sin reseñas." };
  }

  const items = await Promise.all(
    reviews.map(async (review) => {
      const itemTitle = await getItemTitle(review.item_type, review.item_id);

      return {
        id: review.id,
        username: review.usuario?.[0]?.username ?? "usuario",
        itemType: review.item_type,
        itemTitle,
        rating: review.rating,
        comment: review.comentario,
        createdAt: review.created_at,
      };
    })
  );

  return { items, message: items.length ? null : "Sin reseñas." };
};

export const getItemDetails = async (type: ItemType, id: string) => {
  const supabase = supabaseServer();

  if (type === "album") {
    const { data } = await supabase
      .from("Albumes")
      .select("id, titulo, cover_url, fecha_lanzamiento, generos, Artistas(nombre)")
      .eq("id", id)
      .single();

    return data;
  }

  if (type === "artista") {
    const { data } = await supabase
      .from("Artistas")
      .select("id, nombre, generos, avatar_url, bio, metadata")
      .eq("id", id)
      .single();

    return data;
  }

  const { data } = await supabase
    .from("Canciones")
    .select("id, titulo, duracion_ms, Albumes(titulo), Artistas(nombre)")
    .eq("id", id)
    .single();

  return data;
};

export const getAlbumTracks = async (albumId: string) => {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("Canciones")
    .select("id, titulo, duracion_ms, posicion")
    .eq("album_id", albumId)
    .order("posicion", { ascending: true });

  return data ?? [];
};

export const getArtistAlbums = async (artistId: string) => {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("Albumes")
    .select("id, titulo, cover_url, fecha_lanzamiento, generos")
    .eq("artista_id", artistId)
    .order("fecha_lanzamiento", { ascending: false, nullsFirst: false });

  return data ?? [];
};

export type TopRatedAlbum = {
  id: string;
  titulo: string;
  cover_url: string | null;
  fecha_lanzamiento: string | null;
  avgRating: number;
  reviewCount: number;
};

export const getArtistTopRatedAlbums = async (
  artistId: string,
  limit = 5
): Promise<TopRatedAlbum[]> => {
  const supabase = supabaseServer();

  const { data: albums } = await supabase
    .from("Albumes")
    .select("id, titulo, cover_url, fecha_lanzamiento")
    .eq("artista_id", artistId);

  if (!albums || albums.length === 0) return [];

  const albumIds = albums.map((a) => a.id);

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("item_id, rating")
    .eq("item_type", "album")
    .in("item_id", albumIds);

  const ratingMap = new Map<string, { sum: number; count: number }>();
  for (const r of reviews ?? []) {
    const entry = ratingMap.get(r.item_id) ?? { sum: 0, count: 0 };
    entry.sum += Number(r.rating);
    entry.count += 1;
    ratingMap.set(r.item_id, entry);
  }

  const rated = albums
    .filter((a) => ratingMap.has(a.id))
    .map((a) => ({
      id: a.id,
      titulo: a.titulo,
      cover_url: a.cover_url,
      fecha_lanzamiento: a.fecha_lanzamiento,
      avgRating: ratingMap.get(a.id)!.sum / ratingMap.get(a.id)!.count,
      reviewCount: ratingMap.get(a.id)!.count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, limit);

  return rated;
};

export const getItemReviews = async (type: ItemType, id: string) => {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("Resenas_de_usuario")
    .select("id, rating, comentario, created_at, usuario:Datos_usuario(username)")
    .eq("item_type", type)
    .eq("item_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
};

export type ProfileReview = {
  id: string;
  rating: number;
  comment?: string | null;
  itemType: ItemType;
  itemTitle: string;
  itemId: string;
  createdAt: string;
};

export const getProfileByUsername = async (username: string) => {
  const supabase = supabaseServer();
  const { data: profile } = await supabase
    .from("Datos_usuario")
    .select("id, username, nombre, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) {
    return { profile: null, reviews: [] };
  }

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("id, rating, comentario, item_type, item_id, created_at")
    .eq("usuario_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const items: ProfileReview[] = await Promise.all(
    (reviews ?? []).map(async (review) => {
      const itemTitle = await getItemTitle(review.item_type, review.item_id);

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comentario,
        itemType: review.item_type,
        itemTitle,
        itemId: review.item_id,
        createdAt: review.created_at,
      };
    })
  );

  return { profile, reviews: items };
};

export type UserTopAlbum = {
  id: string;
  titulo: string;
  cover_url: string | null;
  fecha_lanzamiento: string | null;
  userRating: number;
};

export const getUserTopAlbums = async (
  userId: string,
  limit = 8
): Promise<UserTopAlbum[]> => {
  const supabase = supabaseServer();

  const { data: albumReviews } = await supabase
    .from("Resenas_de_usuario")
    .select("id, rating, item_id, created_at")
    .eq("usuario_id", userId)
    .eq("item_type", "album")
    .order("rating", { ascending: false })
    .limit(limit);

  if (!albumReviews || albumReviews.length === 0) return [];

  const albumIds = [...new Set(albumReviews.map((r) => r.item_id))];

  const { data: albums } = await supabase
    .from("Albumes")
    .select("id, titulo, cover_url, fecha_lanzamiento")
    .in("id", albumIds);

  if (!albums) return [];

  const ratingMap = new Map<string, number>();
  for (const r of albumReviews) {
    if (!ratingMap.has(r.item_id)) {
      ratingMap.set(r.item_id, r.rating);
    }
  }

  return albums
    .filter((a) => ratingMap.has(a.id))
    .map((a) => ({
      id: a.id,
      titulo: a.titulo,
      cover_url: a.cover_url,
      fecha_lanzamiento: a.fecha_lanzamiento,
      userRating: ratingMap.get(a.id)!,
    }))
    .sort((a, b) => b.userRating - a.userRating)
    .slice(0, limit);
};

export type UserStats = {
  albums: number;
  reviews: number;
  followers: number;
  hours: number;
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const supabase = supabaseServer();

  const { count: albumReviewsCount } = await supabase
    .from("Resenas_de_usuario")
    .select("item_id", { count: "exact", head: true })
    .eq("usuario_id", userId)
    .eq("item_type", "album");

  const { count: totalReviews } = await supabase
    .from("Resenas_de_usuario")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", userId);

  const { count: followersCount } = await supabase
    .from("Seguidores_por_usuario")
    .select("id", { count: "exact", head: true })
    .eq("seguido_id", userId);

  const { data: history } = await supabase
    .from("Historial_de_reproduccion")
    .select("reproducido_en")
    .eq("usuario_id", userId);

  const hours =
    history && history.length > 0
      ? Math.round(history.length * 0.05 * 10) / 10
      : 0;

  return {
    albums: albumReviewsCount ?? 0,
    reviews: totalReviews ?? 0,
    followers: followersCount ?? 0,
    hours,
  };
};

export const getLibrarySummary = async (userId?: string) => {
  if (!userId) {
    return { collections: 0, wishlist: 0, history: 0 };
  }

  const supabase = supabaseServer();

  const [{ count: collections }, { count: wishlist }, { count: history }] =
    await Promise.all([
      supabase
        .from("Coleccion_o_Lista")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", userId),
      supabase
        .from("Wishlist")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", userId),
      supabase
        .from("Historial_de_reproduccion")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", userId),
    ]);

  return {
    collections: collections ?? 0,
    wishlist: wishlist ?? 0,
    history: history ?? 0,
  };
};

const getItemTitle = async (type: ItemType, id: string) => {
  const supabase = supabaseServer();

  if (type === "album") {
    const { data } = await supabase
      .from("Albumes")
      .select("titulo")
      .eq("id", id)
      .single();
    return data?.titulo ?? "Album";
  }

  if (type === "artista") {
    const { data } = await supabase
      .from("Artistas")
      .select("nombre")
      .eq("id", id)
      .single();
    return data?.nombre ?? "Artista";
  }

  const { data } = await supabase
    .from("Canciones")
    .select("titulo")
    .eq("id", id)
    .single();
  return data?.titulo ?? "Cancion";
};

export type GenreCount = {
  genre: string;
  count: number;
};

export const getUserTopGenres = async (userId: string, limit = 6): Promise<GenreCount[]> => {
  const supabase = supabaseServer();

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("item_type, item_id")
    .eq("usuario_id", userId);

  if (!reviews || reviews.length === 0) return [];

  const albumIds = reviews.filter((r) => r.item_type === "album").map((r) => r.item_id);
  const artistIds = reviews.filter((r) => r.item_type === "artista").map((r) => r.item_id);
  const songIds = reviews.filter((r) => r.item_type === "cancion").map((r) => r.item_id);

  const [albumsRes, artistsRes, songsRes] = await Promise.all([
    albumIds.length > 0
      ? supabase.from("Albumes").select("generos").in("id", albumIds)
      : Promise.resolve({ data: [] as { generos: string[] | null }[] }),
    artistIds.length > 0
      ? supabase.from("Artistas").select("generos").in("id", artistIds)
      : Promise.resolve({ data: [] as { generos: string[] | null }[] }),
    songIds.length > 0
      ? supabase.from("Canciones").select("album_id").in("id", songIds)
      : Promise.resolve({ data: [] as { album_id: string | null }[] }),
  ]);

  const songAlbumIds = (songsRes.data ?? [])
    .map((s) => s.album_id)
    .filter((id): id is string => id !== null);

  const songAlbumsRes =
    songAlbumIds.length > 0
      ? await supabase.from("Albumes").select("generos").in("id", songAlbumIds)
      : { data: [] as { generos: string[] | null }[] };

  const freqMap = new Map<string, number>();
  const addGenres = (rows: { generos: string[] | null }[] | null) => {
    for (const row of rows ?? []) {
      for (const g of row.generos ?? []) {
        if (g) freqMap.set(g, (freqMap.get(g) ?? 0) + 1);
      }
    }
  };

  addGenres(albumsRes.data as { generos: string[] | null }[]);
  addGenres(artistsRes.data as { generos: string[] | null }[]);
  addGenres(songAlbumsRes.data as { generos: string[] | null }[]);

  return [...freqMap.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export type RatingBucket = {
  displayValue: number; // 0.5 – 5 in 0.5 steps
  dbValue: number;      // 1 – 10
  count: number;
};

export const getUserRatingDistribution = async (userId: string): Promise<RatingBucket[]> => {
  const supabase = supabaseServer();

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("rating")
    .eq("usuario_id", userId);

  const countMap = new Map<number, number>();
  for (const r of reviews ?? []) {
    const v = Number(r.rating);
    countMap.set(v, (countMap.get(v) ?? 0) + 1);
  }

  // Build all 10 buckets from high to low (5★ first)
  return Array.from({ length: 10 }, (_, i) => {
    const dbValue = 10 - i;
    return {
      displayValue: dbValue / 2,
      dbValue,
      count: countMap.get(dbValue) ?? 0,
    };
  });
};

export type ActivityDay = {
  date: string;
  count: number;
};

export const getUserActivityHeatmap = async (userId: string): Promise<ActivityDay[]> => {
  const supabase = supabaseServer();

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("created_at")
    .eq("usuario_id", userId)
    .gte("created_at", since.toISOString());

  const countMap = new Map<string, number>();
  for (const review of reviews ?? []) {
    const date = review.created_at.slice(0, 10);
    countMap.set(date, (countMap.get(date) ?? 0) + 1);
  }

  const days: ActivityDay[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
  }

  return days;
};

export type SearchResultItem = {
  id: string;
  titulo: string;
  cover_url: string | null;
  fecha_lanzamiento: string | null;
  artista_nombre: string | null;
};

export type SearchResults = {
  artists: {
    id: string;
    nombre: string;
    avatar_url: string | null;
    generos: string[] | null;
  }[];
  albums: SearchResultItem[];
  songs: {
    id: string;
    titulo: string;
    duracion_ms: number | null;
    album_titulo: string | null;
    artista_nombre: string | null;
  }[];
};

export const searchItems = async (term: string): Promise<SearchResults> => {
  const supabase = supabaseServer();

  const sanitized = term.trim().replace(/[%_]/g, "");

  if (!sanitized) {
    return { artists: [], albums: [], songs: [] };
  }

  const likePattern = `%${sanitized}%`;

  const [artistsRes, albumsRes, songsRes] = await Promise.all([
    supabase
      .from("Artistas")
      .select("id, nombre, avatar_url, generos")
      .ilike("nombre", likePattern)
      .limit(20),
    supabase
      .from("Albumes")
      .select(
        "id, titulo, cover_url, fecha_lanzamiento, Artistas!inner(nombre)"
      )
      .ilike("titulo", likePattern)
      .limit(20),
    supabase
      .from("Canciones")
      .select(
        "id, titulo, duracion_ms, Albumes!left(titulo), Artistas!left(nombre)"
      )
      .ilike("titulo", likePattern)
      .limit(20),
  ]);

  const artists = artistsRes.data ?? [];
  const albums =
    albumsRes.data?.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      cover_url: a.cover_url,
      fecha_lanzamiento: a.fecha_lanzamiento,
      artista_nombre: (a.Artistas as { nombre: string }[])?.[0]?.nombre ?? null,
    })) ?? [];
  const songs =
    songsRes.data?.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      duracion_ms: s.duracion_ms,
      album_titulo: (s.Albumes as { titulo: string }[])?.[0]?.titulo ?? null,
      artista_nombre: (s.Artistas as { nombre: string }[])?.[0]?.nombre ?? null,
    })) ?? [];

  return { artists, albums, songs };
};

export type LibraryItem = {
  reviewId: string;
  itemId: string;
  itemType: ItemType;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  rating: number;
  createdAt: string;
};

export type UserCollection = {
  id: string;
  nombre: string;
  descripcion: string | null;
  items: unknown[];
};

export const getUserRankedItems = async (
  userId: string,
  itemType: ItemType
): Promise<LibraryItem[]> => {
  const supabase = supabaseServer();

  const { data: reviews } = await supabase
    .from("Resenas_de_usuario")
    .select("id, rating, created_at, item_id")
    .eq("usuario_id", userId)
    .eq("item_type", itemType)
    .order("created_at", { ascending: false });

  if (!reviews || reviews.length === 0) return [];

  const itemIds = reviews.map((r) => r.item_id);

  if (itemType === "album") {
    const { data: albums } = await supabase
      .from("Albumes")
      .select("id, titulo, cover_url, Artistas(nombre)")
      .in("id", itemIds);

    const albumMap = new Map((albums ?? []).map((a) => [a.id, a]));

    return reviews.map((r) => {
      const album = albumMap.get(r.item_id);
      const artista = album?.Artistas as
        | { nombre: string }
        | null
        | undefined;
      return {
        reviewId: r.id,
        itemId: r.item_id,
        itemType: "album" as ItemType,
        title: album?.titulo ?? "Álbum desconocido",
        subtitle: artista?.nombre ?? null,
        imageUrl: album?.cover_url ?? null,
        rating: r.rating,
        createdAt: r.created_at,
      };
    });
  }

  if (itemType === "artista") {
    const { data: artists } = await supabase
      .from("Artistas")
      .select("id, nombre, avatar_url, generos")
      .in("id", itemIds);

    const artistMap = new Map((artists ?? []).map((a) => [a.id, a]));

    return reviews.map((r) => {
      const artist = artistMap.get(r.item_id);
      return {
        reviewId: r.id,
        itemId: r.item_id,
        itemType: "artista" as ItemType,
        title: artist?.nombre ?? "Artista desconocido",
        subtitle: artist?.generos?.join(", ") ?? null,
        imageUrl: artist?.avatar_url ?? null,
        rating: r.rating,
        createdAt: r.created_at,
      };
    });
  }

  const { data: songs } = await supabase
    .from("Canciones")
    .select(
      "id, titulo, Albumes!left(cover_url, titulo), Artistas!left(nombre)"
    )
    .in("id", itemIds);

  const songMap = new Map((songs ?? []).map((s) => [s.id, s]));

  return reviews.map((r) => {
    const song = songMap.get(r.item_id);
    const artista = song?.Artistas as
      | { nombre: string }
      | null
      | undefined;
    const album = song?.Albumes as
      | { cover_url: string | null; titulo: string }
      | null
      | undefined;
    const subtitleParts = [artista?.nombre, album?.titulo].filter(Boolean);
    return {
      reviewId: r.id,
      itemId: r.item_id,
      itemType: "cancion" as ItemType,
      title: song?.titulo ?? "Canción desconocida",
      subtitle: subtitleParts.length > 0 ? subtitleParts.join(" · ") : null,
      imageUrl: album?.cover_url ?? null,
      rating: r.rating,
      createdAt: r.created_at,
    };
  });
};

export const getUserCollections = async (
  userId: string
): Promise<UserCollection[]> => {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("Coleccion_o_Lista")
    .select("id, nombre, descripcion, items")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
    items: c.items as unknown[],
  }));
};

export type CollectionItemEntry = {
  item_type: ItemType;
  item_id: string;
  annotation?: string;
  must_listen?: string;
};

export type CollectionItemDisplay = {
  item_type: ItemType;
  item_id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  year: string | null;
  avg_rating: number | null;
  generos: string[];
  annotation: string | null;
  must_listen: string | null;
};

export type CollectionPageData = {
  id: string;
  nombre: string;
  descripcion: string | null;
  creador: {
    username: string;
    nombre: string | null;
    avatar_url: string | null;
  };
  items: CollectionItemDisplay[];
  created_at: string;
};

function normalizeItem(raw: Record<string, unknown>): CollectionItemEntry {
  if (raw.item_type && raw.item_id) {
    return raw as unknown as CollectionItemEntry;
  }
  const albumId = (raw as { album_id?: string }).album_id;
  if (albumId) {
    return {
      item_type: "album" as ItemType,
      item_id: albumId,
      annotation: raw.annotation as string | undefined,
      must_listen: raw.must_listen as string | undefined,
    };
  }
  return {
    item_type: "album" as ItemType,
    item_id: "",
  };
}

export async function getCollectionPageData(
  username: string,
  collectionId: string
): Promise<CollectionPageData | null> {
  const supabase = supabaseServer();

  const { data: creator, error: creatorError } = await supabase
    .from("Datos_usuario")
    .select("id, username, nombre, avatar_url")
    .eq("username", username)
    .single();

  if (creatorError || !creator) return null;

  const { data: collection, error: collectionError } = await supabase
    .from("Coleccion_o_Lista")
    .select("*")
    .eq("id", collectionId)
    .eq("usuario_id", creator.id)
    .single();

  if (collectionError || !collection) return null;

  const rawItems = ((collection.items ?? []) as Record<string, unknown>[]).map(normalizeItem);
  const byType: Record<ItemType, string[]> = {
    artista: [],
    album: [],
    cancion: [],
  };
  for (const item of rawItems) {
    if (item.item_id) byType[item.item_type].push(item.item_id);
  }

  const hasItems =
    byType.artista.length > 0 ||
    byType.album.length > 0 ||
    byType.cancion.length > 0;

  if (!hasItems) {
    return {
      id: collection.id,
      nombre: collection.nombre,
      descripcion: collection.descripcion,
      creador: {
        username: creator.username,
        nombre: creator.nombre,
        avatar_url: creator.avatar_url,
      },
      items: [],
      created_at: collection.created_at,
    };
  }

  const [artistsRes, albumsRes, songsRes] = await Promise.all([
    byType.artista.length > 0
      ? supabase
          .from("Artistas")
          .select("id, nombre, avatar_url, generos")
          .in("id", byType.artista)
      : Promise.resolve({ data: [] }),
    byType.album.length > 0
      ? supabase
          .from("Albumes")
          .select("id, titulo, cover_url, fecha_lanzamiento, generos, Artistas(nombre)")
          .in("id", byType.album)
      : Promise.resolve({ data: [] }),
    byType.cancion.length > 0
      ? supabase
          .from("Canciones")
          .select("id, titulo, Albumes!left(cover_url, titulo), Artistas!left(nombre)")
          .in("id", byType.cancion)
      : Promise.resolve({ data: [] }),
  ]);

  const artistMap = new Map((artistsRes.data ?? []).map((a) => [a.id, a]));
  const albumMap = new Map((albumsRes.data ?? []).map((a) => [a.id, a]));
  const songMap = new Map((songsRes.data ?? []).map((s) => [s.id, s]));

  const { data: allRatings } =
    byType.album.length > 0
      ? await supabase
          .from("Resenas_de_usuario")
          .select("item_id, rating")
          .eq("item_type", "album")
          .in("item_id", byType.album)
      : { data: [] };

  const ratingMap = new Map<string, { sum: number; count: number }>();
  for (const r of allRatings ?? []) {
    const entry = ratingMap.get(r.item_id) ?? { sum: 0, count: 0 };
    entry.sum += Number(r.rating);
    entry.count += 1;
    ratingMap.set(r.item_id, entry);
  }

  const items: CollectionItemDisplay[] = rawItems.map((item) => {
    const base = {
      annotation: item.annotation ?? null,
      must_listen: item.must_listen ?? null,
    };

    if (item.item_type === "artista") {
      const a = item.item_id ? artistMap.get(item.item_id) : undefined;
      return {
        item_type: "artista" as ItemType,
        item_id: item.item_id,
        title: (a?.nombre as string) ?? "Artista desconocido",
        subtitle: (a?.generos as string[] | null)?.join(", ") ?? null,
        imageUrl: (a?.avatar_url as string) ?? null,
        year: null,
        avg_rating: null,
        generos: (a?.generos as string[]) ?? [],
        ...base,
      };
    }

    if (item.item_type === "album") {
      const a = item.item_id ? albumMap.get(item.item_id) : undefined;
      const artista = a?.Artistas as { nombre: string } | null | undefined;
      const albumRatings = item.item_id ? ratingMap.get(item.item_id) : undefined;
      return {
        item_type: "album" as ItemType,
        item_id: item.item_id,
        title: (a?.titulo as string) ?? "Álbum desconocido",
        subtitle: artista?.nombre ?? null,
        imageUrl: (a?.cover_url as string) ?? null,
        year: (a?.fecha_lanzamiento as string)?.slice(0, 4) ?? null,
        avg_rating: albumRatings ? albumRatings.sum / albumRatings.count : null,
        generos: (a?.generos as string[]) ?? [],
        ...base,
      };
    }

    const s = item.item_id ? songMap.get(item.item_id) : undefined;
    const songArtista = s?.Artistas as { nombre: string } | null | undefined;
    const songAlbum = s?.Albumes as { cover_url: string | null; titulo: string } | null | undefined;
    const subtitleParts = [songArtista?.nombre, songAlbum?.titulo].filter(Boolean);

    return {
      item_type: "cancion" as ItemType,
      item_id: item.item_id,
      title: (s?.titulo as string) ?? "Canción desconocida",
      subtitle: subtitleParts.length > 0 ? subtitleParts.join(" · ") : null,
      imageUrl: songAlbum?.cover_url ?? null,
      year: null,
      avg_rating: null,
      generos: [],
      ...base,
    };
  });

  return {
    id: collection.id,
    nombre: collection.nombre,
    descripcion: collection.descripcion,
    creador: {
      username: creator.username,
      nombre: creator.nombre,
      avatar_url: creator.avatar_url,
    },
    items,
    created_at: collection.created_at,
  };
}
