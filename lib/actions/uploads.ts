"use server";

import { supabaseAdmin } from "../supabase/admin";

const BUCKET = "collection-covers";

export async function uploadCollectionCover(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { url: null, error: "No se proporcionó ningún archivo" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      url: null,
      error: "Formato no soportado. Usa JPEG, PNG, WebP o GIF.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: "La imagen no debe superar los 5 MB." };
  }

  const supabase = supabaseAdmin();

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { url: null, error: `Error al subir: ${error.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return { url: publicUrl, error: null };
}
