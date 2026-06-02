import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.is_admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const { data: artists } = await db
    .from("Artistas")
    .select("id, nombre, generos, avatar_url, bio")
    .order("nombre", { ascending: true });

  // Get album counts per artist
  const { data: albumCounts } = await db
    .from("Albumes")
    .select("artista_id");

  const countMap = new Map<string, number>();
  for (const a of albumCounts ?? []) {
    if (a.artista_id) countMap.set(a.artista_id, (countMap.get(a.artista_id) ?? 0) + 1);
  }

  const result = (artists ?? []).map((a) => ({
    ...a,
    albumCount: countMap.get(a.id) ?? 0,
  }));

  return NextResponse.json(result);
}
