import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "../../../../lib/supabase/server";
import { unsignToken, SESSION_COOKIE } from "../../../../lib/auth";

const DEMO_USER_ID = "8d992fab-334f-47fc-b8ca-12cc979a0572";

async function getUserById(userId: string) {
  const supabase = supabaseServer();
  const { data: user } = await supabase
    .from("Datos_usuario")
    .select("id, username, nombre, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  return user;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      const userId = unsignToken(token);
      if (userId) {
        const user = await getUserById(userId);
        if (user) {
          return NextResponse.json({ user });
        }
      }
    }

    const demoUser = await getUserById(DEMO_USER_ID);
    return NextResponse.json({ user: demoUser ?? null });
  } catch {
    const demoUser = await getUserById(DEMO_USER_ID);
    return NextResponse.json({ user: demoUser ?? null });
  }
}
