import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";

const DEMO_USER_ID = process.env.DEMO_USER_ID;

export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const userId = authUser?.id ?? DEMO_USER_ID;
  if (!userId) return NextResponse.json({ user: null });

  const { data: user } = await supabase
    .from("Datos_usuario")
    .select("id, username, nombre, avatar_url, is_admin")
    .eq("id", userId)
    .maybeSingle();

  return NextResponse.json({ user: user ?? null });
}
