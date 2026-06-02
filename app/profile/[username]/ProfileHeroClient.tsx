"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, Share2, X } from "lucide-react";

type StreamingService = {
  name: string;
  accent: string;
  description: string;
  Icon: () => JSX.Element;
};

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="10" className="fill-[#1DB954]" />
      <path d="M7.4 9.7c2.9-.9 6.4-.7 8.9.7" stroke="#fff" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M8 12c2.4-.7 5-.5 7 .6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.95" />
      <path d="M8.7 14.2c1.7-.5 3.6-.4 5 .5" stroke="#fff" strokeWidth="1.15" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function AppleMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="10" className="fill-[#FA243C]" />
      <path d="M13 6.8v6.1a2.7 2.7 0 1 0 1.1 2.2V9.9l3-.8V7.9l-4.1 1z" fill="#fff" />
    </svg>
  );
}

function TidalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <rect x="5" y="5" width="4" height="4" transform="rotate(45 7 7)" className="fill-[#f5f5f5]" />
      <rect x="10" y="5" width="4" height="4" transform="rotate(45 12 7)" className="fill-[#f5f5f5]" />
      <rect x="15" y="5" width="4" height="4" transform="rotate(45 17 7)" className="fill-[#f5f5f5]" />
      <rect x="7.5" y="10.5" width="4" height="4" transform="rotate(45 9.5 12.5)" className="fill-[#f5f5f5]" />
      <rect x="12.5" y="10.5" width="4" height="4" transform="rotate(45 14.5 12.5)" className="fill-[#f5f5f5]" />
    </svg>
  );
}

function YouTubeMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="10" className="fill-[#FF0000]" />
      <path d="M10.3 8.6v6.8l5.9-3.4-5.9-3.4z" fill="#fff" />
    </svg>
  );
}

const streamingServices: StreamingService[] = [
  {
    name: "Spotify",
    accent: "#1DB954",
    description: "Sincroniza tu biblioteca y playlists favoritas.",
    Icon: SpotifyIcon,
  },
  {
    name: "Apple Music",
    accent: "#FA243C",
    description: "Vincula tu cuenta para seguir tus álbumes y artistas.",
    Icon: AppleMusicIcon,
  },
  {
    name: "Tidal",
    accent: "#f5f5f5",
    description: "Conecta tu perfil y comparte tu actividad musical.",
    Icon: TidalIcon,
  },
  {
    name: "YouTube Music",
    accent: "#FF0000",
    description: "Importa tus escuchas y contenido guardado.",
    Icon: YouTubeMusicIcon,
  },
];

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
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const initial = (profile.nombre ?? profile.username).charAt(0).toUpperCase();

  useEffect(() => {
    if (!isConnectOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsConnectOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isConnectOpen]);

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
    <>
      <section className="relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl bg-surface-container-low p-8 md:flex-row">
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
              onClick={() => setIsConnectOpen(true)}
              className="rounded-full bg-surface-container-high/80 px-5 py-2 text-sm font-semibold text-secondary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-all hover:bg-surface-container-highest hover:text-white"
            >
              Conectar
            </button>
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high/80 text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:bg-surface-container-highest hover:text-white"
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

      {isConnectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsConnectOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl bg-surface-container-low p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-1 font-headline text-3xl font-black text-on-surface">
                    Conecta con tu servicio de streaming favorito
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
                  Elige la plataforma que quieres asociar a tu perfil.
                </p>
              </div>
              <button
                onClick={() => setIsConnectOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant transition-colors hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {streamingServices.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  className="flex w-full items-center gap-4 rounded-2xl bg-surface-container-high p-4 text-left transition-transform hover:-translate-y-0.5 hover:bg-surface-container-highest"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_18px_30px_rgba(0,0,0,0.28)]"
                    style={{ backgroundColor: service.accent }}
                  >
                    <service.Icon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-on-surface">{service.name}</p>
                    <p className="mt-0.5 text-sm text-on-surface-variant">
                      {service.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
                    Conectar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}