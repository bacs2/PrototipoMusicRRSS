import { AppShell } from "../../components/AppShell";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";
import { ActivityTimeline } from "../../components/ActivityTimeline";
import { TrendingCarousel } from "../../components/TrendingCarousel";
import { FriendActivityList } from "../../components/FriendActivityList";
import { WeekInSound } from "../../components/WeekInSound";
import { TrendingTags } from "../../components/TrendingTags";
import { SuggestedUsers } from "../../components/SuggestedUsers";
import { formatDate } from "../../lib/format";
import { getFeedReviews } from "../../services/queries";
import { getCurrentUserId } from "../../lib/auth";

export default async function FeedPage() {
  const userId = await getCurrentUserId();
  const { items, message } = await getFeedReviews(userId);

  const timelineItems = items.map((item) => ({
    id: item.id,
    date: formatDate(item.createdAt),
    user: { name: item.username },
    action: `Reseñó: ${item.itemTitle}`,
    description: item.comment,
  }));

  return (
    <AppShell>
      <div className="space-y-10">
        <TrendingCarousel />
        <FriendActivityList />
        <section className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Feed"
              title="Actividad de personas seguidas"
              description="Resenas y escuchas de tus seguidos."
            />
            {items.length === 0 ? (
              <EmptyState
                title="Sin actividad"
                description={message ?? "No hay reseñas todavia."}
              />
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-6">
                <ActivityTimeline items={timelineItems} />
              </div>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <SuggestedUsers />
            <WeekInSound />
            <TrendingTags />
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
