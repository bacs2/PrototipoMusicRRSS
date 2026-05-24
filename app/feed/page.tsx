import { AppShell } from "../../components/AppShell";
import { EmptyState } from "../../components/EmptyState";
import { ReviewCard } from "../../components/ReviewCard";
import { SectionHeader } from "../../components/SectionHeader";
import { formatDate } from "../../lib/format";
import { getFeedReviews } from "../../services/queries";

export default async function FeedPage() {
  const { items, message } = await getFeedReviews(
    process.env.DEMO_USER_ID
  );

  return (
    <AppShell>
      <div className="space-y-10">
        <SectionHeader
          eyebrow="Feed"
          title="Actividad de personas seguidas"
          description="Resenas y escuchas de tus seguidos."
        />
        <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {items.length === 0 ? (
              <EmptyState
                title="Sin actividad"
                description={message ?? "No hay reseñas todavia."}
              />
            ) : (
              items.map((item) => (
                <ReviewCard
                  key={item.id}
                  title={item.itemTitle}
                  subtitle={`${item.username} · ${item.itemType}`}
                  rating={item.rating}
                  comment={item.comment}
                  meta={formatDate(item.createdAt)}
                />
              ))
            )}
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl bg-surface-container-low p-6">
              <p className="label-md">Trending</p>
              <h3 className="font-headline text-xl font-bold">Lo mas comentado</h3>
              <p className="text-sm text-on-surface-variant mt-2">
                Seccion lista para destacar albums y artistas en tendencia.
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-high p-6">
              <p className="label-md">Semana en sonido</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[
                  { label: "Spins", value: "14" },
                  { label: "Wishlist", value: "08" },
                  { label: "Resenas", value: "03" },
                  { label: "Likes", value: "21" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-surface-container-low p-4 text-center"
                  >
                    <p className="font-headline text-xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="label-md mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
