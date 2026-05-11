interface PostCaptionProps {
  content: string;
  hashtags: string[];
}

export function PostCaption({ content, hashtags }: PostCaptionProps) {
  if (!content && (!hashtags || hashtags.length === 0)) return null;

  return (
    <div>
      <p className="text-foreground/65 text-[13.5px] leading-relaxed">
        {content}
      </p>
      {hashtags && hashtags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="text-primary/75 hover:text-primary cursor-pointer text-[11px]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
