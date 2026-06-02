import { Star } from "lucide-react";
import type { LibraryItem } from "../services/queries";

type LibraryCardProps = {
  item: LibraryItem;
};

export const LibraryCard = ({ item }: LibraryCardProps) => {
  const isArtist = item.itemType === "artista";
  const stars = Math.round((item.rating ?? 0) / 2);

  return (
    <a
      href={`/item/${item.itemType}/${item.itemId}`}
      className="group cursor-pointer"
    >
      <div
        className={`relative aspect-square overflow-hidden ${
          isArtist ? "rounded-full" : "rounded-xl"
        } shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
            <span className="text-on-surface-variant font-headline text-4xl font-bold opacity-30">
              {isArtist ? "\u{1F464}" : "\u{1F4BF}"}
            </span>
          </div>
        )}
      </div>
      <div className={isArtist ? "text-center mt-3" : "mt-3"}>
        <h3 className="font-headline text-sm font-bold truncate group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        {item.subtitle ? (
          <p className="text-xs text-on-surface-variant truncate mt-0.5">
            {item.subtitle}
          </p>
        ) : null}
        <div className="flex items-center gap-0.5 mt-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3 h-3 ${
                s <= stars
                  ? "text-primary fill-primary"
                  : "text-on-surface-variant/30"
              }`}
            />
          ))}
        </div>
      </div>
    </a>
  );
};
