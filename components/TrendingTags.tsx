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
            className="rounded-full border border-white/10 bg-[#121214] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-purple-500 hover:text-white"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
