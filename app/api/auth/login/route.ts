import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username y contraseña requeridos." }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const email = `${username}@raterecord.app`;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  return NextResponse.json({ success: true, userId: data.user.id, username });
}
