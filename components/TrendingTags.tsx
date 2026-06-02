const TAGS = [
  "Reggaeton",
  "Pop",
  "Alternativo",
  "Jazz",
  "Electrónica",
  "Indie",
  "Hip-Hop",
  "Rock",
  "R&B",
  "Soul",
];

export const TrendingTags = () => {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5">
      <p className="label-md mb-4">Trending Tags</p>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className="rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-xs text-on-surface-variant transition-colors hover:border-primary hover:text-on-surface"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
