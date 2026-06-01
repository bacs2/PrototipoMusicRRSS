"use client";

import { useState } from "react";
import { Heart, Share2, Check } from "lucide-react";

type CollectionHeroActionsProps = {
  collectionName: string;
};

export function CollectionHeroActions({ collectionName }: CollectionHeroActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: collectionName,
          text: `Mira esta colección en RateRecord: ${collectionName}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          liked ? "text-red-400" : "text-zinc-400 hover:text-red-400"
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-red-400" : ""}`} />
        <span>{likeCount}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline text-emerald-500">Copiado</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>
    </div>
  );
}