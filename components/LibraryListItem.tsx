import Link from "next/link";
import type { ReactNode } from "react";
import { Disc3, Music2, Star, UserRound } from "lucide-react";
import type { ItemType } from "../types/models";

type LibraryListItemData = {
  itemType: ItemType;
  itemId: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
};

type LibraryListItemProps = {
  item: LibraryListItemData;
  details?: ReactNode;
  footer?: ReactNode;
};

const ITEM_META: Record<
  ItemType,
  {
    label: string;
    fallbackIcon: typeof UserRound;
    rounded: string;
  }
> = {
  artista: {
    label: "Artista",
    fallbackIcon: UserRound,
    rounded: "rounded-full",
  },
  album: {
    label: "Álbum",
    fallbackIcon: Disc3,
    rounded: "rounded-2xl",
  },
  cancion: {
    label: "Canción",
    fallbackIcon: Music2,
    rounded: "rounded-2xl",
  },
};

export const LibraryListItem = ({ item, details, footer }: LibraryListItemProps) => {
  const meta = ITEM_META[item.itemType];
  const hasRating = item.rating !== undefined && item.rating !== null;
  const FallbackIcon = meta.fallbackIcon;

  return (
    <article className="space-y-3">
      <Link
        href={`/item/${item.itemType}/${item.itemId}`}
        className="group flex w-full items-center gap-4 rounded-2xl bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
      >
        <div
          className={`relative h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20 ${meta.rounded} bg-gradient-to-br from-surface-container-high to-surface-container-highest shadow-[0_8px_20px_rgba(0,0,0,0.24)]`}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${meta.rounded}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FallbackIcon className="h-8 w-8 text-on-surface-variant/35" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant label-md">
            {meta.label}
          </p>
          <h3 className="mt-1 truncate font-headline text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="mt-0.5 truncate text-sm text-on-surface-variant">
              {item.subtitle}
            </p>
          ) : null}
        </div>

        {hasRating ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1.5 text-sm font-semibold text-on-surface">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>{Number(item.rating).toFixed(1)}</span>
          </div>
        ) : null}
      </Link>

      {details ? <div className="pl-0 sm:pl-24">{details}</div> : null}
      {footer ? <div className="pl-0 sm:pl-24">{footer}</div> : null}
    </article>
  );
};
