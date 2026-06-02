import { supabaseServer } from "./supabase/server";

const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "";

export async function getCurrentUserId(): Promise<string> {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}

export async function getCurrentUser(): Promise<{
  id: string;
  username: string;
  nombre: string | null;
  avatar_url: string | null;
  is_admin: boolean;
} | null> {
  try {
    const supabase = await supabaseServer();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data } = await supabase
      .from("Datos_usuario")
      .select("id, username, nombre, avatar_url, is_admin")
      .eq("id", authUser.id)
      .single();

    return data ?? null;
  } catch {
    return null;
  }
}
