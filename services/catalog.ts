import { supabaseServer } from "../lib/supabase/server";
import type { ReviewShareData } from "../types/models";

export const getReviewShareData = async (
  reviewId: string
): Promise<ReviewShareData | null> => {
  const supabase = await supabaseServer();

  const { data: review, error } = await supabase
    .from("Resenas_de_usuario")
    .select("id, rating, comentario, item_type, item_id")
    .eq("id", reviewId)
    .single();

  if (error || !review) {
    return null;
  }

  if (review.item_type === "album") {
    const { data: album } = await supabase
      .from("Albumes")
      .select("titulo, cover_url")
      .eq("id", review.item_id)
      .single();

    return {
      reviewId: review.id,
      itemTitle: album?.titulo ?? "Album",
      itemSubtitle: "Album",
      rating: review.rating,
      comment: review.comentario,
      coverUrl: album?.cover_url ?? null,
    };
  }

  if (review.item_type === "artista") {
    const { data: artist } = await supabase
      .from("Artistas")
      .select("nombre")
      .eq("id", review.item_id)
      .single();

    return {
      reviewId: review.id,
      itemTitle: artist?.nombre ?? "Artista",
      itemSubtitle: "Artista",
      rating: review.rating,
      comment: review.comentario,
      coverUrl: null,
    };
  }

  const { data: track } = await supabase
    .from("Canciones")
    .select("titulo")
    .eq("id", review.item_id)
    .single();

  return {
    reviewId: review.id,
    itemTitle: track?.titulo ?? "Cancion",
    itemSubtitle: "Cancion",
    rating: review.rating,
    comment: review.comentario,
    coverUrl: null,
  };
};
