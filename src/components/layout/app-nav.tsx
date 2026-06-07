"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vault", label: "Vault" },
  { href: "/brain-dump", label: "Brain Dump" },
  { href: "/priority-goals", label: "Priority Goals" },
  { href: "/weekly-review", label: "Weekly Review" },
  { href: "/journal", label: "Journal" },
  { href: "/reading", label: "Reading" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md safe-top">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <Link href="/dashboard" className="min-w-0 shrink">
          <p className="truncate text-base font-semibold text-foreground sm:text-lg">The Architect</p>
          <p className="hidden truncate text-xs text-muted sm:block">
            Become the person who achieves your goals
          </p>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "min-h-10 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(pathname, link.href)
                  ? "bg-accent-surface text-accent-foreground"
                  : "text-muted hover:bg-stone-100 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="hidden shrink-0 lg:inline-flex"
        >
          Sign out
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="shrink-0 lg:hidden"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Tablet: horizontal scroll nav */}
      <nav
        className="hidden border-t border-border px-4 py-2 md:block lg:hidden"
        aria-label="Tablet navigation"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 min-h-10 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                isActive(pathname, link.href)
                  ? "bg-accent-surface text-accent-foreground"
                  : "text-muted hover:bg-stone-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
