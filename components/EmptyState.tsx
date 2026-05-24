type EmptyStateProps = {
  title: string;
  description?: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="rounded-2xl bg-surface-container-low p-6 text-on-surface-variant">
      <p className="label-md text-on-surface-variant">{title}</p>
      {description ? <p className="mt-2 text-sm">{description}</p> : null}
    </div>
  );
};
