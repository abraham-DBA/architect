"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Lightbulb,
  Target,
  MoreHorizontal,
  CalendarCheck,
  BookOpen,
  NotebookPen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const primaryTabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: Trophy },
  { href: "/brain-dump", label: "Dump", icon: Lightbulb },
  { href: "/priority-goals", label: "Goals", icon: Target },
] as const;

const moreLinks = [
  { href: "/weekly-review", label: "Weekly Review", icon: CalendarCheck },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/reading", label: "Reading", icon: BookOpen },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreLinks.some((l) => isActive(pathname, l.href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    setMoreOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* iOS-style Action Sheet / Bottom Drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          {/* Action Sheet Container */}
          <div className="absolute inset-x-0 bottom-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-2.5 max-w-md mx-auto animate-slide-up">
            {/* Options Card */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-card/95 dark:bg-stone-900/95 backdrop-blur-md shadow-xl">
              {/* Drag Handle */}
              <div className="py-2.5 flex justify-center">
                <div className="w-9 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
              </div>
              
              {/* Title Header */}
              <div className="text-center text-[10px] font-bold tracking-wider text-muted uppercase pb-2.5 px-4 border-b border-stone-100 dark:border-stone-800/60">
                More Actions
              </div>

              {/* Links List */}
              <div className="flex flex-col">
                {moreLinks.map(({ href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center justify-between px-4 py-3 text-sm font-semibold transition-colors border-b border-stone-100 dark:border-stone-800/60 last:border-b-0",
                        active
                          ? "bg-primary/5 text-primary"
                          : "text-foreground active:bg-stone-100 dark:active:bg-stone-800/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-stone-400 dark:text-stone-500")} />
                        <span>{label}</span>
                      </div>
                      {active && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
                
                {/* Sign Out Action */}
                <button
                  onClick={logout}
                  className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-danger active:bg-danger-surface/40 transition-colors border-t border-stone-100 dark:border-stone-800/60"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            {/* Cancel Card */}
            <button
              onClick={() => setMoreOpen(false)}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-card/95 dark:bg-stone-900/95 backdrop-blur-md text-sm font-bold text-foreground active:bg-stone-100 dark:active:bg-stone-800/50 shadow-md transition-all active:scale-98"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <nav
        className="mobile-floating-nav w-[calc(100%-2rem)] max-w-md border border-stone-200 dark:border-stone-800 bg-background/80 dark:bg-stone-900/80 backdrop-blur-lg rounded-full shadow-lg md:hidden py-1.5 px-2"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around gap-1">
          {primaryTabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-full transition-all duration-200 active:scale-95 flex-1",
                  active
                    ? "bg-stone-200/50 dark:bg-stone-800/60 text-primary"
                    : "text-stone-400 dark:text-stone-500"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-full transition-all duration-200 active:scale-95 flex-1",
              moreActive || moreOpen
                ? "bg-stone-200/50 dark:bg-stone-800/60 text-primary"
                : "text-stone-400 dark:text-stone-500"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
