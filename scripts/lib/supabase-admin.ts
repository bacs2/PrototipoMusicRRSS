import { createClient } from "@supabase/supabase-js";
import type { InsertArtista, InsertAlbum, InsertCancion } from "./mapping";

let supabase: ReturnType<typeof createClient>;

function getClient() {
  if (supabase) return supabase;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const key = serviceKey ?? anonKey;
  if (!rawUrl || !key) {
    throw new Error(
      "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
    );
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "");

  supabase = createClient(url, key);
  return supabase;
}

export async function findArtistByMbid(
  mbid: string
): Promise<{ id: string } | null> {
  const { data } = await getClient()
    .from("Artistas")
    .select("id")
    .eq("mbid", mbid)
    .maybeSingle();
  return data;
}

export async function findAlbumByMbid(
  mbid: string
): Promise<{ id: string } | null> {
  const { data } = await getClient()
    .from("Albumes")
    .select("id")
    .eq("mbid", mbid)
    .maybeSingle();
  return data;
}

export async function insertArtist(
  artista: InsertArtista
): Promise<string> {
  const existing = await findArtistByMbid(artista.mbid);
  if (existing) return existing.id;

  const { data, error } = await getClient()
    .from("Artistas")
    .insert(artista as any)
    .select("id")
    .single();

  if (error || !data) throw new Error(`Error al insertar artista: ${error?.message ?? "desconocido"}`);
  return (data as { id: string }).id;
}

export async function insertAlbum(
  album: InsertAlbum
): Promise<string> {
  const existing = await findAlbumByMbid(album.mbid);
  if (existing) return existing.id;

  const { data, error } = await getClient()
    .from("Albumes")
    .insert(album as any)
    .select("id")
    .single();

  if (error || !data) throw new Error(`Error al insertar album: ${error?.message ?? "desconocido"}`);
  return (data as { id: string }).id;
}

export async function insertTracks(
  tracks: InsertCancion[]
): Promise<number> {
  if (tracks.length === 0) return 0;

  const existing = await getClient()
    .from("Canciones")
    .select("mbid")
    .in(
      "mbid",
      tracks.map((t) => t.mbid)
    );

  const existingMbids = new Set(
    (existing.data ?? []).map((r: { mbid: string }) => r.mbid)
  );

  const toInsert = tracks.filter((t) => !existingMbids.has(t.mbid));
  if (toInsert.length === 0) return 0;

  const { error } = await getClient().from("Canciones").insert(toInsert as any);
  if (error) throw new Error(`Error al insertar tracks: ${error.message}`);
  return toInsert.length;
}
