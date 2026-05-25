"use client";

import type { TrendingItem } from "../types/models";

const PLACEHOLDER_ITEMS: TrendingItem[] = [
  { id: "1", title: "Motomami", subtitle: "Rosalía", rating: 8.5, reviewCount: 234 },
  { id: "2", title: "Un Verano Sin Ti", subtitle: "Bad Bunny", rating: 9.2, reviewCount: 189 },
  { id: "3", title: "After Hours", subtitle: "The Weeknd", rating: 8.8, reviewCount: 156 },
  { id: "4", title: "BRAT", subtitle: "Charli XCX", rating: 7.5, reviewCount: 98 },
  { id: "5", title: "Midnights", subtitle: "Taylor Swift", rating: 8.0, reviewCount: 212 },
];

export const TrendingCarousel = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h2 className="font-headline text-2xl font-black text-white">Trending</h2>
        <span className="font-serif italic text-purple-400 text-2xl">Now</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {PLACEHOLDER_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square w-[180px] shrink-0 snap-start lg:w-[200px]"
          >
            <div className="absolute -inset-2 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#121214]">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container-highest">
                <span className="font-headline text-5xl font-bold text-on-surface-variant opacity-30">
                  💿
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-headline text-sm font-bold text-white truncate">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="text-xs text-white/70 mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
              {item.rating !== undefined ? (
                <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
                  {item.rating.toFixed(1)}
                </div>
              ) : null}
              <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-zinc-400">
                {item.reviewCount} reseñas
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
