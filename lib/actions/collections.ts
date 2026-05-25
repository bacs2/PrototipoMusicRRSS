"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { getCurrentUserId } from "../auth";
import type { ItemType } from "../../types/models";

type CollectionItemInput = {
  item_type: ItemType;
  item_id: string;
  annotation?: string;
  must_listen?: string;
};

export async function createCollection(
  nombre: string,
  descripcion: string | null,
  items: CollectionItemInput[]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Coleccion_o_Lista")
    .insert({
      usuario_id: userId,
      nombre,
      descripcion,
      items: items as unknown as Record<string, unknown>[],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/library");
  return data;
}

export async function updateCollection(
  id: string,
  updates: {
    nombre?: string;
    descripcion?: string | null;
    items?: CollectionItemInput[];
  }
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const supabase = supabaseServer();

  const { data: existing } = await supabase
    .from("Coleccion_o_Lista")
    .select("usuario_id")
    .eq("id", id)
    .single();

  if (!existing || existing.usuario_id !== userId) {
    throw new Error("No tienes permiso para editar esta colección");
  }

  const { data, error } = await supabase
    .from("Coleccion_o_Lista")
    .update(
      updates.items
        ? { ...updates, items: updates.items as unknown as Record<string, unknown>[] }
        : updates
    )
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/collection");
  return data;
}

export async function updateItemAnnotation(
  collectionId: string,
  itemType: ItemType,
  itemId: string,
  annotation: string | null
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const supabase = supabaseServer();

  const { data: collection } = await supabase
    .from("Coleccion_o_Lista")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (!collection || collection.usuario_id !== userId) {
    throw new Error("No tienes permiso para editar esta colección");
  }

  const rawItems = (collection.items ?? []) as Record<string, unknown>[];
  const updatedItems = rawItems.map((item: Record<string, unknown>) => {
    const normalizedType = item.item_type ?? "album";
    const normalizedId = item.item_id ?? item.album_id;
    if (normalizedType === itemType && normalizedId === itemId) {
      return { ...item, annotation };
    }
    return item;
  });

  const { error } = await supabase
    .from("Coleccion_o_Lista")
    .update({ items: updatedItems as unknown as Record<string, unknown>[] })
    .eq("id", collectionId);

  if (error) throw new Error(error.message);
  revalidatePath(`/collection`);
}

export async function deleteCollection(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const supabase = supabaseServer();

  const { data: existing } = await supabase
    .from("Coleccion_o_Lista")
    .select("usuario_id")
    .eq("id", id)
    .single();

  if (!existing || existing.usuario_id !== userId) {
    throw new Error("No tienes permiso para eliminar esta colección");
  }

  const { error } = await supabase.from("Coleccion_o_Lista").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/library");
}

export async function searchCollectionItems(term: string) {
  const { searchItems } = await import("../../services/queries");
  return searchItems(term);
}
