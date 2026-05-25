import { createClient } from "@supabase/supabase-js";

const normalizedUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
  /\/rest\/v1\/?$/,
  "",
);

export const supabaseBrowser = () =>
  createClient(
    normalizedUrl,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  );
