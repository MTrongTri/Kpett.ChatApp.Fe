"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EDIT_TABS } from "../general/data/edit-profile-data";

export default function Sidebar({ username }: { username: string }) {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-[20%] shrink-0 lg:sticky lg:top-18.5 self-start space-y-4 mb-6 lg:mb-0">
            <nav className="rounded-md border border-border bg-card overflow-hidden">
                {EDIT_TABS.map((tab, i) => {
                    const href = `/${username}/${tab.key}`;
                    const active = pathname === href;

                    return (
                        <Link
                            key={tab.key}
                            href={href}
                            className={cn(
                                "w-full flex items-center gap-2.5 px-4 py-3",
                                "text-sm font-medium",
                                "text-left transition-all duration-150",
                                i > 0 && "border-t border-border",
                                active
                                    ? "bg-primary/8 text-primary"
                                    : "text-foreground/45 hover:text-foreground/70 hover:bg-foreground/4",
                            )}
                        >
                            <tab.icon className="w-5 h-5 shrink-0" />
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}