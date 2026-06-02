import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username y contraseña requeridos." }, { status: 400 });
  }

  // Look up the user's ID by username to get their real email from auth.users
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("Datos_usuario")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  const { data: authUser, error: authError } = await admin.auth.admin.getUserById(profile.id);
  if (authError || !authUser.user?.email) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  // Sign in with the real email
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authUser.user.email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  return NextResponse.json({ success: true, userId: data.user.id, username });
}
