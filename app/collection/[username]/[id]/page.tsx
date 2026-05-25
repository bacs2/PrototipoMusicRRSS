import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { getCollectionPageData } from "@/services/queries";
import type { CollectionPageData, CollectionItemDisplay } from "@/services/queries";
import { getCurrentUserId } from "@/lib/auth";
import { Heart, Share2, Star, Plus, Pencil } from "lucide-react";
import { InlineAnnotationEditor } from "./InlineAnnotationEditor";

type Props = {
  params: Promise<{ username: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
};

const ITEMS_PER_PAGE = 10;

function linkify(text: string): React.ReactNode {
  const urlPattern = /(https?:\/\/[^\s<]+)/g;
  const parts = text.split(urlPattern);
  return parts.map((part, i) => {
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-secondary underline underline-offset-2"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function StarDisplay({ rating, size = "w-3 h-3" }: { rating: number; size?: string }) {
  const filled = Math.round(Math.min(rating / 2, 5));
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${
            s <= filled
              ? "text-primary fill-primary"
              : "text-on-surface-variant/30"
          }`}
        />
      ))}
    </div>
  );
}

function Breadcrumbs({ nombre }: { nombre: string }) {
  return (
    <nav className="text-zinc-500 text-sm mb-8">
      <Link
        href="/library?tab=lists"
        className="hover:text-zinc-300 transition-colors"
      >
        Colecciones
      </Link>
      <span className="mx-2">›</span>
      <span className="text-zinc-300">{nombre}</span>
    </nav>
  );
}

function CatalogChip({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-surface-container-highest px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant label-md">
      {label}
    </span>
  );
}

function ListHero({ data, isOwner }: { data: CollectionPageData; isOwner: boolean }) {
  const allGenres = [
    ...new Set(data.items.flatMap((item) => item.generos)),
  ].slice(0, 6);

  const heroCover =
    data.items.find((item) => item.imageUrl)?.imageUrl ?? null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8 md:p-10">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <div className="relative shrink-0 mx-auto md:mx-0">
          <div className="absolute -inset-4 bg-purple-500/20 blur-xl rounded-full" />
          {heroCover ? (
            <img
              src={heroCover}
              alt={data.nombre}
              className="relative z-10 w-64 h-64 rounded-xl object-cover shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            />
          ) : (
            <div className="relative z-10 w-64 h-64 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <span className="font-headline text-6xl font-black text-on-surface-variant/20">
                ♪
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {allGenres.map((genre) => (
              <CatalogChip key={genre} label={genre} />
            ))}
          </div>

          <h1 className="font-headline text-4xl lg:text-5xl font-black text-white leading-tight">
            {data.nombre}
          </h1>

          <p className="text-sm text-zinc-400">
            A list by{" "}
            <Link
              href={`/profile/${data.creador.username}`}
              className="text-purple-400 font-semibold hover:underline"
            >
              {data.creador.nombre ?? `@${data.creador.username}`}
            </Link>
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors text-sm">
              <Heart className="w-4 h-4" />
              <span>0</span>
            </button>

            <button className="rounded-full border border-white/10 bg-white/5 backdrop-blur px-5 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-all">
              <Plus className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Suggest an addition
            </button>

            {isOwner ? (
              <Link
                href={`/collection/${data.creador.username}/${data.id}/edit`}
                className="rounded-full border border-white/10 bg-white/5 backdrop-blur px-5 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-all flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Link>
            ) : null}
          </div>

          {data.descripcion ? (
            <div className="text-zinc-300 leading-relaxed text-sm md:text-base mt-2 space-y-2">
              {data.descripcion.split("\n").map((paragraph, i) => (
                <p key={i}>{linkify(paragraph)}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ControlsBar({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-b border-white/5 py-3">
      <div />

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          const href = page === 1 ? basePath : `${basePath}?page=${page}`;
          return (
            <Link
              key={page}
              href={href}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "text-white bg-surface-container-highest"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </button>
    </div>
  );
}

function ItemImage({ item, size }: { item: CollectionItemDisplay; size: string }) {
  const href =
    item.item_type === "album"
      ? `/item/album/${item.item_id}`
      : item.item_type === "artista"
        ? `/item/artista/${item.item_id}`
        : `/item/cancion/${item.item_id}`;

  const imgClass = `${size} rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`;

  return (
    <Link href={href} className="shrink-0 mx-auto md:mx-0">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className={imgClass} />
      ) : (
        <div
          className={`${size} rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}
        >
          <span className="font-headline text-3xl font-bold text-on-surface-variant/30">
            {item.title.charAt(0)}
          </span>
        </div>
      )}
    </Link>
  );
}

function ListItem({
  item,
  isOwner,
  collectionId,
}: {
  item: CollectionItemDisplay;
  isOwner: boolean;
  collectionId: string;
}) {
  const typeLabel =
    item.item_type === "artista"
      ? "Artista"
      : item.item_type === "album"
        ? "Álbum"
        : "Canción";

  return (
    <article className="flex flex-col md:flex-row gap-6 py-8 border-b border-white/5">
      <ItemImage item={item} size="w-32 h-32 md:w-40 md:h-40" />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant label-md">
            {typeLabel}
          </span>
        </div>

        <h3 className="font-bold text-lg truncate mt-0.5">{item.title}</h3>

        {item.subtitle ? (
          <p className="text-sm text-zinc-400 truncate">{item.subtitle}</p>
        ) : null}

        {item.year ? (
          <span className="text-sm text-zinc-500">{item.year}</span>
        ) : null}

        {item.avg_rating !== null ? (
          <div className="flex items-center gap-2 mt-1.5">
            <StarDisplay rating={item.avg_rating} size="w-3 h-3" />
            <span className="text-xs font-semibold text-primary">
              {(item.avg_rating / 2).toFixed(1)}
            </span>
          </div>
        ) : null}

        {item.annotation ? (
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mt-3">
            {linkify(item.annotation)}
          </p>
        ) : null}

        {isOwner ? (
          <InlineAnnotationEditor
            collectionId={collectionId}
            itemType={item.item_type}
            itemId={item.item_id}
            currentAnnotation={item.annotation}
          />
        ) : null}

        {item.must_listen ? (
          <p className="text-primary font-semibold text-sm mt-2">
            Must-listen: {item.must_listen}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { username, id } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, Number(pageStr) || 1);

  const data = await getCollectionPageData(username, id);
  const currentUserId = await getCurrentUserId();

  if (!data) {
    return (
      <AppShell>
        <EmptyState
          title="Colección no encontrada"
          description={`No se encontró la colección con el usuario "${username}".`}
        />
      </AppShell>
    );
  }

  const isOwner = currentUserId !== undefined;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = data.items.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(data.items.length / ITEMS_PER_PAGE);

  const basePath = `/collection/${username}/${id}`;

  return (
    <AppShell>
      <div className="space-y-8">
        <Breadcrumbs nombre={data.nombre} />

        <ListHero data={data} isOwner={isOwner} />

        {data.items.length > 0 ? (
          <>
            {totalPages > 1 && (
              <ControlsBar
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={basePath}
              />
            )}

            <section className="divide-y-0">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <ListItem
                    key={`${item.item_type}-${item.item_id}`}
                    item={item}
                    isOwner={isOwner}
                    collectionId={id}
                  />
                ))
              ) : (
                <p className="text-center text-zinc-500 py-12">
                  No hay elementos en esta página.
                </p>
              )}
            </section>
          </>
        ) : (
          <EmptyState
            title="Lista vacía"
            description="Esta colección aún no tiene álbumes."
          />
        )}
      </div>
    </AppShell>
  );
}
