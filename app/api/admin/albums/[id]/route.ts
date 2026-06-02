import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["titulo", "cover_url", "fecha_lanzamiento", "generos"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("Albumes").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
