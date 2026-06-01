"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type ItemShareButtonProps = {
  title: string;
  subtitle?: string;
};

export function ItemShareButton({ title, subtitle }: ItemShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle ? `${title} - ${subtitle}` : title,
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
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-all"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Copiado</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Compartir</span>
        </>
      )}
    </button>
  );
}