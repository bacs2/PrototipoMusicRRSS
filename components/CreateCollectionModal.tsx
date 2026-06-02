"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCollection, searchCollectionItems } from "@/lib/actions/collections";
import { uploadCollectionCover } from "@/lib/actions/uploads";
import type { ItemType } from "@/types/models";
import { Search, X, Plus, Loader2, Upload, ImageIcon } from "lucide-react";

type PickedItem = {
  item_type: ItemType;
  item_id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
};

export function CreateCollectionModal({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<PickedItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<PickedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await searchCollectionItems(term.trim());
      const mapped: PickedItem[] = [
        ...data.artists.map((a) => ({
          item_type: "artista" as ItemType,
          item_id: a.id,
          title: a.nombre,
          subtitle: a.generos?.join(", ") ?? null,
          imageUrl: a.avatar_url ?? null,
        })),
        ...data.albums.map((a) => ({
          item_type: "album" as ItemType,
          item_id: a.id,
          title: a.titulo,
          subtitle: a.artista_nombre ?? null,
          imageUrl: a.cover_url ?? null,
        })),
        ...data.songs.map((s) => ({
          item_type: "cancion" as ItemType,
          item_id: s.id,
          title: s.titulo,
          subtitle: [s.artista_nombre, s.album_titulo]
            .filter(Boolean)
            .join(" · "),
          imageUrl: null,
        })),
      ];
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleSearchInput(value: string) {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  }

  function addItem(item: PickedItem) {
    if (picked.some((p) => p.item_id === item.item_id && p.item_type === item.item_type)) return;
    setPicked([...picked, item]);
  }

  function removeItem(itemId: string, itemType: ItemType) {
    setPicked(picked.filter((p) => !(p.item_id === itemId && p.item_type === itemType)));
  }

  const pickedIds = new Set(picked.map((p) => `${p.item_type}-${p.item_id}`));

  async function handleSave() {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await createCollection(
        nombre.trim(),
        descripcion.trim() || null,
        picked.map((p) => ({
          item_type: p.item_type,
          item_id: p.item_id,
        }))
      );
      onClose();
      router.refresh();
      router.push(`/collection/${username}/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la colección");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-low border border-white/5 shadow-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-2xl font-bold text-white">
            Nueva colección
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la colección"
            className="w-full rounded-xl bg-surface-container-high border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={3}
            className="w-full rounded-xl bg-surface-container-high border border-white/10 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={searchTerm}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Buscar artistas, álbumes o canciones..."
            className="w-full rounded-xl bg-surface-container-high border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {searching ? (
          <div className="flex items-center justify-center py-8 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Buscando...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-1 mb-6 max-h-48 overflow-y-auto rounded-xl bg-surface-container-high/50 p-1">
            {results.map((item) => {
              const key = `${item.item_type}-${item.item_id}`;
              const isPicked = pickedIds.has(key);
              const typeLabel =
                item.item_type === "artista"
                  ? "ARTISTA"
                  : item.item_type === "album"
                    ? "ÁLBUM"
                    : "CANCIÓN";
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-zinc-500">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {typeLabel}
                      {item.subtitle ? ` · ${item.subtitle}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      isPicked
                        ? removeItem(item.item_id, item.item_type)
                        : addItem(item)
                    }
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                      isPicked
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                  >
                    {isPicked ? (
                      <X className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : searchTerm.trim() ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            Sin resultados para "{searchTerm}"
          </p>
        ) : null}

        {picked.length > 0 ? (
          <div className="mb-6">
            <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">
              Seleccionados ({picked.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {picked.map((item) => {
                const key = `${item.item_type}-${item.item_id}`;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-full bg-surface-container-highest pl-3 pr-1 py-1"
                  >
                    <span className="text-xs text-zinc-300 truncate max-w-32">
                      {item.title}
                    </span>
                    <button
                      onClick={() => removeItem(item.item_id, item.item_type)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !nombre.trim()}
            className="rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Crear colección"}
          </button>
        </div>
      </div>
    </div>
  );
}
