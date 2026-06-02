import Link from "next/link";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { Pencil, Mic2 } from "lucide-react";

async function getArtists() {
  const db = supabaseAdmin();
  const { data: artists } = await db
    .from("Artistas")
    .select("id, nombre, generos, avatar_url")
    .order("nombre", { ascending: true });

  const { data: albumCounts } = await db.from("Albumes").select("artista_id");
  const countMap = new Map<string, number>();
  for (const a of albumCounts ?? []) {
    if (a.artista_id) countMap.set(a.artista_id, (countMap.get(a.artista_id) ?? 0) + 1);
  }

  return (artists ?? []).map((a) => ({ ...a, albumCount: countMap.get(a.id) ?? 0 }));
}

export default async function AdminArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-md"><Link href="/admin" className="hover:text-on-surface">Admin</Link> / Artistas</p>
          <h1 className="font-headline text-4xl font-black text-on-surface">Artistas</h1>
        </div>
        <span className="text-sm text-on-surface-variant">{artists.length} en total</span>
      </div>

      <div className="rounded-2xl bg-surface-container-low overflow-hidden">
        {artists.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">No hay artistas.</div>
        )}
        {artists.map((artist, i) => (
          <div
            key={artist.id}
            className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container transition-colors ${
              i !== artists.length - 1 ? "border-b border-outline-variant" : ""
            }`}
          >
            {/* Avatar */}
            <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.nombre} className="h-full w-full object-cover" />
              ) : (
                <Mic2 className="h-4 w-4 text-on-surface-variant" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-on-surface truncate">{artist.nombre}</p>
              <p className="text-xs text-on-surface-variant truncate">
                {artist.generos?.join(", ") || "Sin géneros"}
              </p>
            </div>

            {/* Album count */}
            <span className="text-xs text-on-surface-variant shrink-0">
              {artist.albumCount} álbum{artist.albumCount !== 1 ? "es" : ""}
            </span>

            {/* Edit */}
            <Link
              href={`/admin/artists/${artist.id}`}
              className="shrink-0 rounded-lg p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
