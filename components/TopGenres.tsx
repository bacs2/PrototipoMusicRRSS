import type { GenreCount } from "../services/queries";

type Props = {
  genres: GenreCount[];
};

export function TopGenres({ genres }: Props) {
  const max = genres[0]?.count ?? 1;

  return (
    <div className="rounded-2xl bg-[#121214] p-5 space-y-4">
      <div>
        <p className="label-md">Estadísticas</p>
        <h2 className="font-headline text-2xl font-black text-on-surface">
          Géneros más escuchados
        </h2>
      </div>

      {genres.length === 0 && (
        <p className="text-sm text-zinc-600">Sin datos de géneros todavía.</p>
      )}
      <div className="space-y-3">
        {genres.map((g, i) => (
          <div key={g.genre} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-xs font-bold text-zinc-600 tabular-nums text-right">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-on-surface truncate">
                  {g.genre}
                </span>
                <span className="text-xs text-zinc-500 tabular-nums ml-2 shrink-0">
                  {g.count}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(g.count / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
