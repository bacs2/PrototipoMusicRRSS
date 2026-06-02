import Link from "next/link";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { Pencil, Disc3 } from "lucide-react";

async function getAlbums() {
  const db = supabaseAdmin();
  const { data } = await db
    .from("Albumes")
    .select("id, titulo, cover_url, fecha_lanzamiento, generos, Artistas(nombre)")
    .order("titulo", { ascending: true });
  return data ?? [];
}

export default async function AdminAlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-md"><Link href="/admin" className="hover:text-on-surface">Admin</Link> / Álbumes</p>
          <h1 className="font-headline text-4xl font-black text-on-surface">Álbumes</h1>
        </div>
        <span className="text-sm text-on-surface-variant">{albums.length} en total</span>
      </div>

      <div className="rounded-2xl bg-surface-container-low overflow-hidden">
        {albums.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">No hay álbumes.</div>
        )}
        {albums.map((album, i) => {
          const artista = (album.Artistas as unknown as { nombre: string } | null)?.nombre ?? "—";
          return (
            <div
              key={album.id}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container transition-colors ${
                i !== albums.length - 1 ? "border-b border-outline-variant" : ""
              }`}
            >
              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
                {album.cover_url ? (
                  <img src={album.cover_url} alt={album.titulo} className="h-full w-full object-cover" />
                ) : (
                  <Disc3 className="h-4 w-4 text-on-surface-variant" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-on-surface truncate">{album.titulo}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {artista} · {album.fecha_lanzamiento?.slice(0, 4) ?? "—"}
                </p>
              </div>
              <div className="hidden md:flex flex-wrap gap-1 max-w-48">
                {album.generos?.slice(0, 2).map((g: string) => (
                  <span key={g} className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant">
                    {g}
                  </span>
                ))}
              </div>
              <Link
                href={`/admin/albums/${album.id}`}
                className="shrink-0 rounded-lg p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
