import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";


export default function GuestThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-9 shrink-0" />;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    title="Chế độ giao diện"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent outline-none text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                    {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 bg-background border-foreground/5 shadow-md">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer gap-2 rounded-lg py-2 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                    <Sun size={14} className="text-muted-foreground" /> Sáng
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer gap-2 rounded-lg py-2 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                    <Moon size={14} className="text-muted-foreground" /> Tối
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="cursor-pointer gap-2 rounded-lg py-2 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                    <Monitor size={14} className="text-muted-foreground" /> Hệ thống
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
