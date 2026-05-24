import { AppShell } from "../../../components/AppShell";
import { EmptyState } from "../../../components/EmptyState";
import { ReviewCard } from "../../../components/ReviewCard";
import { SectionHeader } from "../../../components/SectionHeader";
import { getProfileByUsername } from "../../../services/queries";

type ProfilePageProps = {
  params: { username: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { profile, reviews } = await getProfileByUsername(params.username);

  return (
    <AppShell>
      <div className="space-y-10">
        <div className="relative rounded-3xl bg-surface-container-low p-8 overflow-hidden">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
          <SectionHeader
            eyebrow="Perfil"
            title={profile ? `@${profile.username}` : "Usuario no encontrado"}
            description={profile?.bio ?? "Actividad reciente y datos del usuario."}
          />
        </div>
        <section className="grid gap-6 md:grid-cols-4">
          {["Albums", "Resenas", "Followers", "Horas"].map((label) => (
            <div
              key={label}
              className="rounded-xl bg-surface-container-low p-6"
            >
              <p className="label-md">{label}</p>
              <p className="font-headline text-3xl font-bold text-primary">
                0
              </p>
            </div>
          ))}
        </section>
        <section className="space-y-4">
          {profile && reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                title={review.itemTitle}
                subtitle={review.itemType}
                rating={review.rating}
                comment={review.comment}
              />
            ))
          ) : (
            <EmptyState
              title="Sin actividad"
              description="No hay reseñas recientes."
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}
