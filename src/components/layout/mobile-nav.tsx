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
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title="More" className="pb-24">
        <div className="space-y-1">
          {moreLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-accent-surface text-accent-foreground"
                  : "text-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start gap-3 text-danger hover:bg-danger-surface hover:text-danger"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </Dialog>

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
