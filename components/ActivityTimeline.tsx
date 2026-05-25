import type { TimelineItem } from "../types/models";

type ActivityTimelineProps = {
  items: TimelineItem[];
};

export const ActivityTimeline = ({ items }: ActivityTimelineProps) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="relative flex gap-4 pb-6">
            <div className="flex flex-col items-center">
              <div className="z-10 flex h-6 w-6 items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
              </div>
              {!isLast ? (
                <div className="w-px flex-1 bg-outline-variant/20" />
              ) : null}
            </div>
            <div className="flex-1 -mt-0.5 min-w-0">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="label-md shrink-0">{item.date}</span>
                {item.user ? (
                  <>
                    <span className="mx-1 text-on-surface-variant/40">·</span>
                    <span className="truncate font-medium text-on-surface">
                      {item.user.name}
                    </span>
                  </>
                ) : null}
              </div>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {item.action}
              </p>
              {item.description ? (
                <p className="text-sm text-on-surface-variant/60 italic mt-1 line-clamp-2">
                  &ldquo;{item.description}&rdquo;
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
