type StatCardProps = {
  label: string;
  value: string | number;
};

export const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <div className="rounded-xl bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
      <p className="label-md">{label}</p>
      <p className="mt-2 font-headline text-3xl font-bold text-primary">
        {value}
      </p>
    </div>
  );
};
