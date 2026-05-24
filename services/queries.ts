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
    return { items: [], message: "Configura DEMO_USER_ID para ver el feed." };
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
        username: review.usuario?.username ?? "usuario",
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
      .select("id, nombre, generos")
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

  const items = await Promise.all(
    (reviews ?? []).map(async (review) => {
      const itemTitle = await getItemTitle(review.item_type, review.item_id);

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comentario,
        itemType: review.item_type,
        itemTitle,
        createdAt: review.created_at,
      };
    })
  );

  return { profile, reviews: items };
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
