import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const { id } = await params;
  const db = supabaseAdmin();

  const [artistRes, albumsRes] = await Promise.all([
    db.from("Artistas").select("id, nombre, generos, avatar_url, bio").eq("id", id).single(),
    db.from("Albumes")
      .select("id, titulo, cover_url, fecha_lanzamiento, generos")
      .eq("artista_id", id)
      .order("fecha_lanzamiento", { ascending: false, nullsFirst: false }),
  ]);

  if (!artistRes.data) return NextResponse.json({ error: "Artista no encontrado." }, { status: 404 });

  return NextResponse.json({ artist: artistRes.data, albums: albumsRes.data ?? [] });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["nombre", "bio", "avatar_url", "generos"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("Artistas").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
