const METRICS = [
  { label: "Spins", value: "14", accent: "text-white" },
  { label: "Wishlist", value: "08", accent: "text-cyan-400" },
  { label: "Reseñas", value: "03", accent: "text-purple-400" },
  { label: "Likes", value: "21", accent: "text-white" },
];

export const WeekInSound = () => {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5">
      <p className="label-md mb-4">Tu semana en sonido</p>
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col rounded-xl border border-white/5 bg-[#121214] p-4"
          >
            <span className={`text-3xl font-black ${metric.accent}`}>
              {metric.value}
            </span>
            <span className="mt-1 text-xs text-zinc-500">{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
