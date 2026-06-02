import { AppShell } from "../../../../components/AppShell";
import { EmptyState } from "../../../../components/EmptyState";
import { ReviewCard } from "../../../../components/ReviewCard";
import { SectionHeader } from "../../../../components/SectionHeader";
import { MediaCard } from "../../../../components/MediaCard";
import { RatingBar } from "../../../../components/RatingBar";
import { RatingPanel } from "../../../../components/RatingPanel";
import { Tracklist } from "../../../../components/Tracklist";
import { ItemShareButton } from "../../../../components/ItemShareButton";
import {
  getItemDetails,
  getItemReviews,
  getAlbumTracks,
  getArtistAlbums,
  getArtistTopRatedAlbums,
} from "../../../../services/queries";
import type { TopRatedAlbum } from "../../../../services/queries";
import type { ItemType, RatingDistribution } from "../../../../types/models";
import {
  Star,
  Play,
  TrendingUp,
  Menu,
} from "lucide-react";
import { getCurrentUserId } from "../../../../lib/auth";

export const revalidate = 0;

const mockRatingDistribution: RatingDistribution[] = [
  { stars: 5, count: 12, percentage: 40 },
  { stars: 4, count: 9, percentage: 30 },
  { stars: 3, count: 6, percentage: 20 },
  { stars: 2, count: 2, percentage: 7 },
  { stars: 1, count: 1, percentage: 3 },
];

const mockTracks = [
  { number: 1, title: "Midnight Dreams", duration: "3:45", active: false },
  { number: 2, title: "Neon Lights", duration: "4:12", active: false },
  { number: 3, title: "Digital Rain", duration: "5:08", active: true },
  { number: 4, title: "Synthwave Boulevard", duration: "3:30", active: false },
  { number: 5, title: "Pulse", duration: "4:55", active: false },
  { number: 6, title: "Vapor Trail", duration: "2:48", active: false },
  { number: 7, title: "Chrome Hearts", duration: "6:01", active: false },
  { number: 8, title: "Retrograde", duration: "3:22", active: false },
  { number: 9, title: "Outer Rim", duration: "4:37", active: false },
  { number: 10, title: "Final Transmission", duration: "3:55", active: false },
];

const mockFeaturedLists = [
  { id: "1", title: "Synthwave Essentials", creator: "@djneon" },
  { id: "2", title: "Late Night Drives", creator: "@cruiser" },
  { id: "3", title: "80s Revival", creator: "@retroking" },
];

const mockUserReviews = [
  { id: "r1", username: "maria92", rating: 8.5, comment: "Increible produccion, cada track es un viaje sonoro unico.", date: "2d ago", likes: 24, replies: 3 },
  { id: "r2", username: "beatmaker", rating: 9.0, comment: "Album del año sin duda. La mezcla de sintetizadores es perfecta.", date: "5d ago", likes: 18, replies: 1 },
  { id: "r3", username: "vinylcollector", rating: 7.5, comment: "Bueno pero la segunda mitad pierde intensidad.", date: "1w ago", likes: 12, replies: 0 },
];

const mockAttributes = [
  { name: "Production Quality", score: 9.4, color: "bg-primary" },
  { name: "Lyrical Depth", score: 8.7, color: "bg-secondary" },
  { name: "Innovation Factor", score: 7.5, color: "bg-primary-dim" },
];

const mockMetrics = { totalLogs: "12.4K", wishlists: "3.8K" };

function msToDuration(ms: number | null): string {
  if (!ms) return "0:00";
  const totalSecs = Math.round(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type TrackMock = (typeof mockTracks)[number];
type ListMock = (typeof mockFeaturedLists)[number];
type UserReviewMock = (typeof mockUserReviews)[number];
type AttributeMock = (typeof mockAttributes)[number];

type ItemPageProps = {
  params: Promise<{ type: ItemType; id: string }>;
};

function FeaturedLists({ lists }: { lists: ListMock[] }) {
  return (
    <div className="rounded-2xl bg-surface-container-low border border-white/5 p-6">
      <h3 className="font-headline text-xl font-bold mb-4">Featured In Lists</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {lists.map((list) => (
          <div key={list.id} className="min-w-[180px] shrink-0 rounded-xl bg-surface-container p-4 border border-white/5 hover:bg-surface-container-high transition-colors cursor-pointer">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 mb-3 flex items-center justify-center">
              <span className="text-2xl opacity-30">&#9835;</span>
            </div>
            <p className="text-sm font-bold truncate">{list.title}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{list.creator}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityRatings({
  distribution,
  attributes,
  metrics,
}: {
  distribution: RatingDistribution[];
  attributes: AttributeMock[];
  metrics: typeof mockMetrics;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low border border-white/5 p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="label-md">Rating comunitario</p>
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-headline text-xl font-bold">Distribucion</h3>
        <div className="mt-4 space-y-2">
          {distribution.map((r) => (
            <RatingBar key={r.stars} stars={r.stars} percentage={r.percentage} count={r.count} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-headline text-base font-bold">Atributos</h3>
        {attributes.map((attr) => (
          <div key={attr.name}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-on-surface-variant">{attr.name}</span>
              <span className="font-bold">{attr.score.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div className={`h-full rounded-full ${attr.color} transition-all`} style={{ width: `${attr.score * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-container p-4 text-center">
          <p className="text-xs text-on-surface-variant mb-1">TOTAL LOGS</p>
          <p className="font-headline text-2xl font-bold text-primary">{metrics.totalLogs}</p>
        </div>
        <div className="rounded-xl bg-surface-container p-4 text-center">
          <p className="text-xs text-on-surface-variant mb-1">WISHLISTS</p>
          <p className="font-headline text-2xl font-bold text-secondary">{metrics.wishlists}</p>
        </div>
      </div>
    </div>
  );
}

function UserReviewsSection({ reviews }: { reviews: UserReviewMock[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-xl font-bold">User Reviews</h3>
        <a href="#" className="text-xs text-primary hover:underline font-medium">See all reviews</a>
      </div>
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No hay reseñas todavia.</p>
        ) : (
          reviews.map((r) => (
            <ReviewCard
              key={r.id}
              title={r.username}
              subtitle={`${(r.rating / 2).toFixed(1)}/5`}
              rating={r.rating}
              comment={r.comment}
              meta={r.date}
              likes={r.likes}
              replies={r.replies}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AlbumHero({
  item,
  avgRating,
  itemType,
  reviewsCount,
}: {
  item: Record<string, unknown> | null;
  avgRating: number | null;
  itemType: ItemType;
  reviewsCount: number;
}) {
  const coverUrl = item && "cover_url" in item ? (item.cover_url as string) : null;
  const titulo = (item?.titulo as string) ?? "Album";
  const artista = item && "Artistas" in item ? (item.Artistas as Record<string, unknown>) : null;
  const artistaNombre = (artista?.nombre as string) ?? null;
  const artistaAvatar = (artista?.avatar_url as string) ?? null;
  const fecha = (item?.fecha_lanzamiento as string) ?? null;
  const generos = item && "generos" in item ? (item.generos as string[]) : null;
  const defaultRating = avgRating ?? 4.8;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative shrink-0">
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full" />
          {coverUrl ? (
            <img src={coverUrl} alt={titulo} className="relative z-10 w-72 h-72 rounded-xl object-cover shadow-[0_20px_40px_rgba(0,0,0,0.4)]" />
          ) : (
            <div className="relative z-10 w-72 h-72 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <span className="text-6xl opacity-20">&#9835;</span>
            </div>
          )}
          <span className="absolute bottom-3 right-3 z-20 bg-background/80 backdrop-blur-sm rounded-md px-2.5 py-1 text-[10px] font-bold text-on-surface-variant tracking-wider">
            CATALOG NO. 001
          </span>
        </div>
        <div className="flex-1 min-w-0 space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full tracking-wide">ESSENTIAL</span>
            {fecha ? <span className="text-sm text-on-surface-variant">{fecha}</span> : null}
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-on-surface via-on-surface to-primary bg-clip-text text-transparent leading-tight">
            {titulo}
          </h1>
          <div className="flex items-center gap-3">
            {artistaAvatar ? (
              <img src={artistaAvatar} alt={artistaNombre ?? ""} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="text-xs font-bold text-on-surface-variant">{artistaNombre?.charAt(0) ?? "?"}</span>
              </div>
            )}
            <span className="text-on-surface-variant font-medium">{artistaNombre ?? "Artista"}</span>
            {generos && generos.length > 0 ? (
              <span className="text-on-surface-variant/50 hidden sm:inline">&middot; {generos.join(", ")}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="label-md">GLOBAL RATING</span>
            <span className="font-headline text-3xl font-bold text-primary">{defaultRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-primary fill-primary" />
              ))}
            </div>
            <span className="text-sm text-on-surface-variant">({reviewsCount} reseñas)</span>
            <div className="ml-auto">
              <ItemShareButton title={titulo} subtitle={artistaNombre ?? undefined} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtistHero({
  artista,
  albumsCount,
  listeners,
}: {
  artista: Record<string, unknown> | null;
  albumsCount: number;
  listeners: string;
}) {
  if (!artista) return null;

  const nombre = (artista.nombre as string) ?? "Artista";
  const generos = (artista.generos as string[]) ?? [];
  const avatarUrl = (artista.avatar_url as string) ?? null;
  const metadata = (artista.metadata as Record<string, unknown>) ?? {};
  const location = (metadata.pais as string) ?? "Global";

  return (
    <section className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
      <div className="shrink-0 w-full md:w-auto">
        <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
              <span className="font-headline text-6xl font-black text-on-surface-variant/30">
                {nombre.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-6 pt-2">
        <div className="flex flex-wrap gap-2">
          {generos.map((g) => (
            <span
              key={g}
              className="rounded-full bg-surface-container-high/50 backdrop-blur-sm border border-outline-variant/20 px-3 py-1 text-[10px] tracking-widest uppercase text-on-surface-variant"
            >
              {g}
            </span>
          ))}
          <span className="rounded-full bg-surface-container-high/50 backdrop-blur-sm border border-outline-variant/20 px-3 py-1 text-[10px] tracking-widest uppercase text-on-surface-variant">
            {location}
          </span>
        </div>
        <h1 className="font-headline text-7xl md:text-8xl font-black uppercase tracking-tighter text-on-surface leading-none">
          {nombre}
        </h1>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-2xl font-bold text-on-surface">{listeners}</p>
            <p className="text-xs text-zinc-500 tracking-wider uppercase">
              Listeners
            </p>
          </div>
          <span className="text-on-surface-variant/30 text-3xl font-light">
            |
          </span>
          <div>
            <p className="text-2xl font-bold text-on-surface">{albumsCount}</p>
            <p className="text-xs text-zinc-500 tracking-wider uppercase">
              Works
            </p>
          </div>
          <div className="ml-auto">
            <ItemShareButton title={nombre} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BiographySection({ bio }: { bio: string | null }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Menu className="w-4 h-4 text-on-surface-variant" />
        <h2 className="font-headline text-lg font-bold">Biography</h2>
      </div>
      {bio ? (
        <p className="text-sm text-zinc-300 leading-relaxed">{bio}</p>
      ) : (
        <p className="text-sm text-on-surface-variant italic">
          No hay biografía disponible.
        </p>
      )}
    </div>
  );
}

function HighlyRatedSection({
  albums,
}: {
  albums: TopRatedAlbum[];
}) {
  if (albums.length === 0) return null;

  return (
    <div className="bg-[#121214] rounded-2xl p-6">
      <h2 className="font-headline text-lg font-bold mb-6">Highly Rated</h2>
      <div className="space-y-5">
        {albums.map((album) => (
          <div key={album.id} className="flex gap-3 items-start">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
              {album.cover_url ? (
                <img
                  src={album.cover_url}
                  alt={album.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-on-surface-variant/50">
                    {album.titulo.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{album.titulo}</p>
              <p className="text-xs text-on-surface-variant">
                {album.fecha_lanzamiento
                  ? album.fecha_lanzamiento.slice(0, 4)
                  : "\u2014"}
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled =
                    star <= Math.round(album.avgRating / 2);
                  return (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        filled
                          ? "text-primary fill-primary"
                          : "text-on-surface-variant/30"
                      }`}
                    />
                  );
                })}
                <span className="text-[10px] text-on-surface-variant ml-1">
                  {(album.avgRating / 2).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlbumCard({
  album,
}: {
  album: {
    id: string;
    titulo: string;
    cover_url: string | null;
    fecha_lanzamiento: string | null;
  };
}) {
  const year = album.fecha_lanzamiento
    ? album.fecha_lanzamiento.slice(0, 4)
    : "\u2014";

  return (
    <a href={`/item/album/${album.id}`} className="group cursor-pointer">
      <div className="aspect-square rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
            <span className="font-headline text-4xl font-bold text-on-surface-variant/30">
              {album.titulo.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-headline text-sm font-bold truncate group-hover:text-primary transition-colors">
          {album.titulo}
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {year} &middot; LP
        </p>
      </div>
    </a>
  );
}

function DiscographySection({
  albums,
}: {
  albums: {
    id: string;
    titulo: string;
    cover_url: string | null;
    fecha_lanzamiento: string | null;
  }[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold italic">
          DISCOGRAPHY
        </h2>
        <div className="flex items-center gap-6">
          {["ALL", "ALBUMS", "SINGLES"].map((filter) => (
            <button
              key={filter}
              className={`text-sm font-medium tracking-wider pb-1 border-b-2 transition-colors ${
                filter === "ALL"
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-on-surface"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      {albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant italic">
          No hay discografía disponible.
        </p>
      )}
      {albums.length > 8 && (
        <div className="flex justify-center pt-4">
          <button className="rounded-full bg-surface-container-high hover:bg-surface-container-highest px-8 py-3 text-sm font-medium text-on-surface transition-colors">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { type, id } = await params;
  const userId = await getCurrentUserId();
  const item = await getItemDetails(type, id);
  const reviews = await getItemReviews(type, id);
  const dbTracks =
    type === "album" ? await getAlbumTracks(id) : [];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  if (type === "album") {
    return (
      <AppShell>
        <div className="space-y-10">
          <AlbumHero
            item={item as Record<string, unknown> | null}
            avgRating={avgRating}
            itemType={type}
            reviewsCount={reviews.length}
          />
          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Tracklist
                tracks={
                  dbTracks.length > 0
                    ? dbTracks.map((t) => ({
                        number: t.posicion,
                        title: t.titulo,
                        duration: msToDuration(t.duracion_ms),
                        active: false,
                        dbId: t.id,
                      }))
                    : mockTracks
                }
              />
              <FeaturedLists lists={mockFeaturedLists} />
            </div>
            <aside className="space-y-6">
              <RatingPanel
                itemType={type}
                itemId={id}
                itemTitle={(item as { titulo?: string }).titulo ?? undefined}
                userId={userId}
              />
              <CommunityRatings
                distribution={mockRatingDistribution}
                attributes={mockAttributes}
                metrics={mockMetrics}
              />
              <UserReviewsSection reviews={mockUserReviews} />
            </aside>
          </section>
        </div>
      </AppShell>
    );
  }

  if (type === "artista") {
    const artista = item as Record<string, unknown> | null;
    const artistAlbums = artista ? await getArtistAlbums(id) : [];
    const topRated = artista ? await getArtistTopRatedAlbums(id, 5) : [];
    const listeners = artista
      ? `${(Math.max(artistAlbums.length * 0.5 + 1.2, 1.2)).toFixed(1)}M`
      : "\u2014";

    return (
      <AppShell>
        <div className="space-y-12">
          <ArtistHero
            artista={artista}
            albumsCount={artistAlbums.length}
            listeners={listeners}
          />
          <section className="grid gap-8 lg:grid-cols-[35%_1fr]">
            <div className="space-y-8">
              <BiographySection
                bio={artista ? (artista.bio as string | null) : null}
              />
              {topRated.length > 0 ? (
                <HighlyRatedSection albums={topRated} />
              ) : null}
            </div>
            <div className="space-y-8">
              <DiscographySection albums={artistAlbums} />
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-10">
        <section className="relative rounded-3xl bg-surface-container-low p-8 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[140px]" />
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {item && "cover_url" in item && item.cover_url ? (
              <MediaCard
                type="album"
                imageUrl={item.cover_url as string}
                title={(item as unknown as Record<string, unknown>)?.titulo as string ?? ""}
                subtitle={(() => {
                  const artistas = (item as unknown as Record<string, unknown>)?.Artistas as { nombre?: string }[] | undefined;
                  return artistas?.[0]?.nombre ?? "";
                })()}
              />
            ) : null}
            <div className="flex-1 min-w-0">
              <SectionHeader
                eyebrow="Item"
                title={((item as unknown as Record<string, unknown>)?.titulo ?? (item as unknown as Record<string, unknown>)?.nombre ?? "Item") as string}
                description={
                  ((item as unknown as Record<string, unknown>)?.generos as string[])?.length
                    ? ((item as unknown as Record<string, unknown>)?.generos as string[]).join(", ")
                    : "Metadata, generos y reseñas."
                }
              />
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-on-surface-variant">
                <span>Tipo: {type}</span>
                {avgRating !== null ? (
                  <span className="font-semibold text-primary">
                    {avgRating.toFixed(1)} avg · {reviews.length} reseñas
                  </span>
                ) : null}
                {(item as unknown as Record<string, unknown>)?.fecha_lanzamiento ? (
                  <span>Fecha: {(item as unknown as Record<string, unknown>).fecha_lanzamiento as string}</span>
                ) : null}
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <EmptyState title="Sin reseñas" description="Este item aun no tiene reseñas." />
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  title={(review.usuario as { username?: string })?.username ?? "usuario"}
                  subtitle={type}
                  rating={review.rating}
                  comment={review.comentario}
                />
              ))
            )}
          </div>
          <aside className="space-y-6">
            <RatingPanel
              itemType={type}
              itemId={id}
              itemTitle={((item as unknown as Record<string, unknown>)?.titulo as string | undefined) ?? (item as unknown as Record<string, unknown>)?.nombre as string | undefined}
              userId={userId}
            />
            <div className="rounded-2xl bg-surface-container-low border border-white/5 p-6">
              <p className="label-md">Rating comunitario</p>
              <h3 className="font-headline text-xl font-bold mt-1">Distribucion</h3>
              <div className="mt-4 space-y-2">
                {mockRatingDistribution.map((r) => (
                  <RatingBar key={r.stars} stars={r.stars} percentage={r.percentage} count={r.count} />
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
