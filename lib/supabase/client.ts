import { createBrowserClient } from "@supabase/ssr";

const url = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/rest\/v1\/?$/, "");
const key = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function supabaseBrowser() {
  return createBrowserClient(url(), key());
}
