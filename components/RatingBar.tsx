type RatingBarProps = {
  stars: number;
  percentage: number;
  count?: number;
};

export const RatingBar = ({ stars, percentage, count }: RatingBarProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm text-on-surface-variant shrink-0 text-right">
        {stars} {stars === 1 ? "estrella" : "estrellas"}
      </span>
      <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-10 text-sm text-on-surface-variant shrink-0">
        {percentage}%
      </span>
      {count !== undefined ? (
        <span className="w-6 text-xs text-on-surface-variant/50 shrink-0 text-right">
          {count}
        </span>
      ) : null}
    </div>
  );
};
