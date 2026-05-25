"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCollection, searchCollectionItems } from "@/lib/actions/collections";
import type { ItemType } from "@/types/models";
import { Search, X, Plus, ChevronUp, ChevronDown, Loader2, ArrowLeft } from "lucide-react";

type EditItem = {
  item_type: ItemType;
  item_id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  annotation: string | null;
  must_listen: string | null;
};

type Props = {
  username: string;
  collectionId: string;
  initialNombre: string;
  initialDescripcion: string | null;
  initialItems: EditItem[];
};

export function CollectionEditForm({
  username,
  collectionId,
  initialNombre,
  initialDescripcion,
  initialItems,
}: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState(initialNombre);
  const [descripcion, setDescripcion] = useState(initialDescripcion ?? "");
  const [items, setItems] = useState<EditItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<EditItem[]>([]);
  const [searching, setSearching] = useState(false);
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
      const mapped: EditItem[] = [
        ...data.artists.map((a) => ({
          item_type: "artista" as ItemType,
          item_id: a.id,
          title: a.nombre,
          subtitle: a.generos?.join(", ") ?? null,
          imageUrl: a.avatar_url ?? null,
          annotation: null,
          must_listen: null,
        })),
        ...data.albums.map((a) => ({
          item_type: "album" as ItemType,
          item_id: a.id,
          title: a.titulo,
          subtitle: a.artista_nombre ?? null,
          imageUrl: a.cover_url ?? null,
          annotation: null,
          must_listen: null,
        })),
        ...data.songs.map((s) => ({
          item_type: "cancion" as ItemType,
          item_id: s.id,
          title: s.titulo,
          subtitle: [s.artista_nombre, s.album_titulo].filter(Boolean).join(" · "),
          imageUrl: null,
          annotation: null,
          must_listen: null,
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

  function addItem(item: EditItem) {
    if (items.some((p) => p.item_id === item.item_id && p.item_type === item.item_type)) return;
    setItems([...items, item]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  }

  function updateAnnotation(index: number, annotation: string) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], annotation };
    setItems(newItems);
  }

  const pickedIds = new Set(items.map((p) => `${p.item_type}-${p.item_id}`));

  async function handleSave() {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateCollection(collectionId, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        items: items.map((item) => ({
          item_type: item.item_type,
          item_id: item.item_id,
          annotation: item.annotation ?? undefined,
          must_listen: item.must_listen ?? undefined,
        })),
      });
      router.refresh();
      router.push(`/collection/${username}/${collectionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  const typeLabel = (t: ItemType) =>
    t === "artista" ? "ARTISTA" : t === "album" ? "ÁLBUM" : "CANCIÓN";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-surface-container-low p-6 space-y-4">
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

      <div className="rounded-2xl bg-surface-container-low p-6">
        <h2 className="font-headline text-lg font-bold text-white mb-4">
          Items ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">
            Aún no hay items. Busca y agrégalos abajo.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.item_type}-${item.item_id}`}
                className="rounded-xl bg-surface-container-high p-4"
              >
                <div className="flex items-start gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-zinc-500">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 label-md">
                        {typeLabel(item.item_type)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate mt-0.5">
                      {item.title}
                    </p>
                    {item.subtitle ? (
                      <p className="text-xs text-zinc-500 truncate">
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={item.annotation ?? ""}
                  onChange={(e) => updateAnnotation(index, e.target.value)}
                  placeholder="Añade un comentario sobre este item..."
                  rows={2}
                  className="w-full mt-3 rounded-xl bg-surface-container border border-white/5 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-surface-container-low p-6">
        <h3 className="font-headline text-base font-bold text-white mb-3">
          Agregar más items
        </h3>
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={searchTerm}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Buscar artistas, álbumes o canciones..."
            className="w-full rounded-xl bg-surface-container-high border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {searching ? (
          <div className="flex items-center justify-center py-4 text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Buscando...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl bg-surface-container-high/50 p-1">
            {results.map((item) => {
              const key = `${item.item_type}-${item.item_id}`;
              const isPicked = pickedIds.has(key);
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
                      {typeLabel(item.item_type)}
                      {item.subtitle ? ` · ${item.subtitle}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => addItem(item)}
                    disabled={isPicked}
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                      isPicked
                        ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
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
          <p className="text-sm text-zinc-500 text-center py-3">
            Sin resultados para "{searchTerm}"
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !nombre.trim()}
          className="rounded-full bg-gradient-to-r from-primary to-primary-dim px-8 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
