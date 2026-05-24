import { AppShell } from "../../../../components/AppShell";
import { EmptyState } from "../../../../components/EmptyState";
import { ReviewCard } from "../../../../components/ReviewCard";
import { SectionHeader } from "../../../../components/SectionHeader";
import { getItemDetails, getItemReviews } from "../../../../services/queries";
import type { ItemType } from "../../../../types/models";

type ItemPageProps = {
  params: { type: ItemType; id: string };
};

export default async function ItemPage({ params }: ItemPageProps) {
  const item = await getItemDetails(params.type, params.id);
  const reviews = await getItemReviews(params.type, params.id);

  return (
    <AppShell>
      <div className="space-y-10">
        <section className="relative rounded-3xl bg-surface-container-low p-8 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[140px]" />
          <SectionHeader
            eyebrow="Item"
            title={item?.titulo ?? item?.nombre ?? "Item"}
            description={
              item?.generos?.length
                ? item.generos.join(", ")
                : "Metadata, generos y reseñas."
            }
          />
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-on-surface-variant">
            <span>Tipo: {params.type}</span>
            <span>ID: {params.id}</span>
            {item?.fecha_lanzamiento ? (
              <span>Fecha: {item.fecha_lanzamiento}</span>
            ) : null}
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <EmptyState
                title="Sin reseñas"
                description="Este item aun no tiene reseñas."
              />
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  title={review.usuario?.username ?? "usuario"}
                  subtitle={params.type}
                  rating={review.rating}
                  comment={review.comentario}
                />
              ))
            )}
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl bg-surface-container-high p-6">
              <p className="label-md">Resena rapida</p>
              <p className="font-headline text-xl font-bold">Califica</p>
              <div className="mt-4 h-10 rounded-full bg-surface-container-highest" />
              <button className="mt-4 w-full rounded-full bg-gradient-to-br from-primary to-primary-dim py-3 text-sm font-bold text-white">
                Publicar
              </button>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-6">
              <p className="label-md">Actividad</p>
              <p className="text-sm text-on-surface-variant mt-2">
                Estadisticas comunitarias y listas relacionadas.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
