"use client";

import { useState } from "react";
import { Heart, Share2, Check } from "lucide-react";

type CollectionActionsProps = {
  collectionName: string;
};

export function CollectionActions({ collectionName }: CollectionActionsProps) {
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

type ControlsBarShareProps = {
  collectionName: string;
  currentPage: number;
  totalPages: number;
  basePath: string;
};

import Link from "next/link";

export function ControlsBar({
  currentPage,
  totalPages,
  basePath,
}: ControlsBarShareProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-b border-white/5 py-3">
      <div />

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          const href = page === 1 ? basePath : `${basePath}?page=${page}`;
          return (
            <Link
              key={page}
              href={href}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "text-white bg-surface-container-highest"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <CollectionActions collectionName="Mi Colección" />
    </div>
  );
}