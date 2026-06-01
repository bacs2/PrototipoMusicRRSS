"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Check, MapPin } from "lucide-react";

type ProfileHeroClientProps = {
  profile: {
    nombre: string | null;
    username: string;
    avatar_url: string | null;
    bio: string | null;
  };
};

export function ProfileHeroClient({ profile }: ProfileHeroClientProps) {
  const [copied, setCopied] = useState(false);

  const initial = (profile.nombre ?? profile.username).charAt(0).toUpperCase();

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.nombre ?? `@${profile.username}`,
          text: `Mira mi perfil en RateRecord: ${profile.nombre ?? `@${profile.username}`}`,
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
    <section className="relative flex flex-col md:flex-row items-start gap-8 overflow-hidden rounded-3xl bg-surface-container-low p-8">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative shrink-0">
        <div className="absolute -inset-4 rounded-full bg-primary/15 blur-3xl" />
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="relative z-10 h-40 w-40 rounded-2xl object-cover shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:h-48 md:w-48"
          />
        ) : (
          <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container-highest shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:h-48 md:w-48">
            <span className="font-headline text-6xl font-black text-on-surface-variant opacity-30">
              {initial}
            </span>
          </div>
        )}
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-4 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-headline text-5xl font-black text-on-surface md:text-6xl">
              {profile.nombre ?? `@${profile.username}`}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span>@{profile.username}</span>
              <span className="text-zinc-600">·</span>
              <MapPin className="h-3.5 w-3.5" />
              <span>Ciudad de México, MX</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-on-surface-variant transition-colors hover:bg-white/5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {profile.bio ? (
          <p className="max-w-xl text-sm leading-relaxed text-zinc-300">
            {profile.bio}
          </p>
        ) : null}
      </div>
    </section>
  );
}