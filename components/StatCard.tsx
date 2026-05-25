type StatCardProps = {
  label: string;
  value: string | number;
  trend?: string;
};

export const StatCard = ({ label, value, trend }: StatCardProps) => {
  return (
    <div className="rounded-xl bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
      <div className="flex items-start justify-between">
        <p className="label-md">{label}</p>
        {trend ? (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
            <span className="text-xs leading-none">&#8593;</span>
            {trend}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-headline text-3xl font-bold text-primary">
        {value}
      </p>
    </div>
  );
};
