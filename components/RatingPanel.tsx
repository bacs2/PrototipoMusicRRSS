"use client";

import { useState } from "react";
import { Star, Library, Heart, Check, Send, Share2, Download, ExternalLink } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ItemType } from "@/types/models";

type RatingPanelProps = {
  itemType: ItemType;
  itemId: string;
  itemTitle?: string;
  userId?: string;
};

type ActionState = "idle" | "loading" | "success" | "error";

export function RatingPanel({
  itemType,
  itemId,
  itemTitle,
  userId,
}: RatingPanelProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [libraryState, setLibraryState] = useState<ActionState>("idle");
  const [wishlistState, setWishlistState] = useState<ActionState>("idle");
  const [reviewState, setReviewState] = useState<ActionState>("idle");
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [sharingReview, setSharingReview] = useState(false);

  const displayRating = hoverRating || rating;
  const canSubmit = rating > 0 && reviewState !== "loading";

  const getStarState = (starIndex: number) => {
    const fullValue = starIndex + 1;
    const halfValue = starIndex + 0.5;
    if (displayRating >= fullValue) return "full";
    if (displayRating >= halfValue) return "half";
    return "empty";
  };

  const handleClick = (starIndex: number, isRight: boolean) => {
    setRating(starIndex + (isRight ? 1 : 0.5));
  };

  const handleHover = (starIndex: number, isRight: boolean) => {
    setHoverRating(starIndex + (isRight ? 1 : 0.5));
  };

  const handleLeave = () => {
    setHoverRating(0);
  };

  const insertAction = async (
    table: string,
    extra: Record<string, unknown> = {}
  ) => {
    if (!userId) throw new Error("Usuario no autenticado");
    const { error } = await supabaseBrowser()
      .from(table as never)
      .insert({
        usuario_id: userId,
        item_type: itemType,
        item_id: itemId,
        ...extra,
      });
    if (error) throw error;
  };

  const handleAddToLibrary = async () => {
    setLibraryState("loading");
    setReviewMsg(null);
    try {
      await insertAction("Biblioteca_usuario", { estado: "guardado" });
      setLibraryState("success");
    } catch (err) {
      setLibraryState("error");
      setReviewMsg("Error al añadir a biblioteca.");
    }
  };

  const handleAddToWishlist = async () => {
    setWishlistState("loading");
    setReviewMsg(null);
    try {
      await insertAction("Wishlist");
      setWishlistState("success");
    } catch (err) {
      setWishlistState("error");
      setReviewMsg("Error al añadir a wishlist.");
    }
  };

  const handleSubmitReview = async () => {
    if (!canSubmit) return;
    setReviewState("loading");
    setReviewMsg(null);
    try {
      const { data, error } = await supabaseBrowser()
        .from("Resenas_de_usuario")
        .insert({
          usuario_id: userId,
          item_type: itemType,
          item_id: itemId,
          rating: rating * 2,
          comentario: comment || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      setReviewId(data.id);
      setReviewState("success");
    } catch (err) {
      setReviewState("error");
      setReviewMsg("Error al publicar reseña. ¿Has iniciado sesión?");
    }
  };

  const handleShareReview = async () => {
    if (!reviewId) return;

    setSharingReview(true);
    const shareUrl = `${window.location.origin}/api/share/${reviewId}`;

    try {
      const imageBlob = await fetch(shareUrl).then((r) => r.blob());
      const file = new File([imageBlob], "mi-resena.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Mi reseña de ${itemTitle ?? "este álbum"}`,
          text: `Le di ${rating.toFixed(1)}★ a ${itemTitle ?? "este álbum"} en RateRecord`,
          files: [file],
        });
      } else {
        window.open(shareUrl, "_blank");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    } finally {
      setSharingReview(false);
    }
  };

  const ActionButton = ({
    state,
    onClick,
    icon: Icon,
    label,
    successLabel,
  }: {
    state: ActionState;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    successLabel: string;
  }) => (
    <button
      onClick={onClick}
      disabled={state === "loading"}
      className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
        state === "success"
          ? "bg-emerald-500/20 text-emerald-400"
          : state === "error"
          ? "bg-red-500/20 text-red-400"
          : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
      }`}
    >
      {state === "loading" ? (
        <div className="w-4 h-4 rounded-full border-2 border-on-surface-variant border-t-transparent animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {state === "success" ? successLabel : state === "loading" ? "" : label}
    </button>
  );

  return (
    <div className="rounded-2xl bg-surface-container-high p-6 space-y-5">
      <div>
        <p className="label-md">Califica{itemTitle ? `: ${itemTitle}` : ""}</p>
        <p className="font-headline text-xl font-bold mt-1">
          {rating > 0 ? `${rating.toFixed(1)} / 5` : "Tu puntuacion"}
        </p>
      </div>

      <div className="flex items-center gap-0.5" onPointerLeave={handleLeave}>
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const state = getStarState(starIndex);
          return (
            <div key={starIndex} className="relative w-8 h-8">
              <div
                className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer"
                onClick={() => handleClick(starIndex, false)}
                onPointerEnter={() => handleHover(starIndex, false)}
              />
              <div
                className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer"
                onClick={() => handleClick(starIndex, true)}
                onPointerEnter={() => handleHover(starIndex, true)}
              />
              {state === "full" ? (
                <Star className="w-8 h-8 text-primary fill-primary" />
              ) : state === "half" ? (
                <div className="relative">
                  <Star className="w-8 h-8 text-on-surface-variant/30" />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="w-8 h-8 text-primary fill-primary" />
                  </div>
                </div>
              ) : (
                <Star className="w-8 h-8 text-on-surface-variant/30" />
              )}
            </div>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe tu comentario..."
        rows={3}
        className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
      />

      <div className="flex gap-3">
        <ActionButton
          state={libraryState}
          onClick={handleAddToLibrary}
          icon={Library}
          label="Biblioteca"
          successLabel="En biblioteca"
        />
        <ActionButton
          state={wishlistState}
          onClick={handleAddToWishlist}
          icon={Heart}
          label="Wishlist"
          successLabel="En wishlist"
        />
      </div>

      <button
        onClick={handleSubmitReview}
        disabled={!canSubmit}
        className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition-all ${
          reviewState === "success"
            ? "bg-emerald-500"
            : "bg-gradient-to-br from-primary to-primary-dim hover:opacity-90 disabled:opacity-40"
        }`}
      >
        {reviewState === "loading" ? (
          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : reviewState === "success" ? (
          <>
            <Check className="w-4 h-4" />
            Publicado
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Publicar reseña
          </>
        )}
      </button>

      {reviewState === "success" && reviewId && (
        <button
          onClick={handleShareReview}
          disabled={sharingReview}
          className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold bg-gradient-to-br from-pink-500 to-orange-500 hover:opacity-90 disabled:opacity-40 text-white transition-all"
        >
          {sharingReview ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Compartir en Instagram
            </>
          )}
        </button>
      )}

      {reviewMsg ? (
        <p className="text-xs text-on-surface-variant text-center">
          {reviewMsg}
        </p>
      ) : null}
    </div>
  );
}
