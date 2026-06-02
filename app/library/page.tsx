import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { EmptyState } from "../../components/EmptyState";
import { StatCard } from "../../components/StatCard";
import { SectionHeader } from "../../components/SectionHeader";
import { LibraryCard } from "../../components/LibraryCard";
import { supabaseServer } from "../../lib/supabase/server";
import {
  getUserRankedItems,
  getUserCollections,
} from "../../services/queries";
import type { LibraryItem, UserCollection } from "../../services/queries";
import { Album, Music, User, Bookmark } from "lucide-react";
import { getCurrentUserId } from "../../lib/auth";
import { CreateCollectionButton } from "../../components/CreateCollectionButton";

const TABS = [
  { id: "all", label: "ALL" },
  { id: "albums", label: "ALBUMS" },
  { id: "songs", label: "SONGS" },
  { id: "artists", label: "ARTISTS" },
  { id: "lists", label: "LISTS" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type LibraryPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function ItemsGrid({ items }: { items: LibraryItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {items.map((item) => (
        <LibraryCard key={item.reviewId} item={item} />
      ))}
    </div>
  );
}

function CollectionsGrid({
  collections,
  username,
}: {
  collections: UserCollection[];
  username: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {collections.map((col) => (
        <Link
          key={col.id}
          href={`/collection/${username}/${col.id}`}
          className="rounded-2xl bg-surface-container-low p-6 hover:bg-surface-container transition-colors cursor-pointer block"
        >
          <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 flex items-center justify-center">
            <Bookmark className="w-8 h-8 text-on-surface-variant/40" />
          </div>
          <h3 className="font-headline text-base font-bold truncate">
            {col.nombre}
          </h3>
          {col.descripcion ? (
            <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
              {col.descripcion}
            </p>
          ) : null}
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-3">
            {Array.isArray(col.items) ? col.items.length : 0} items
          </p>
        </Link>
      ))}
    </div>
  );
}

export default async function LibraryPage({
  searchParams,
}: LibraryPageProps) {
  const { tab = "all" } = await searchParams;
  const activeTab: TabId = TABS.some((t) => t.id === tab)
    ? (tab as TabId)
    : "all";

  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <AppShell>
        <EmptyState
          title="No autenticado"
          description="Inicia sesión para ver tu biblioteca."
        />
      </AppShell>
    );
  }

  const supabase = await supabaseServer();

  const { data: userData } = await supabase
    .from("Datos_usuario")
    .select("username")
    .eq("id", userId)
    .single();
  const currentUsername = userData?.username;

  const [albumCount, songCount, artistCount, listCount] = await Promise.all([
    supabase
      .from("Resenas_de_usuario")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", userId)
      .eq("item_type", "album")
      .then((r) => r.count ?? 0),
    supabase
      .from("Resenas_de_usuario")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", userId)
      .eq("item_type", "cancion")
      .then((r) => r.count ?? 0),
    supabase
      .from("Resenas_de_usuario")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", userId)
      .eq("item_type", "artista")
      .then((r) => r.count ?? 0),
    supabase
      .from("Coleccion_o_Lista")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", userId)
      .then((r) => r.count ?? 0),
  ]);

  const [albums, artists, songs, collections] = await Promise.all([
    activeTab === "all" || activeTab === "albums"
      ? getUserRankedItems(userId, "album")
      : Promise.resolve([] as LibraryItem[]),
    activeTab === "all" || activeTab === "artists"
      ? getUserRankedItems(userId, "artista")
      : Promise.resolve([] as LibraryItem[]),
    activeTab === "all" || activeTab === "songs"
      ? getUserRankedItems(userId, "cancion")
      : Promise.resolve([] as LibraryItem[]),
    activeTab === "all" || activeTab === "lists"
      ? getUserCollections(userId)
      : Promise.resolve([] as UserCollection[]),
  ]);

  return (
    <AppShell>
      <div className="space-y-10">
        <SectionHeader
          eyebrow="Biblioteca"
          title="Tu colección"
          description="Todo lo que has rankeado en un solo lugar."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Albumes"
            value={albumCount}
          />
          <StatCard
            label="Canciones"
            value={songCount}
          />
          <StatCard
            label="Artistas"
            value={artistCount}
          />
          <StatCard
            label="Listas"
            value={listCount}
          />
        </div>

        <div className="flex items-center gap-8 border-b border-white/5 pb-1">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <Link
                key={t.id}
                href={t.id === "all" ? "/library" : `/library?tab=${t.id}`}
                className={`text-sm font-medium tracking-wider pb-3 transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant border-b-2 border-transparent hover:text-on-surface"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {activeTab === "all" ? (
          <div className="space-y-12">
            {artists.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-4 h-4 text-on-surface-variant" />
                  <h2 className="font-headline text-xl font-bold">
                    Artistas
                  </h2>
                  <span className="text-sm text-on-surface-variant">
                    ({artists.length})
                  </span>
                </div>
                <ItemsGrid items={artists} />
              </section>
            )}
            {albums.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Album className="w-4 h-4 text-on-surface-variant" />
                  <h2 className="font-headline text-xl font-bold">Albumes</h2>
                  <span className="text-sm text-on-surface-variant">
                    ({albums.length})
                  </span>
                </div>
                <ItemsGrid items={albums} />
              </section>
            )}
            {songs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Music className="w-4 h-4 text-on-surface-variant" />
                  <h2 className="font-headline text-xl font-bold">
                    Canciones
                  </h2>
                  <span className="text-sm text-on-surface-variant">
                    ({songs.length})
                  </span>
                </div>
                <ItemsGrid items={songs} />
              </section>
            )}
            {collections.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Bookmark className="w-4 h-4 text-on-surface-variant" />
                  <h2 className="font-headline text-xl font-bold">Listas</h2>
                  <span className="text-sm text-on-surface-variant">
                    ({collections.length})
                  </span>
                </div>
                <CollectionsGrid collections={collections} username={currentUsername ?? "demo"} />
              </section>
            )}
            {artists.length === 0 &&
              albums.length === 0 &&
              songs.length === 0 &&
              collections.length === 0 && (
                <EmptyState
                  title="Tu biblioteca esta vacia"
                  description="Los items que rankees apareceran aqui."
                />
              )}
          </div>
        ) : activeTab === "lists" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold">Mis colecciones</h2>
              <CreateCollectionButton username={currentUsername ?? "demo"} />
            </div>
            {collections.length > 0 ? (
              <section>
                <CollectionsGrid collections={collections} username={currentUsername ?? "demo"} />
              </section>
            ) : (
              <EmptyState
                title="Sin listas"
                description="Aun no has creado ninguna lista."
              />
            )}
          </div>
        ) : activeTab === "albums" ? (
          albums.length > 0 ? (
            <ItemsGrid items={albums} />
          ) : (
            <EmptyState
              title="Sin albumes"
              description="Aun no has rankeado albumes."
            />
          )
        ) : activeTab === "songs" ? (
          songs.length > 0 ? (
            <ItemsGrid items={songs} />
          ) : (
            <EmptyState
              title="Sin canciones"
              description="Aun no has rankeado canciones."
            />
          )
        ) : activeTab === "artists" ? (
          artists.length > 0 ? (
            <ItemsGrid items={artists} />
          ) : (
            <EmptyState
              title="Sin artistas"
              description="Aun no has rankeado artistas."
            />
          )
        ) : null}
      </div>
    </AppShell>
  );
}
