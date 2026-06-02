"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Disc3, Save, Loader2 } from "lucide-react";

type Album = {
  id: string;
  titulo: string;
  cover_url: string | null;
  fecha_lanzamiento: string | null;
  generos: string[] | null;
};

export function AdminAlbumForm({ album, artistaNombre }: { album: Album; artistaNombre: string }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(album.titulo);
  const [coverUrl, setCoverUrl] = useState(album.cover_url ?? "");
  const [fecha, setFecha] = useState(album.fecha_lanzamiento ?? "");
  const [generos, setGeneros] = useState(album.generos?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          cover_url: coverUrl || null,
          fecha_lanzamiento: fecha || null,
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
    <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
      {/* Form */}
      <div className="rounded-2xl bg-surface-container-low p-6 space-y-5">
        <h2 className="font-headline text-lg font-black text-on-surface">Datos del álbum</h2>

        <div className="space-y-1">
          <label className="label-md block">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-1">
          <label className="label-md block">Artista</label>
          <p className="text-sm text-on-surface-variant">{artistaNombre}</p>
        </div>

        <div className="space-y-1">
          <label className="label-md block">Fecha de lanzamiento</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
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
          <label className="label-md block">URL de la portada</label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
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

      {/* Cover preview */}
      <div className="rounded-2xl bg-surface-container-low p-5 space-y-4 h-fit">
        <h2 className="font-headline text-lg font-black text-on-surface">Preview</h2>
        <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center">
          {coverUrl ? (
            <img src={coverUrl} alt={titulo} className="h-full w-full object-cover" />
          ) : (
            <Disc3 className="h-12 w-12 text-on-surface-variant/30" />
          )}
        </div>
        <p className="font-headline text-base font-black text-on-surface">{titulo || "—"}</p>
        <p className="text-xs text-on-surface-variant">{artistaNombre}</p>
      </div>
    </div>
  );
}
