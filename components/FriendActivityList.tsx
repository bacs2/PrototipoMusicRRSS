"use client";

import type { FriendActivityItem } from "../types/models";
import { CardCarousel } from "./CardCarousel";

const PLACEHOLDER_ITEMS: FriendActivityItem[] = [
  { id: "1", userName: "Ana", userAvatar: null, action: "reseñó", itemTitle: "Motomami", itemCover: null, rating: 9.0 },
  { id: "2", userName: "Carlos", userAvatar: null, action: "ranked", itemTitle: "Un Verano Sin Ti", itemCover: null, rating: 8.5 },
  { id: "3", userName: "Sofía", userAvatar: null, action: "reseñó", itemTitle: "After Hours", itemCover: null, rating: 7.0 },
  { id: "4", userName: "Luis", userAvatar: null, action: "ranked", itemTitle: "BRAT", itemCover: null, rating: 9.5 },
  { id: "5", userName: "Marta", userAvatar: null, action: "reseñó", itemTitle: "Midnights", itemCover: null, rating: 8.0 },
];

export const FriendActivityList = () => {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-xl font-black text-white">
        Friend Activity
      </h2>
      <CardCarousel>
        {PLACEHOLDER_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square w-[180px] shrink-0 snap-center lg:w-[200px]"
          >
            <div className="relative h-full w-full overflow-hidden bg-[#121214]">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container-highest">
                <span className="font-headline text-4xl font-bold text-on-surface-variant opacity-30">
                  💿
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="font-headline text-xs font-bold text-white truncate">
                  {item.itemTitle}
                </p>
              </div>
              <div className="absolute top-2 right-2 z-10">
                {item.userAvatar ? (
                  <img
                    src={item.userAvatar}
                    alt={item.userName}
                    className="h-8 w-8 rounded-full border-2 border-[#121214] object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#121214] bg-purple-600 text-[10px] font-bold text-white">
                    {item.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {item.rating !== undefined ? (
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
                  {item.rating.toFixed(1)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </CardCarousel>
    </section>
  );
};
