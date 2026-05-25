import { AppShell } from "../../components/AppShell";
import { EmptyState } from "../../components/EmptyState";
import { MediaCard } from "../../components/MediaCard";
import { searchItems } from "../../services/queries";
import { Search } from "lucide-react";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function msToDuration(ms: number | null): string {
  if (!ms) return "0:00";
  const totalSecs = Math.round(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  if (!term) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-16 h-16 text-on-surface-variant/20 mb-4" />
          <h1 className="font-headline text-3xl font-bold">Search</h1>
          <p className="text-on-surface-variant mt-2">
            Busca artistas, albumes y canciones.
          </p>
        </div>
      </AppShell>
    );
  }

  const results = await searchItems(term);
  const total =
    results.artists.length +
    results.albums.length +
    results.songs.length;

  return (
    <AppShell>
      <div className="space-y-10">
        <div>
          <p className="label-md mb-1">
            {total} resultado{total !== 1 ? "s" : ""} para
          </p>
          <h1 className="font-headline text-5xl font-black uppercase tracking-tighter">
            {term}
          </h1>
        </div>

        {results.artists.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-headline text-2xl font-bold">Artistas</h2>
              <span className="text-sm text-on-surface-variant">
                ({results.artists.length})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.artists.map((artist) => (
                <MediaCard
                  key={artist.id}
                  type="artista"
                  imageUrl={artist.avatar_url}
                  title={artist.nombre}
                  subtitle={artist.generos?.join(", ")}
                  href={`/item/artista/${artist.id}`}
                />
              ))}
            </div>
          </section>
        )}

        {results.albums.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-headline text-2xl font-bold">Albumes</h2>
              <span className="text-sm text-on-surface-variant">
                ({results.albums.length})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.albums.map((album) => (
                <MediaCard
                  key={album.id}
                  type="album"
                  imageUrl={album.cover_url}
                  title={album.titulo}
                  subtitle={album.artista_nombre}
                  href={`/item/album/${album.id}`}
                />
              ))}
            </div>
          </section>
        )}

        {results.songs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-headline text-2xl font-bold">Canciones</h2>
              <span className="text-sm text-on-surface-variant">
                ({results.songs.length})
              </span>
            </div>
            <div className="rounded-2xl bg-surface-container-low overflow-hidden">
              {results.songs.map((song, i) => (
                <a
                  key={song.id}
                  href={`/item/cancion/${song.id}`}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container transition-colors ${
                    i !== results.songs.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <span className="w-6 text-sm text-center text-on-surface-variant shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{song.titulo}</p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {[song.artista_nombre, song.album_titulo]
                        .filter(Boolean)
                        .join(" \u00b7 ")}
                    </p>
                  </div>
                  <span className="text-sm text-on-surface-variant shrink-0">
                    {msToDuration(song.duracion_ms)}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <EmptyState
            title="Sin resultados"
            description={`No encontramos nada para "${term}".`}
          />
        )}
      </div>
    </AppShell>
  );
}
