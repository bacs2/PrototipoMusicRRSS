"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateItemAnnotation } from "@/lib/actions/collections";
import type { ItemType } from "@/types/models";

type Props = {
  collectionId: string;
  itemType: ItemType;
  itemId: string;
  currentAnnotation: string | null;
};

export function InlineAnnotationEditor({
  collectionId,
  itemType,
  itemId,
  currentAnnotation,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(currentAnnotation ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      await updateItemAnnotation(collectionId, itemType, itemId, text || null);
      setIsEditing(false);
      router.refresh();
    } catch {
      setSaving(false);
    }
  }

  function handleCancel() {
    setText(currentAnnotation ?? "");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario sobre este item..."
          rows={3}
          className="w-full rounded-xl bg-surface-container-high border border-white/10 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dim transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="mt-2 text-xs font-medium text-primary hover:text-primary-dim transition-colors"
    >
      {currentAnnotation ? "✎ Editar comentario" : "✚ Añadir comentario"}
    </button>
  );
}
