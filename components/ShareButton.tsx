"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";

type ShareButtonProps = {
  title?: string;
};

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title ?? "RateRecord",
          text: `Mira esta colección en RateRecord: ${title ?? ""}`,
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
  );
}