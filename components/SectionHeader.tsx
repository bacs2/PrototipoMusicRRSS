type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export const SectionHeader = ({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) => {
  return (
    <header className="space-y-2">
      <p className="label-md">{eyebrow}</p>
      <h1 className="font-headline text-3xl font-black tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="text-on-surface-variant text-sm">{description}</p>
      ) : null}
    </header>
  );
};
