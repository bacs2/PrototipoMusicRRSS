type MediaCardProps = {
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  type: "album" | "artista";
  href?: string;
  rating?: number;
};

export const MediaCard = ({
  imageUrl,
  title,
  subtitle,
  type,
  href,
  rating,
}: MediaCardProps) => {
  const isArtist = type === "artista";

  const Tag = href ? "a" : "div";

  return (
    <Tag
      {...(href ? { href } : {})}
      className="group cursor-pointer"
    >
      <div
        className={`relative aspect-square overflow-hidden ${
          isArtist ? "rounded-full" : "rounded-xl"
        } transition-opacity duration-200 group-hover:opacity-80`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
            <span className="text-on-surface-variant font-headline text-4xl font-bold opacity-30">
              {isArtist ? "👤" : "💿"}
            </span>
          </div>
        )}
        {!isArtist && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <p className="font-headline text-sm font-bold text-white truncate">
                {title}
              </p>
              {subtitle ? (
                <p className="text-xs text-white/70 mt-0.5 truncate">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </>
        )}
        {rating !== undefined ? (
          <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
            {rating.toFixed(1)}
          </div>
        ) : null}
      </div>
      <div className={isArtist ? "text-center mt-3" : "mt-3"}>
        <h3 className="font-headline text-base font-bold truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-sm text-on-surface-variant truncate mt-0.5">
            {subtitle}
          </p>
        ) : null}
      </div>
    </Tag>
  );
};
