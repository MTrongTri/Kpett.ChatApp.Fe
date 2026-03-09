import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function NavIconBtn({
  icon,
  tooltip,
  badgeCount,
  onClick,
}: {
  icon: React.ReactNode;
  tooltip: string;
  badgeCount?: number;
  onClick?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="
              relative h-9 w-9 rounded-md
              bg-zinc-900 border-zinc-700 text-zinc-400
              hover:bg-zinc-800 hover:border-primary/60 hover:text-zinc-100
              transition-all duration-150
            "
          >
            {icon}
            {badgeCount && badgeCount > 0 ? (
              <span className="
                m-0
                absolute -top-1 -right-1
                h-5 w-5 rounded-full
                bg-red-500 border-2 border-zinc-900
                flex items-center justify-center
                text-[9px] font-bold text-white leading-none
              ">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}