"use client";

import { useState } from "react";
import { Play, Heart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Track = {
  number: number;
  title: string;
  duration: string;
  active: boolean;
  dbId?: string;
};

type TrackItemProps = {
  track: Track;
  isLast: boolean;
};

export function TrackItem({ track, isLast }: TrackItemProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddToLibrary = async () => {
    if (!track.dbId || saving || saved) return;

    setSaving(true);
    try {
      const { error } = await supabaseBrowser()
        .from("Biblioteca_usuario")
        .insert({
          usuario_id: "demo-user",
          item_type: "cancion",
          item_id: track.dbId,
          estado: "guardado",
        });

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Error adding to library:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        track.active
          ? "bg-primary/10 text-primary"
          : "hover:bg-surface-container"
      } ${!isLast ? "" : ""}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="w-6 text-sm text-center shrink-0">
          {track.active ? (
            <Play className="w-4 h-4 fill-current" />
          ) : (
            <span className="text-on-surface-variant group-hover:hidden">
              {String(track.number).padStart(2, "0")}
            </span>
          )}
        </span>
        <span className="text-sm truncate">{track.title}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {track.dbId && (
          <button
            onClick={handleAddToLibrary}
            disabled={saving || saved}
            className={`opacity-0 group-hover:opacity-100 transition-all ${
              saved
                ? "text-emerald-500 opacity-100"
                : "text-on-surface-variant hover:text-primary"
            } ${saving ? "animate-pulse" : ""}`}
            title={saved ? "Guardado" : "Añadir a biblioteca"}
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-emerald-500" : ""}`} />
          </button>
        )}
        <span className="text-sm text-on-surface-variant w-10 text-right">
          {track.duration}
        </span>
      </div>
    </div>
  );
}

type TracklistProps = {
  tracks: Track[];
};

export function Tracklist({ tracks }: TracklistProps) {
  const total = tracks.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return (
    <div className="rounded-2xl bg-surface-container-low border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-xl font-bold">Tracklist</h3>
        <span className="text-sm text-on-surface-variant">
          {tracks.length} tracks &middot; {mins}:{String(secs).padStart(2, "0")}
        </span>
      </div>
      <div className="space-y-0.5">
        {tracks.map((track, i) => (
          <TrackItem key={track.number} track={track} isLast={i === tracks.length - 1} />
        ))}
      </div>
    </div>
  );
}