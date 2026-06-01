import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const DEMO_USER_ID = "8d992fab-334f-47fc-b8ca-12cc979a0572";

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "..", ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {}
}

async function main() {
  loadEnv();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !key) {
    console.error("Falta NEXT_PUBLIC_SUPABASE_URL y una key (SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) en el .env");
    process.exit(1);
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "");
  const supabase = createClient(url, key);

  const { data: existing } = await supabase
    .from("Datos_usuario")
    .select("id")
    .eq("username", "demo")
    .maybeSingle();

  if (existing) {
    console.log("Usuario demo ya existe con id:", existing.id);
    return;
  }

  const { error } = await supabase.from("Datos_usuario").insert({
    id: DEMO_USER_ID,
    username: "demo",
    nombre: "Demo",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  });

  if (error) {
    console.error("Error al insertar usuario demo:", error.message);
    process.exit(1);
  }

  console.log("Usuario demo creado con id:", DEMO_USER_ID);
}

main();
