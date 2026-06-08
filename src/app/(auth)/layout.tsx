import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="safe-top px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>
      <div className="flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:items-center sm:pt-0">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="mb-8 flex justify-center mt-4 sm:mt-0">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-stone-200/50 dark:border-stone-800/80 shadow-lg bg-stone-900">
              <img src="/logo.png" alt="The Architect Logo" className="h-full w-full object-cover" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
