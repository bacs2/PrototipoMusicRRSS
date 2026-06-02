import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
