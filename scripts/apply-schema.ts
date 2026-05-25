import { readFileSync } from "fs";
import path from "path";
import { execSync } from "child_process";

function loadEnv(): void {
  try {
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(".env");
    }
  } catch {}
}

async function main() {
  loadEnv();

  const sqlPath = path.join(process.cwd(), "supabase", "schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!rawUrl) {
    console.log("❌ NEXT_PUBLIC_SUPABASE_URL no está configurada");
    process.exit(1);
  }

  const hostname = new URL(rawUrl).hostname;
  const projectRef = hostname.split(".")[0];

  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (dbPassword) {
    try {
      execSync(
        `psql "postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:6543/postgres" -f "${sqlPath}"`,
        { stdio: "inherit", timeout: 30000 }
      );
      console.log("\n✅ Schema aplicado exitosamente");
      return;
    } catch (err) {
      console.log("⚠️  psql falló:", (err as Error).message);
      console.log("");
    }
  }

  console.log("Para aplicar el schema manualmente:");
  console.log("");
  console.log(`  1. Abre: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log(`  2. Copia el contenido de supabase/schema.sql`);
  console.log("  3. Pega y haz clic en 'Run'");
  console.log("");
  console.log("O con psql (necesitas la DB password de Supabase Dashboard > Settings > Database):");
  console.log("");
  console.log(`  SUPABASE_DB_PASSWORD=tu_password npm run apply-schema`);
  console.log("");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
