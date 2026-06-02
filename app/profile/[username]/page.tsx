import Link from "next/link";
import { AppShell } from "../../../components/AppShell";
import { EmptyState } from "../../../components/EmptyState";
import { MediaCard } from "../../../components/MediaCard";
import { ActivityHeatmap } from "../../../components/ActivityHeatmap";
import { RatingDistribution } from "../../../components/RatingDistribution";
import { TopGenres } from "../../../components/TopGenres";
import {
  getProfileByUsername,
  getUserTopAlbums,
  getUserStats,
  getUserActivityHeatmap,
  getUserRatingDistribution,
  getUserTopGenres,
} from "../../../services/queries";
import { Star } from "lucide-react";
import { ProfileHeroClient } from "./ProfileHeroClient";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

function StatsBar({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getUserStats>>;
}) {
  const items = [
    { label: "Albumes", value: stats.albums, trend: "+12%" },
    { label: "Reseñas", value: stats.reviews, trend: "+8%" },
    { label: "Seguidores", value: stats.followers, trend: "+5%" },
    { label: "Horas", value: stats.hours, trend: "+3%" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl bg-surface-container-low p-5"
        >
          <div className="flex items-start justify-between">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              {item.label}
            </p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
              <span className="text-xs leading-none">↑</span>
              {item.trend}
            </span>
          </div>
          <p className="mt-2 font-headline text-3xl font-bold text-primary">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function TopAlbums({
  albums,
}: {
  albums: Awaited<ReturnType<typeof getUserTopAlbums>>;
}) {
  if (albums.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-md">Colección</p>
          <h2 className="font-headline text-2xl font-black text-on-surface">
            Favorite Albums
          </h2>
        </div>
        <Link
          href="/library"
          className="text-sm font-medium text-primary transition-colors hover:text-primary-dim"
        >
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {albums.map((album) => (
          <MediaCard
            key={album.id}
            type="album"
            imageUrl={album.cover_url}
            title={album.titulo}
            subtitle={
              album.fecha_lanzamiento
                ? album.fecha_lanzamiento.slice(0, 4)
                : null
            }
            href={`/item/album/${album.id}`}
            rating={album.userRating}
          />
        ))}
      </div>
    </section>
  );
}

function DiaryTimeline({
  reviews,
}: {
  reviews: Awaited<ReturnType<typeof getProfileByUsername>>["reviews"];
}) {
  if (reviews.length === 0) return null;

  const grouped = reviews.reduce(
    (acc, review) => {
      const dateKey = new Date(review.createdAt)
        .toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, " ");
      if (!acc[dateKey]) acc[dateKey] = [] as any[];
      (acc[dateKey] as any[]).push(review);
      return acc;
    },
    {} as Record<string, typeof reviews>
  );

  const sortedDates = Object.entries(grouped).sort(
    ([a], [b]) =>
      new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <section className="space-y-5">
      <div>
        <p className="label-md">Actividad</p>
        <h2 className="font-headline text-2xl font-black text-on-surface">
          Diario reciente
        </h2>
      </div>
      <div className="relative space-y-8 pl-8">
        <div className="absolute left-[11px] top-2 h-full w-0.5 bg-outline-variant" />
        {sortedDates.map(([dateLabel, dayReviews]) => (
          <div key={dateLabel} className="relative">
            <div className="absolute -left-8 mt-1.5 flex items-center gap-3">
              <div className="z-10 rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-semibold text-on-surface-variant ring-1 ring-outline-variant">
                {dateLabel}
              </div>
            </div>
            <div className="space-y-4 pt-6">
              {dayReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border-l-4 border-primary bg-surface-container-low p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="label-md">
                        Reseñó{" "}
                        {review.itemType === "album"
                          ? "un álbum"
                          : review.itemType === "artista"
                            ? "un artista"
                            : "una canción"}
                      </p>
                      <h3 className="font-headline mt-1 text-lg font-bold text-on-surface">
                        {review.itemTitle}
                      </h3>
                      <div className="mt-2 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const filled = star <= Math.round(review.rating / 2);
                          return (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                filled
                                  ? "fill-primary text-primary"
                                  : "text-on-surface-variant/30"
                              }`}
                            />
                          );
                        })}
                        <span className="ml-1.5 text-xs font-semibold text-primary">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      {review.comment ? (
                        <p className="mt-3 text-sm italic leading-relaxed text-on-surface-variant">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const { profile, reviews } = await getProfileByUsername(username);

  if (!profile) {
    return (
      <AppShell>
        <div className="pt-20">
          <EmptyState
            title="Usuario no encontrado"
            description={`No se encontró el usuario "${username}".`}
          />
        </div>
      </AppShell>
    );
  }

  const [topAlbums, stats, activityDays, ratingBuckets, topGenres] = await Promise.all([
    getUserTopAlbums(profile.id, 8),
    getUserStats(profile.id),
    getUserActivityHeatmap(profile.id),
    getUserRatingDistribution(profile.id),
    getUserTopGenres(profile.id),
  ]);

  return (
    <AppShell>
      <div className="space-y-10">
        <ProfileHeroClient profile={profile} />
        <StatsBar stats={stats} />
        <ActivityHeatmap days={activityDays} totalReviews={stats.reviews} />
        <div className="grid gap-6 md:grid-cols-2">
          <RatingDistribution buckets={ratingBuckets} />
          <TopGenres genres={topGenres} />
        </div>

        {topAlbums.length > 0 || reviews.length > 0 ? (
          <section className="grid gap-10 lg:grid-cols-[1fr,360px]">
            <div className="space-y-10">
              {topAlbums.length > 0 ? <TopAlbums albums={topAlbums} /> : null}
            </div>
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <DiaryTimeline reviews={reviews} />
            </aside>
          </section>
        ) : (
          <EmptyState
            title="Sin actividad"
            description="Este usuario no tiene reseñas ni álbumes favoritos todavía."
          />
        )}
      </div>
    </AppShell>
  );
}
