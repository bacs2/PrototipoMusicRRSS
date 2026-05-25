"use client";

import { useState } from "react";
import Link from "next/link";

type SuggestedUser = {
  id: string;
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
};

const PLACEHOLDER_USERS: SuggestedUser[] = [
  { id: "1", username: "maria_dev", name: "María García", avatarUrl: null },
  { id: "2", username: "juan_beat", name: "Juan López", avatarUrl: null },
  { id: "3", username: "val_music", name: "Valentina Ruiz", avatarUrl: null },
  { id: "4", username: "pablo_jazz", name: "Pablo Martínez", avatarUrl: null },
  { id: "5", username: "cami_sound", name: "Camila Torres", avatarUrl: null },
];

export const SuggestedUsers = () => {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const toggleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-surface-container-low p-5">
      <p className="label-md mb-4">Usuarios recomendados</p>
      <div className="space-y-4">
        {PLACEHOLDER_USERS.map((user) => {
          const isFollowing = following.has(user.id);
          return (
            <div key={user.id} className="flex items-center gap-3">
              <Link
                href={`/profile/${user.username}`}
                className="shrink-0"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dim text-xs font-bold text-white">
                    {user.name?.charAt(0) ?? user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <Link
                href={`/profile/${user.username}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-semibold text-white">
                  {user.name ?? user.username}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  @{user.username}
                </p>
              </Link>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  isFollowing
                    ? "border border-white/10 bg-transparent text-on-surface-variant hover:border-red-500/50 hover:text-red-400"
                    : "bg-gradient-to-br from-primary to-primary-dim text-white hover:opacity-90"
                }`}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
