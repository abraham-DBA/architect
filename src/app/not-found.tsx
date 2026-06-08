import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center text-center px-4 animate-fade-in-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="mt-8 text-6xl font-bold text-foreground">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Page not found</h2>
      <p className="mt-3 max-w-md text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
    </div>
  );
}
