import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function NavIconBtn({
  icon,
  tooltip,
  badgeCount,
  onClick,
  className, // Thêm prop className để tùy biến bên ngoài nếu cần
}: {
  icon: React.ReactNode;
  tooltip: string;
  badgeCount?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={cn(
              "relative h-9 w-9 rounded-md transition-all duration-200",
              "bg-white dark:bg-zinc-900",
              "border-zinc-200 dark:border-zinc-700",
              "text-zinc-600 dark:text-zinc-400",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              "hover:border-primary/50 dark:hover:border-primary/60",
              "hover:text-zinc-900 dark:hover:text-zinc-100",
              className
            )}
          >
            {icon}
            
            {/* Badge Notification */}
            {badgeCount !== undefined && badgeCount > 0 && (
              <span className="
                absolute -top-1.5 -right-1.5
                h-5 w-5 rounded-full
                bg-red-500 
                dark:border-zinc-950
                flex items-center justify-center
                text-[10px] font-bold text-white leading-none
                shadow-sm
                animate-in zoom-in duration-300
              ">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        
        <TooltipContent
          side="bottom"
          className="
            bg-zinc-900 dark:bg-zinc-800 
            border-zinc-800 dark:border-zinc-700 
            text-zinc-100 text-[11px] font-medium
            shadow-xl
          "
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}