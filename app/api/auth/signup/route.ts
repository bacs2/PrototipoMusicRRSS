import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";
import { hashPassword, setSessionCookie } from "../../../../lib/auth-server";

export async function POST(request: Request) {
  const { username, nombre, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username y contraseña requeridos." }, { status: 400 });
  }

  if (username.length < 3) {
    return NextResponse.json({ error: "El username debe tener al menos 3 caracteres." }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 4 caracteres." }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: existing } = await supabase
    .from("Datos_usuario")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "El username ya está en uso." }, { status: 409 });
  }

  const passwordHash = hashPassword(password);

  const { data: user, error } = await supabase
    .from("Datos_usuario")
    .insert({
      username,
      nombre: nombre || username,
      password_hash: passwordHash,
    })
    .select("id")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: `Error al crear el usuario: ${error?.message ?? "desconocido"}` }, { status: 500 });
  }

  await setSessionCookie(user.id);

  return NextResponse.json({ success: true, userId: user.id, username });
}
