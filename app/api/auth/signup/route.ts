import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(request: Request) {
  const { username, email, nombre, password } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Username, correo y contraseña requeridos." }, { status: 400 });
  }
  if (username.length < 3) {
    return NextResponse.json({ error: "El username debe tener al menos 3 caracteres." }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 4 caracteres." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El correo no es válido." }, { status: 400 });
  }

  const supabase = await supabaseServer();

  // Check username availability
  const { data: existing } = await supabase
    .from("Datos_usuario")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "El username ya está en uso." }, { status: 409 });
  }

  // Create auth user with email confirmed (skips email verification)
  const admin = supabaseAdmin();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Error al crear usuario." },
      { status: 500 }
    );
  }

  // Insert profile linked to auth user
  const { error: profileError } = await supabase
    .from("Datos_usuario")
    .insert({ id: authData.user.id, username, nombre: nombre || username });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: `Error al crear perfil: ${profileError.message}` },
      { status: 500 }
    );
  }

  // Sign in to establish session cookie
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return NextResponse.json(
      { error: "Cuenta creada, pero error al iniciar sesión. Inicia sesión manualmente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, username });
}
