import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
