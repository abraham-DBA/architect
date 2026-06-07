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
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(pathname, href)
                  ? "bg-accent-surface text-accent-foreground"
                  : "text-foreground hover:bg-stone-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start gap-3 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </Dialog>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden safe-bottom"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {primaryTabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition",
                  active ? "text-accent-foreground" : "text-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition",
              moreActive || moreOpen ? "text-accent-foreground" : "text-muted"
            )}
          >
            <MoreHorizontal className={cn("h-5 w-5", (moreActive || moreOpen) && "text-primary")} />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
