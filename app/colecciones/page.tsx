import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";
import { getPopularCollections } from "../../services/queries";
import type { PopularCollection } from "../../services/queries";

function CollectionRow({ col }: { col: PopularCollection }) {
  const itemCount = Array.isArray(col.items) ? col.items.length : 0;

  return (
    <Link
      href={`/collection/${col.creador.username}/${col.id}`}
      className="flex items-center justify-between rounded-xl bg-surface-container-low px-6 py-4 hover:bg-surface-container transition-colors cursor-pointer"
    >
      <div className="min-w-0">
        <h3 className="font-headline text-base font-bold truncate">
          {col.nombre}
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5 truncate">
          por{" "}
          {col.creador.nombre ? (
            <span className="font-medium">{col.creador.nombre}</span>
          ) : (
            <span className="font-medium">@{col.creador.username}</span>
          )}
        </p>
        {col.descripcion ? (
          <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">
            {col.descripcion}
          </p>
        ) : null}
      </div>
      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider shrink-0 ml-4">
        {itemCount} items
      </span>
    </Link>
  );
}

export default async function ColeccionesPage() {
  const collections = await getPopularCollections(24);

  return (
    <AppShell>
      <div className="space-y-10">
        <SectionHeader
          eyebrow="Explorar"
          title="Colecciones populares"
          description="Descubre colecciones curadas por la comunidad."
        />

        {collections.length === 0 ? (
          <EmptyState
            title="Sin colecciones"
            description="Aún no hay colecciones públicas. ¡Sé el primero en crear una!"
          />
        ) : (
          <div className="space-y-2">
            {collections.map((col) => (
              <CollectionRow key={col.id} col={col} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
