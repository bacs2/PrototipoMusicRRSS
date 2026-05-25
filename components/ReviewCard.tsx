import { User, ThumbsUp, MessageCircle } from "lucide-react";

type ReviewCardProps = {
  title: string;
  subtitle: string;
  rating: number;
  comment?: string | null;
  meta?: string;
  avatar?: string | null;
  likes?: number;
  replies?: number;
};

export const ReviewCard = ({
  title,
  subtitle,
  rating,
  comment,
  meta,
  avatar,
  likes,
  replies,
}: ReviewCardProps) => {
  return (
    <article className="rounded-2xl bg-surface-container-low p-6">
      <div className="flex items-start gap-4">
        {avatar !== undefined ? (
          avatar ? (
            <img
              src={avatar}
              alt={title}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-on-surface-variant" />
            </div>
          )
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-md">{subtitle}</p>
              <h3 className="font-headline text-lg font-bold truncate">{title}</h3>
              {meta ? (
                <p className="text-sm text-on-surface-variant">{meta}</p>
              ) : null}
            </div>
            <div className="rounded-full bg-surface-container-highest px-3 py-1 text-sm font-semibold shrink-0">
              {rating.toFixed(1)}
            </div>
          </div>
          {comment ? (
            <p className="mt-3 text-sm text-on-surface-variant italic leading-relaxed">
              &ldquo;{comment}&rdquo;
            </p>
          ) : null}
          {likes !== undefined || replies !== undefined ? (
            <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
              {likes !== undefined ? (
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {likes}
                </span>
              ) : null}
              {replies !== undefined ? (
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {replies}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
