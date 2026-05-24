type ReviewCardProps = {
  title: string;
  subtitle: string;
  rating: number;
  comment?: string | null;
  meta?: string;
};

export const ReviewCard = ({
  title,
  subtitle,
  rating,
  comment,
  meta,
}: ReviewCardProps) => {
  return (
    <article className="rounded-2xl bg-surface-container-low p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-md">{subtitle}</p>
          <h3 className="font-headline text-lg font-bold">{title}</h3>
          {meta ? <p className="text-sm text-on-surface-variant">{meta}</p> : null}
        </div>
        <div className="rounded-full bg-surface-container-highest px-3 py-1 text-sm font-semibold">
          {rating.toFixed(1)}
        </div>
      </div>
      {comment ? (
        <p className="mt-4 text-sm text-on-surface-variant italic">
          {comment}
        </p>
      ) : null}
    </article>
  );
};
