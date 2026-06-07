import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-4 py-4 sm:px-6">
        <Link href="/" className="text-base font-semibold text-foreground hover:text-primary">
          ← The Architect
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        {children}
      </div>
    </div>
  );
}
