import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/layout/app-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-8 md:py-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
