import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?:    string;
  desc?:     string;
  children:  React.ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  desc,
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden mb-4",
        className
      )}
    >
      {(title || desc) && (
        <div className="px-5 py-4 border-b border-border">
          {title && (
            <p className="text-[15px] font-bold text-card-foreground leading-tight">
              {title}
            </p>
          )}
          {desc && (
            <p className=" text-[11.5px] text-foreground/50 mt-1">
              {desc}
            </p>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}