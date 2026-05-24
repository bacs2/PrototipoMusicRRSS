import { AppShell } from "../../components/AppShell";
import { SectionHeader } from "../../components/SectionHeader";
import { StatCard } from "../../components/StatCard";
import { getLibrarySummary } from "../../services/queries";

export default async function LibraryPage() {
  const summary = await getLibrarySummary(process.env.DEMO_USER_ID);

  return (
    <AppShell>
      <div className="space-y-10">
        <SectionHeader
          eyebrow="Biblioteca"
          title="Tu biblioteca personal"
          description="Colecciones, wishlist e historial en un solo lugar."
        />
        <section className="grid gap-6 md:grid-cols-3">
          <StatCard label="Colecciones" value={summary.collections} />
          <StatCard label="Wishlist" value={summary.wishlist} />
          <StatCard label="Historial" value={summary.history} />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-surface-container-low p-6">
            <p className="label-md">Colecciones</p>
            <h3 className="font-headline text-2xl font-bold">
              Tus listas curadas
            </h3>
            <p className="text-on-surface-variant text-sm mt-2">
              Aqui apareceran las colecciones personalizadas.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-6">
            <p className="label-md">Wishlist</p>
            <h3 className="font-headline text-2xl font-bold">
              Pendientes de escuchar
            </h3>
            <p className="text-on-surface-variant text-sm mt-2">
              Guarda albums o artistas para escucharlos luego.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
