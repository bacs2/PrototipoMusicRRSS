import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

const normalizedUrl = env.supabaseUrl.replace(/\/rest\/v1\/?$/, "");

export const supabaseServer = () =>
  createClient(normalizedUrl, env.supabaseKey);
