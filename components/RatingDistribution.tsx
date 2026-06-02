import { Star } from "lucide-react";
import type { RatingBucket } from "../services/queries";

type Props = {
  buckets: RatingBucket[];
};

function HalfStars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value % 1 !== 0;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) {
          return <Star key={i} className="h-3 w-3 fill-primary text-primary" />;
        }
        if (i === full && half) {
          return (
            <div key={i} className="relative h-3 w-3">
              <Star className="h-3 w-3 text-on-surface-variant/30" />
              <div className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
            </div>
          );
        }
        return <Star key={i} className="h-3 w-3 text-on-surface-variant/30" />;
      })}
    </div>
  );
}

export function RatingDistribution({ buckets }: Props) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="rounded-2xl bg-surface-container-low p-5 space-y-4">
      <div>
        <p className="label-md">Estadísticas</p>
        <h2 className="font-headline text-2xl font-black text-on-surface">
          Distribución de ratings
        </h2>
      </div>

      <div className="space-y-2">
        {buckets.map((bucket) => {
          const pct = total === 0 ? 0 : Math.round((bucket.count / total) * 100);
          const barWidth = total === 0 ? 0 : (bucket.count / maxCount) * 100;

          return (
            <div key={bucket.dbValue} className="flex items-center gap-3">
              <div className="w-28 shrink-0 flex items-center justify-end gap-1.5">
                <span className="text-xs font-semibold text-on-surface-variant tabular-nums">
                  {bucket.displayValue.toFixed(1)}
                </span>
                <HalfStars value={bucket.displayValue} />
              </div>

              <div className="flex-1 h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="w-16 shrink-0 flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface tabular-nums w-5 text-right">
                  {bucket.count}
                </span>
                <span className="text-[10px] text-on-surface-variant/60 tabular-nums">
                  {total > 0 ? `${pct}%` : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {total > 0 && (
        <p className="text-xs text-on-surface-variant/60 text-right pt-1">
          {total} reseña{total !== 1 ? "s" : ""} en total
        </p>
      )}
    </div>
  );
}
