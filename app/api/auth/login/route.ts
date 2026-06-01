import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";
import { verifyPassword, setSessionCookie } from "../../../../lib/auth-server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username y contraseña requeridos." }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: user } = await supabase
    .from("Datos_usuario")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  await setSessionCookie(user.id);

  return NextResponse.json({ success: true, userId: user.id, username: user.username });
}
