"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic2, Save, Loader2 } from "lucide-react";

type Album = {
  id: string;
  titulo: string;
  cover_url: string | null;
  fecha_lanzamiento: string | null;
  generos: string[] | null;
};

type Artist = {
  id: string;
  nombre: string;
  bio: string | null;
  avatar_url: string | null;
  generos: string[] | null;
};

export function AdminArtistForm({ artist, albums }: { artist: Artist; albums: Album[] }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(artist.nombre);
  const [bio, setBio] = useState(artist.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(artist.avatar_url ?? "");
  const [generos, setGeneros] = useState(artist.generos?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          bio: bio || null,
          avatar_url: avatarUrl || null,
          generos: generos.split(",").map((g) => g.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMsg({ text: d.error ?? "Error al guardar.", error: true });
      } else {
        setMsg({ text: "Guardado correctamente.", error: false });
        router.refresh();
      }
    } catch {
      setMsg({ text: "Error inesperado.", error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
      {/* Left: form */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-surface-container-low p-6 space-y-5">
          <h2 className="font-headline text-lg font-black text-on-surface">Datos del artista</h2>

          <div className="space-y-1">
            <label className="label-md block">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-1">
            <label className="label-md block">Géneros (separados por coma)</label>
            <input
              value={generos}
              onChange={(e) => setGeneros(e.target.value)}
              placeholder="Rock, Indie, Alternative"
              className="w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="space-y-1">
            <label className="label-md block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="label-md block">URL del avatar</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
            />
          </div>

          {msg && (
            <p className={`rounded-xl px-4 py-2 text-xs ${msg.error ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              {msg.text}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </button>
        </div>

        {/* Albums list */}
        {albums.length > 0 && (
          <div className="rounded-2xl bg-surface-container-low overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h2 className="font-headline text-lg font-black text-on-surface">
                Álbumes ({albums.length})
              </h2>
            </div>
            {albums.map((album, i) => (
              <div
                key={album.id}
                className={`flex items-center gap-4 px-6 py-3 hover:bg-surface-container transition-colors ${
                  i !== albums.length - 1 ? "border-b border-outline-variant" : ""
                }`}
              >
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-surface-container-high">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.titulo} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{album.titulo}</p>
                  <p className="text-xs text-on-surface-variant">
                    {album.fecha_lanzamiento?.slice(0, 4) ?? "—"}
                    {album.generos?.length ? ` · ${album.generos.join(", ")}` : ""}
                  </p>
                </div>
                <a
                  href={`/admin/albums/${album.id}`}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Editar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: avatar preview */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface-container-low p-5 space-y-4">
          <h2 className="font-headline text-lg font-black text-on-surface">Preview</h2>
          <div className="flex flex-col items-center gap-3">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={nombre} className="h-full w-full object-cover" />
              ) : (
                <Mic2 className="h-10 w-10 text-on-surface-variant/30" />
              )}
            </div>
            <p className="font-headline text-lg font-black text-on-surface text-center">{nombre || "—"}</p>
            {generos && (
              <p className="text-xs text-on-surface-variant text-center">
                {generos.split(",").map((g) => g.trim()).filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
