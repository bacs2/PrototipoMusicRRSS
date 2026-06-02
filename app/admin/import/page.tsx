import Link from "next/link";
import { ImportClient } from "./ImportClient";

export default function AdminImportPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="label-md">
          <Link href="/admin" className="hover:text-on-surface">Admin</Link> / Importar
        </p>
        <h1 className="font-headline text-4xl font-black text-on-surface">Importar catálogo</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Busca artistas o álbumes en MusicBrainz e impórtalos directamente a la base de datos.
        </p>
      </div>

      <ImportClient />
    </div>
  );
}
