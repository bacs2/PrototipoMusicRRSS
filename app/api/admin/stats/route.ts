import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.is_admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const [artists, albums, songs, users] = await Promise.all([
    db.from("Artistas").select("id", { count: "exact", head: true }),
    db.from("Albumes").select("id", { count: "exact", head: true }),
    db.from("Canciones").select("id", { count: "exact", head: true }),
    db.from("Datos_usuario").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    artists: artists.count ?? 0,
    albums: albums.count ?? 0,
    songs: songs.count ?? 0,
    users: users.count ?? 0,
  });
}
